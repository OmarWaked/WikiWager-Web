import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { GUESSES_PER_RESET, MAX_BASE_GUESSES } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const now = new Date().toISOString();

    // Find users where next_reset_time <= NOW()
    const { data: eligibleUsers, error: queryError } = await serviceClient
      .from('users')
      .select('id, base_guesses')
      .lte('next_reset_time', now);

    if (queryError) {
      console.error('Failed to query eligible users:', queryError);
      return NextResponse.json({ error: 'Failed to query users' }, { status: 500 });
    }

    if (!eligibleUsers || eligibleUsers.length === 0) {
      return NextResponse.json({ success: true, depositCount: 0 });
    }

    let depositCount = 0;
    const nextResetTime = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

    // Update each user individually to respect the cap
    for (const user of eligibleUsers) {
      const currentGuesses = user.base_guesses || 0;
      const newGuesses = Math.min(currentGuesses + GUESSES_PER_RESET, MAX_BASE_GUESSES);

      const { error: updateError } = await serviceClient
        .from('users')
        .update({
          base_guesses: newGuesses,
          next_reset_time: nextResetTime,
        })
        .eq('id', user.id);

      if (!updateError) {
        depositCount++;
      } else {
        console.error(`Failed to deposit guesses for user ${user.id}:`, updateError);
      }
    }

    return NextResponse.json({
      success: true,
      depositCount,
    });
  } catch (err) {
    console.error('Error in cron/deposit-guesses:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
