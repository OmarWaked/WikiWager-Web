import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });
    }

    const userId = user.id;
    const serviceClient = await createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Get user data
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('today_score, lifetime_score, score_locked, display_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already locked today
    if (userData.score_locked === today) {
      return NextResponse.json({ error: 'Score already locked today' }, { status: 409 });
    }

    const todayScore = userData.today_score || 0;
    const lifetimeScore = userData.lifetime_score || 0;
    const newLifetimeScore = lifetimeScore + todayScore;

    // Update user: add today's score to lifetime, mark locked
    const { error: updateError } = await serviceClient
      .from('users')
      .update({
        lifetime_score: newLifetimeScore,
        score_locked: today,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to lock in score:', updateError);
      return NextResponse.json({ error: 'Failed to lock in score' }, { status: 500 });
    }

    // Upsert leaderboard_daily entry
    await serviceClient
      .from('leaderboard_daily')
      .upsert({
        user_id: userId,
        display_name: userData.display_name,
        score: todayScore,
        date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });

    // Upsert leaderboard_alltime entry
    await serviceClient
      .from('leaderboard_alltime')
      .upsert({
        user_id: userId,
        display_name: userData.display_name,
        score: newLifetimeScore,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    return NextResponse.json({
      lockedScore: todayScore,
      newLifetimeScore,
    });
  } catch (err) {
    console.error('Error in game/lock-in:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
