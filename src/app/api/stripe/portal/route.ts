import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST() {
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

    // Look up Stripe customer ID from purchases
    const { data: purchase } = await supabase
      .from('purchases')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let customerId = purchase?.stripe_customer_id;

    // If no existing customer, create one
    if (!customerId) {
      const customer = await getStripe().customers.create({
        metadata: { userId: user.id },
        email: user.email ?? undefined,
      });
      customerId = customer.id;
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/store`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
