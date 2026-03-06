import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    // Find users who played yesterday but did NOT lock in their score
    // These users lose their daily progress
    const { data: unlockedUsers, error: unlockedError } = await serviceClient
      .from('users')
      .select('id')
      .eq('last_played_date', yesterdayStr)
      .or(`score_locked.is.null,score_locked.neq.${today}`);

    if (unlockedError) {
      console.error('Failed to query unlocked users:', unlockedError);
      return NextResponse.json({ error: 'Failed to query users' }, { status: 500 });
    }

    let resetCount = 0;

    // Reset unlocked users
    if (unlockedUsers && unlockedUsers.length > 0) {
      const unlockedIds = unlockedUsers.map(u => u.id);
      const { error: resetError } = await serviceClient
        .from('users')
        .update({
          today_score: 0,
          today_tries: 0,
          current_streak: 0,
        })
        .in('id', unlockedIds);

      if (resetError) {
        console.error('Failed to reset unlocked users:', resetError);
      } else {
        resetCount += unlockedIds.length;
      }
    }

    // Find users who locked in yesterday — reset their daily state too
    const { data: lockedUsers, error: lockedError } = await serviceClient
      .from('users')
      .select('id')
      .eq('score_locked', yesterdayStr);

    if (lockedError) {
      console.error('Failed to query locked users:', lockedError);
    }

    if (lockedUsers && lockedUsers.length > 0) {
      const lockedIds = lockedUsers.map(u => u.id);
      const { error: resetLockedError } = await serviceClient
        .from('users')
        .update({
          today_score: 0,
          today_tries: 0,
          current_streak: 0,
          score_locked: null,
        })
        .in('id', lockedIds);

      if (resetLockedError) {
        console.error('Failed to reset locked users:', resetLockedError);
      } else {
        resetCount += lockedIds.length;
      }
    }

    // Clear old daily leaderboard entries (older than yesterday)
    await serviceClient
      .from('leaderboard_daily')
      .delete()
      .lt('date', yesterdayStr);

    return NextResponse.json({
      success: true,
      resetCount,
    });
  } catch (err) {
    console.error('Error in cron/daily-reset:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
