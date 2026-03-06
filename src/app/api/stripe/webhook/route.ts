import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { PRODUCT_DETAILS } from '@/lib/constants';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Create a Supabase service client without cookies (for webhook context)
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op in webhook context
        },
      },
    },
  );
}

async function grantPurchaseItems(userId: string, productId: string) {
  const supabase = createServiceClient();
  const details = PRODUCT_DETAILS[productId as keyof typeof PRODUCT_DETAILS];

  if (!details) {
    console.error(`[webhook] Unknown productId: ${productId}`);
    return;
  }

  // Handle subscription products
  if (productId === 'weeklyPass') {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    await supabase
      .from('users')
      .update({
        has_weekly_pass: true,
        weekly_pass_expiry: expiry.toISOString(),
        extra_guesses: details.guesses, // Reset weekly guesses
      })
      .eq('id', userId);

    return;
  }

  if (productId === 'monthlyVIP') {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    await supabase
      .from('users')
      .update({
        is_vip: true,
        vip_expiry: expiry.toISOString(),
        extra_guesses: details.guesses,
        streak_shields: details.shields,
        revenge_tokens: details.revenge,
      })
      .eq('id', userId);

    return;
  }

  // Handle consumable products (guesses, shields, revenge, bundles)
  // Fetch current values to increment
  const { data: userData, error } = await supabase
    .from('users')
    .select('extra_guesses, streak_shields, revenge_tokens')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    console.error(`[webhook] Failed to fetch user ${userId}:`, error);
    return;
  }

  const updates: Record<string, number> = {};

  if (details.guesses > 0) {
    updates.extra_guesses = (userData.extra_guesses || 0) + details.guesses;
  }
  if (details.shields > 0) {
    updates.streak_shields = (userData.streak_shields || 0) + details.shields;
  }
  if (details.revenge > 0) {
    updates.revenge_tokens = (userData.revenge_tokens || 0) + details.revenge;
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from('users').update(updates).eq('id', userId);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('[webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServiceClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const productId = session.metadata?.productId;

        if (!userId || !productId) {
          console.error('[webhook] Missing metadata on session:', session.id);
          break;
        }

        // Grant items to user
        await grantPurchaseItems(userId, productId);

        // Record the purchase
        await supabase.from('purchases').insert({
          user_id: userId,
          product_id: productId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          amount: session.amount_total,
          currency: session.currency,
          status: 'completed',
          created_at: new Date().toISOString(),
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID from purchases
        const { data: purchase } = await supabase
          .from('purchases')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .limit(1)
          .single();

        if (purchase?.user_id) {
          await supabase
            .from('users')
            .update({
              has_weekly_pass: false,
              is_vip: false,
            })
            .eq('id', purchase.user_id);
        }

        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[webhook] Unhandled error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
