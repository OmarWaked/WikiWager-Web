import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getBotTierFromScore, BOT_TIERS } from '@/lib/constants';

type BotTierProfile = typeof BOT_TIERS[keyof typeof BOT_TIERS];

function simulateRounds(
  profile: BotTierProfile,
  currentStreak: number
): { score: number; newStreak: number; bestStreak: number; rounds: number; correctCount: number; wrongCount: number } {
  const rounds = profile.roundsRange[0] + Math.floor(Math.random() * (profile.roundsRange[1] - profile.roundsRange[0] + 1));
  let streak = currentStreak;
  let bestStreak = currentStreak;
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;

  for (let i = 0; i < rounds; i++) {
    const won = Math.random() < profile.winRate;
    if (won && Math.random() > profile.streakBreakChance) {
      streak++;
      score += Math.floor(100 * Math.pow(1.5, Math.min(streak - 1, 15)));
      correctCount++;
      if (streak > bestStreak) {
        bestStreak = streak;
      }
    } else {
      streak = 0;
      wrongCount++;
    }
  }

  return { score, newStreak: streak, bestStreak, rounds, correctCount, wrongCount };
}

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();
    const today = new Date().toISOString().split('T')[0];

    // Check weekend boost
    const dayOfWeek = new Date().getUTCDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1.0;

    // Fetch all bot users
    const { data: bots, error: botsError } = await serviceClient
      .from('users')
      .select('id, display_name, avatar_emoji, lifetime_score, today_score, current_streak, best_streak, last_played_date, total_correct, total_wrong')
      .eq('is_bot', true);

    if (botsError) {
      console.error('Failed to query bots:', botsError);
      return NextResponse.json({ error: 'Failed to query bots' }, { status: 500 });
    }

    if (!bots || bots.length === 0) {
      return NextResponse.json({ success: true, botsProcessed: 0, botsPlayed: 0, totalScore: 0 });
    }

    // Determine which bots will play today
    const activeBots: typeof bots = [];

    for (const bot of bots) {
      const profile = getBotTierFromScore(bot.lifetime_score || 0);
      const alreadyPlayedToday = bot.last_played_date === today;
      const adjustedPlayChance = alreadyPlayedToday
        ? profile.playChance * 0.3
        : profile.playChance * weekendBoost;

      if (Math.random() < adjustedPlayChance) {
        activeBots.push(bot);
      }
    }

    let botsPlayed = 0;
    let totalScore = 0;

    // Process in batches of 100
    const BATCH_SIZE = 100;

    for (let i = 0; i < activeBots.length; i += BATCH_SIZE) {
      const batch = activeBots.slice(i, i + BATCH_SIZE);

      const userUpdates: PromiseLike<any>[] = [];
      const leaderboardAlltimeUpserts: any[] = [];
      const leaderboardDailyUpserts: any[] = [];

      for (const bot of batch) {
        const profile = getBotTierFromScore(bot.lifetime_score || 0);
        const result = simulateRounds(profile, bot.current_streak || 0);

        const newLifetimeScore = (bot.lifetime_score || 0) + result.score;
        const newTodayScore = (bot.today_score || 0) + result.score;
        const newBestStreak = Math.max(bot.best_streak || 0, result.bestStreak);
        const scoreLocked = result.rounds >= 3 ? today : null;

        // Update user record
        userUpdates.push(
          serviceClient
            .from('users')
            .update({
              today_score: newTodayScore,
              lifetime_score: newLifetimeScore,
              current_streak: result.newStreak,
              best_streak: newBestStreak,
              last_played_date: today,
              score_locked: scoreLocked,
              total_correct: (bot.total_correct || 0) + result.correctCount,
              total_wrong: (bot.total_wrong || 0) + result.wrongCount,
            })
            .eq('id', bot.id)
        );

        leaderboardAlltimeUpserts.push({
          user_id: bot.id,
          display_name: bot.display_name,
          avatar_emoji: bot.avatar_emoji,
          score: newLifetimeScore,
        });

        leaderboardDailyUpserts.push({
          user_id: bot.id,
          display_name: bot.display_name,
          avatar_emoji: bot.avatar_emoji,
          score: newTodayScore,
          date: today,
        });

        botsPlayed++;
        totalScore += result.score;
      }

      // Execute user updates in parallel
      await Promise.all(userUpdates);

      // Upsert leaderboard entries
      if (leaderboardAlltimeUpserts.length > 0) {
        const { error: alltimeError } = await serviceClient
          .from('leaderboard_alltime')
          .upsert(leaderboardAlltimeUpserts, { onConflict: 'user_id' });

        if (alltimeError) {
          console.error('Failed to upsert alltime leaderboard:', alltimeError);
        }
      }

      if (leaderboardDailyUpserts.length > 0) {
        const { error: dailyError } = await serviceClient
          .from('leaderboard_daily')
          .upsert(leaderboardDailyUpserts, { onConflict: 'user_id' });

        if (dailyError) {
          console.error('Failed to upsert daily leaderboard:', dailyError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      botsProcessed: bots.length,
      botsPlayed,
      totalScore,
    });
  } catch (err) {
    console.error('Error in cron/simulate-bots:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
