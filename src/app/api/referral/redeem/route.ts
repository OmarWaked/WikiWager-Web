import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { REFERRAL_BONUS_GUESSES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const code = (body.code as string)?.toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const serviceClient = await createServiceClient();

    // Find referral code
    const { data: codeData, error: codeError } = await serviceClient
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Validate: not own code
    if (codeData.owner_id === userId) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Validate: not already redeemed by this user
    const redeemedBy: string[] = codeData.redeemed_by || [];
    if (redeemedBy.includes(userId)) {
      return NextResponse.json({ error: 'Code already redeemed' }, { status: 409 });
    }

    const ownerId = codeData.owner_id;

    // Grant extra guesses to redeemer
    const { data: redeemerData, error: redeemerError } = await serviceClient
      .from('users')
      .select('extra_guesses, friend_count')
      .eq('id', userId)
      .single();

    if (redeemerError || !redeemerData) {
      return NextResponse.json({ error: 'Redeemer user not found' }, { status: 404 });
    }

    const { error: redeemerUpdateError } = await serviceClient
      .from('users')
      .update({
        extra_guesses: (redeemerData.extra_guesses || 0) + REFERRAL_BONUS_GUESSES,
        friend_count: (redeemerData.friend_count || 0) + 1,
      })
      .eq('id', userId);

    if (redeemerUpdateError) {
      console.error('Failed to update redeemer:', redeemerUpdateError);
      return NextResponse.json({ error: 'Failed to grant bonus' }, { status: 500 });
    }

    // Grant extra guesses to referrer (owner)
    const { data: ownerData, error: ownerError } = await serviceClient
      .from('users')
      .select('extra_guesses, friend_count')
      .eq('id', ownerId)
      .single();

    if (ownerError || !ownerData) {
      console.error('Owner user not found:', ownerError);
    } else {
      await serviceClient
        .from('users')
        .update({
          extra_guesses: (ownerData.extra_guesses || 0) + REFERRAL_BONUS_GUESSES,
          friend_count: (ownerData.friend_count || 0) + 1,
        })
        .eq('id', ownerId);
    }

    // Update referral code: add to redeemed_by, increment count
    const updatedRedeemedBy = [...redeemedBy, userId];
    await serviceClient
      .from('referral_codes')
      .update({
        redeemed_by: updatedRedeemedBy,
        redemption_count: (codeData.redemption_count || 0) + 1,
      })
      .eq('code', code);

    // Create bidirectional friend relationship
    await serviceClient
      .from('friends')
      .upsert([
        {
          user_id: userId,
          friend_id: ownerId,
          via: 'referral',
          added_at: new Date().toISOString(),
        },
        {
          user_id: ownerId,
          friend_id: userId,
          via: 'referral',
          added_at: new Date().toISOString(),
        },
      ], { onConflict: 'user_id,friend_id' });

    return NextResponse.json({
      success: true,
      bonusGuesses: REFERRAL_BONUS_GUESSES,
    });
  } catch (err) {
    console.error('Error in referral/redeem:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
