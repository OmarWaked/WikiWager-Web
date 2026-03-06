import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// ─── PUT: Accept or decline a challenge ──────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Action must be "accept" or "decline"' },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();

    // Fetch the challenge
    const { data: challenge, error: fetchError } = await serviceClient
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Only the opponent can accept/decline
    if (challenge.opponent_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the opponent can accept or decline' },
        { status: 403 },
      );
    }

    if (challenge.status !== 'pending') {
      return NextResponse.json(
        { error: `Challenge is already ${challenge.status}` },
        { status: 400 },
      );
    }

    // Check if challenge has expired
    if (new Date(challenge.expires_at) < new Date()) {
      // Refund challenger and mark as expired
      await serviceClient.rpc('increment_extra_guesses', {
        user_id_input: challenge.challenger_id,
        amount_input: challenge.wager_amount,
      }).then(({ error: rpcError }) => {
        if (rpcError) {
          // Fallback: manual update
          return serviceClient
            .from('users')
            .select('extra_guesses')
            .eq('id', challenge.challenger_id)
            .single()
            .then(({ data: challengerData }) => {
              if (challengerData) {
                return serviceClient
                  .from('users')
                  .update({ extra_guesses: challengerData.extra_guesses + challenge.wager_amount })
                  .eq('id', challenge.challenger_id);
              }
            });
        }
      });

      await serviceClient
        .from('challenges')
        .update({ status: 'expired' })
        .eq('id', id);

      return NextResponse.json(
        { error: 'Challenge has expired. Wager refunded to challenger.' },
        { status: 400 },
      );
    }

    if (action === 'decline') {
      // Refund wager to challenger
      const { data: challengerData } = await serviceClient
        .from('users')
        .select('extra_guesses')
        .eq('id', challenge.challenger_id)
        .single();

      if (challengerData) {
        await serviceClient
          .from('users')
          .update({
            extra_guesses: challengerData.extra_guesses + challenge.wager_amount,
          })
          .eq('id', challenge.challenger_id);
      }

      // Update challenge status
      const { data: updated, error: updateError } = await serviceClient
        .from('challenges')
        .update({ status: 'declined' })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to decline challenge' },
          { status: 500 },
        );
      }

      return NextResponse.json({ challenge: updated });
    }

    // action === 'accept'
    // Fetch opponent's extra_guesses
    const { data: opponentData, error: opponentError } = await serviceClient
      .from('users')
      .select('extra_guesses')
      .eq('id', user.id)
      .single();

    if (opponentError || !opponentData) {
      return NextResponse.json(
        { error: 'Failed to fetch your profile' },
        { status: 500 },
      );
    }

    if (opponentData.extra_guesses < challenge.wager_amount) {
      return NextResponse.json(
        {
          error: `Not enough extra guesses. You have ${opponentData.extra_guesses}, need ${challenge.wager_amount}.`,
        },
        { status: 400 },
      );
    }

    // Deduct wager from opponent
    const { error: deductError } = await serviceClient
      .from('users')
      .update({
        extra_guesses: opponentData.extra_guesses - challenge.wager_amount,
      })
      .eq('id', user.id);

    if (deductError) {
      return NextResponse.json(
        { error: 'Failed to deduct wager' },
        { status: 500 },
      );
    }

    // Set challenge to active
    const { data: updated, error: updateError } = await serviceClient
      .from('challenges')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to accept challenge' },
        { status: 500 },
      );
    }

    return NextResponse.json({ challenge: updated });
  } catch (err) {
    console.error('Error in PUT /api/challenges/[id]:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── PATCH: Submit challenge score ───────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { score } = body;

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    const serviceClient = await createServiceClient();

    // Fetch the challenge
    const { data: challenge, error: fetchError } = await serviceClient
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.status !== 'active') {
      return NextResponse.json(
        { error: 'Challenge is not active' },
        { status: 400 },
      );
    }

    // Determine which role the user has
    const isChallenger = challenge.challenger_id === user.id;
    const isOpponent = challenge.opponent_id === user.id;

    if (!isChallenger && !isOpponent) {
      return NextResponse.json(
        { error: 'You are not part of this challenge' },
        { status: 403 },
      );
    }

    // Build update payload
    const update: Record<string, unknown> = {};

    if (isChallenger) {
      if (challenge.challenger_score != null) {
        return NextResponse.json(
          { error: 'You already submitted your score' },
          { status: 400 },
        );
      }
      update.challenger_score = score;
    } else {
      if (challenge.opponent_score != null) {
        return NextResponse.json(
          { error: 'You already submitted your score' },
          { status: 400 },
        );
      }
      update.opponent_score = score;
    }

    // Check if both scores will be in after this update
    const challengerScore = isChallenger ? score : challenge.challenger_score;
    const opponentScore = isOpponent ? score : challenge.opponent_score;
    const bothScoresIn =
      challengerScore != null && opponentScore != null;

    if (bothScoresIn) {
      // Resolve the challenge
      update.status = 'completed';

      const wager = challenge.wager_amount;

      if (challengerScore === opponentScore) {
        // Tie: refund both
        const { data: challengerData } = await serviceClient
          .from('users')
          .select('extra_guesses')
          .eq('id', challenge.challenger_id)
          .single();

        const { data: opponentData } = await serviceClient
          .from('users')
          .select('extra_guesses')
          .eq('id', challenge.opponent_id)
          .single();

        if (challengerData) {
          await serviceClient
            .from('users')
            .update({ extra_guesses: challengerData.extra_guesses + wager })
            .eq('id', challenge.challenger_id);
        }

        if (opponentData) {
          await serviceClient
            .from('users')
            .update({ extra_guesses: opponentData.extra_guesses + wager })
            .eq('id', challenge.opponent_id);
        }
      } else {
        // Winner gets 2x wager
        const winnerId =
          challengerScore > opponentScore
            ? challenge.challenger_id
            : challenge.opponent_id;

        const { data: winnerData } = await serviceClient
          .from('users')
          .select('extra_guesses')
          .eq('id', winnerId)
          .single();

        if (winnerData) {
          await serviceClient
            .from('users')
            .update({ extra_guesses: winnerData.extra_guesses + wager * 2 })
            .eq('id', winnerId);
        }
      }
    }

    // Apply the update
    const { data: updated, error: updateError } = await serviceClient
      .from('challenges')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to submit score' },
        { status: 500 },
      );
    }

    return NextResponse.json({ challenge: updated });
  } catch (err) {
    console.error('Error in PATCH /api/challenges/[id]:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
