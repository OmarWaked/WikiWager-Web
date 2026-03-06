import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const VALID_WAGERS = [1, 2, 5, 10] as const;
const VALID_DIFFICULTIES = ['normal', 'hard', 'expert'] as const;

// ─── POST: Create a new challenge ────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const body = await request.json();
    const { opponentId, wagerAmount, difficulty } = body;

    // Validate inputs
    if (!opponentId || typeof opponentId !== 'string') {
      return NextResponse.json({ error: 'Invalid opponent' }, { status: 400 });
    }

    if (!VALID_WAGERS.includes(wagerAmount)) {
      return NextResponse.json(
        { error: 'Wager must be 1, 2, 5, or 10' },
        { status: 400 },
      );
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
    }

    if (opponentId === user.id) {
      return NextResponse.json(
        { error: 'Cannot challenge yourself' },
        { status: 400 },
      );
    }

    const serviceClient = await createServiceClient();

    // Fetch challenger's profile to check extra_guesses
    const { data: challenger, error: challengerError } = await serviceClient
      .from('users')
      .select('id, display_name, avatar_emoji, extra_guesses')
      .eq('id', user.id)
      .single();

    if (challengerError || !challenger) {
      return NextResponse.json(
        { error: 'Failed to fetch your profile' },
        { status: 500 },
      );
    }

    if (challenger.extra_guesses < wagerAmount) {
      return NextResponse.json(
        { error: `Not enough extra guesses. You have ${challenger.extra_guesses}, need ${wagerAmount}.` },
        { status: 400 },
      );
    }

    // Fetch opponent profile
    const { data: opponent, error: opponentError } = await serviceClient
      .from('users')
      .select('id, display_name, avatar_emoji')
      .eq('id', opponentId)
      .single();

    if (opponentError || !opponent) {
      return NextResponse.json({ error: 'Opponent not found' }, { status: 404 });
    }

    // Deduct wager from challenger's extra_guesses
    const { error: deductError } = await serviceClient
      .from('users')
      .update({ extra_guesses: challenger.extra_guesses - wagerAmount })
      .eq('id', user.id);

    if (deductError) {
      return NextResponse.json(
        { error: 'Failed to deduct wager' },
        { status: 500 },
      );
    }

    // Create challenge row
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: challenge, error: createError } = await serviceClient
      .from('challenges')
      .insert({
        challenger_id: user.id,
        challenger_name: challenger.display_name,
        challenger_avatar: challenger.avatar_emoji,
        opponent_id: opponentId,
        opponent_name: opponent.display_name,
        opponent_avatar: opponent.avatar_emoji,
        wager_amount: wagerAmount,
        difficulty,
        status: 'pending',
        game_round_ids: [],
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (createError || !challenge) {
      // Refund the challenger on failure
      await serviceClient
        .from('users')
        .update({ extra_guesses: challenger.extra_guesses })
        .eq('id', user.id);

      return NextResponse.json(
        { error: 'Failed to create challenge' },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: challenge.id, challenge }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/challenges:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ─── GET: List user's challenges ─────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    const { data: challenges, error } = await serviceClient
      .from('challenges')
      .select('*')
      .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenges' },
        { status: 500 },
      );
    }

    return NextResponse.json({ challenges: challenges ?? [] });
  } catch (err) {
    console.error('Error in GET /api/challenges:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
