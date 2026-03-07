import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { AD_REWARDS_PER_DAY } from '@/lib/constants';

const VALID_REWARD_TYPES = ['guess', 'shield', 'revenge'] as const;
type RewardType = typeof VALID_REWARD_TYPES[number];

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { rewardType } = body;

    if (!rewardType || !VALID_REWARD_TYPES.includes(rewardType as RewardType)) {
      return NextResponse.json(
        { error: 'Invalid rewardType. Must be one of: guess, shield, revenge' },
        { status: 400 }
      );
    }

    // Check daily ad reward limit
    const today = new Date().toISOString().split('T')[0];
    const serviceClient = await createServiceClient();

    const { count, error: countError } = await serviceClient
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('product_id', 'ad_reward')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (countError) {
      console.error('Failed to check ad reward count:', countError);
      return NextResponse.json({ error: 'Failed to check reward limit' }, { status: 500 });
    }

    if ((count ?? 0) >= AD_REWARDS_PER_DAY) {
      return NextResponse.json(
        { error: 'Daily ad reward limit reached', limit: AD_REWARDS_PER_DAY },
        { status: 429 }
      );
    }

    // Fetch user's current item counts
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('extra_guesses, streak_shields, revenge_tokens')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Grant the reward item
    const updateData: Record<string, number> = {};
    let message = '';

    switch (rewardType as RewardType) {
      case 'guess':
        updateData.extra_guesses = (userData.extra_guesses || 0) + 1;
        message = 'You earned 1 free guess!';
        break;
      case 'shield':
        updateData.streak_shields = (userData.streak_shields || 0) + 1;
        message = 'You earned 1 free streak shield!';
        break;
      case 'revenge':
        updateData.revenge_tokens = (userData.revenge_tokens || 0) + 1;
        message = 'You earned 1 free revenge token!';
        break;
    }

    const { error: updateError } = await serviceClient
      .from('users')
      .update(updateData)
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to grant ad reward:', updateError);
      return NextResponse.json({ error: 'Failed to grant reward' }, { status: 500 });
    }

    // Log the reward in purchases table
    const { error: purchaseError } = await serviceClient
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: 'ad_reward',
        amount_cents: 0,
        guesses_granted: rewardType === 'guess' ? 1 : 0,
        shields_granted: rewardType === 'shield' ? 1 : 0,
        revenge_granted: rewardType === 'revenge' ? 1 : 0,
      });

    if (purchaseError) {
      console.error('Failed to log ad reward purchase:', purchaseError);
      // Don't return error — the reward was already granted
    }

    return NextResponse.json({
      success: true,
      rewardType,
      message,
      remainingToday: AD_REWARDS_PER_DAY - ((count ?? 0) + 1),
    });
  } catch (err) {
    console.error('Error in store/ad-reward:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
