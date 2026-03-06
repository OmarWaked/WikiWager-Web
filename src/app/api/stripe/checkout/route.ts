import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { PRODUCTS, PRODUCT_DETAILS } from '@/lib/constants';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Product IDs that are subscriptions
const SUBSCRIPTION_PRODUCT_IDS = ['weeklyPass', 'monthlyVIP'] as const;

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, priceId } = body;

    if (!productId || !priceId) {
      return NextResponse.json({ error: 'Missing productId or priceId' }, { status: 400 });
    }

    // Validate productId exists in our constants
    if (!(productId in PRODUCTS)) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const productDetails = PRODUCT_DETAILS[productId as keyof typeof PRODUCT_DETAILS];
    if (!productDetails) {
      return NextResponse.json({ error: 'Product not found' }, { status: 400 });
    }

    const isSubscription = SUBSCRIPTION_PRODUCT_IDS.includes(
      productId as (typeof SUBSCRIPTION_PRODUCT_IDS)[number],
    );

    const session = await getStripe().checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/store?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/store?canceled=true`,
      metadata: {
        userId: user.id,
        productId,
      },
      client_reference_id: user.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
