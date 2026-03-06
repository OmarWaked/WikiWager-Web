import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const {
      dayNumber,
      score,
      streak,
      correctAnswers,
      totalAttempts,
      difficulty,
      isLocked,
      emojiGrid,
    } = body;

    // Validate required fields
    if (dayNumber == null || score == null) {
      return NextResponse.json(
        { error: 'dayNumber and score are required' },
        { status: 400 },
      );
    }

    // Insert shared result
    const { data: result, error: insertError } = await supabase
      .from('shared_results')
      .insert({
        user_id: user.id,
        day_number: dayNumber,
        score: score ?? 0,
        streak: streak ?? 0,
        correct_answers: correctAnswers ?? 0,
        total_attempts: totalAttempts ?? 0,
        difficulty: difficulty ?? 'normal',
        is_locked: isLocked ?? false,
        emoji_grid: emojiGrid ?? [],
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert shared result:', insertError);
      return NextResponse.json(
        { error: 'Failed to save shared result' },
        { status: 500 },
      );
    }

    const shareUrl = `/share/${result.id}`;

    return NextResponse.json({
      id: result.id,
      shareUrl,
    });
  } catch (err) {
    console.error('Error in share route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
