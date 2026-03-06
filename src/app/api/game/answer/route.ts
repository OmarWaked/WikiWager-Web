import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  BASE_POINTS,
  STREAK_MULTIPLIER,
  DIFFICULTIES,
  Difficulty,
} from '@/lib/constants';

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
    const { roundNumber, selectedPageId, difficulty: difficultyKey } = body;
    const difficulty: Difficulty = difficultyKey || 'normal';

    if (typeof roundNumber !== 'number' || !selectedPageId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (!(difficulty in DIFFICULTIES)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 });
    }

    const difficultyMultiplier = DIFFICULTIES[difficulty].multiplier;
    const serviceClient = await createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Look up correct answer
    const { data: answerData, error: answerError } = await serviceClient
      .from('game_answers')
      .select('correct_page_id')
      .eq('id', `${userId}-${today}-${roundNumber}`)
      .single();

    if (answerError || !answerData) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const correctPageId = answerData.correct_page_id;
    const isCorrect = selectedPageId === correctPageId;

    // Get user data
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('today_score, today_tries, current_streak, best_streak, base_guesses, extra_guesses, total_correct, total_wrong, lifetime_score, display_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentStreak = userData.current_streak || 0;
    const todayTries = userData.today_tries || 0;
    const todayScore = userData.today_score || 0;
    const baseGuesses = userData.base_guesses || 0;
    const extraGuesses = userData.extra_guesses || 0;
    const totalAvailable = baseGuesses + extraGuesses;

    // Check tries BEFORE processing (only matters for wrong answers)
    if (!isCorrect && totalAvailable <= 0) {
      return NextResponse.json({ error: 'No tries remaining' }, { status: 429 });
    }

    const pointsEarned = isCorrect
      ? Math.floor(BASE_POINTS * Math.pow(STREAK_MULTIPLIER, currentStreak)) * difficultyMultiplier
      : 0;

    // Build update object
    const updateData: Record<string, any> = {
      last_played_date: today,
    };

    if (isCorrect) {
      updateData.current_streak = currentStreak + 1;
      updateData.today_score = todayScore + pointsEarned;
      updateData.best_streak = Math.max(userData.best_streak || 0, currentStreak + 1);
      updateData.total_correct = (userData.total_correct || 0) + 1;
    } else {
      updateData.current_streak = 0;
      updateData.today_tries = todayTries + 1;
      updateData.total_wrong = (userData.total_wrong || 0) + 1;

      // Deduct from base_guesses first, then extra_guesses
      if (baseGuesses > 0) {
        updateData.base_guesses = baseGuesses - 1;
      } else if (extraGuesses > 0) {
        updateData.extra_guesses = extraGuesses - 1;
      }

      // If no tries remaining after this wrong answer, game over — reset score
      const newTotalAvailable = (updateData.base_guesses ?? baseGuesses) + (updateData.extra_guesses ?? extraGuesses);
      if (newTotalAvailable <= 0) {
        updateData.today_score = 0;
      }
    }

    // Update user stats
    const { error: updateError } = await serviceClient
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      return NextResponse.json({ error: 'Failed to update user stats' }, { status: 500 });
    }

    // Record in game_sessions
    await serviceClient
      .from('game_sessions')
      .upsert({
        id: `${userId}-${today}-${roundNumber}`,
        user_id: userId,
        date: today,
        round_number: roundNumber,
        selected_page_id: selectedPageId,
        correct_page_id: correctPageId,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        streak: isCorrect ? currentStreak + 1 : 0,
        difficulty,
        created_at: new Date().toISOString(),
      });

    // Update leaderboard_daily entry
    const newTodayScore = isCorrect ? todayScore + pointsEarned : (updateData.today_score ?? todayScore);
    await serviceClient
      .from('leaderboard_daily')
      .upsert({
        user_id: userId,
        display_name: userData.display_name,
        score: newTodayScore,
        date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    // Fetch correct page title for response
    const { data: correctPage } = await serviceClient
      .from('wiki_pages')
      .select('title')
      .eq('id', correctPageId)
      .single();

    // Calculate tries remaining
    const remainingBase = updateData.base_guesses ?? baseGuesses;
    const remainingExtra = updateData.extra_guesses ?? extraGuesses;
    const triesRemaining = remainingBase + remainingExtra;

    return NextResponse.json({
      isCorrect,
      pointsEarned,
      newStreak: isCorrect ? currentStreak + 1 : 0,
      correctPageId,
      correctPageTitle: correctPage?.title || null,
      triesRemaining: Math.max(0, triesRemaining),
    });
  } catch (err) {
    console.error('Error in game/answer:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
