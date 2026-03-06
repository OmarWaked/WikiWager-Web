'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { formatNumber, generateShareText } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { StreakBadge } from '@/components/ui/StreakBadge';
import Link from 'next/link';

export function ScoreLocked() {
  const user = useUserStore((s) => s.user);
  const roundResults = useGameStore((s) => s.roundResults);
  const difficulty = useGameStore((s) => s.difficulty);

  const todayScore = user?.today_score ?? 0;
  const lifetimeScore = user?.lifetime_score ?? 0;
  const streak = user?.current_streak ?? 0;

  const handleShare = async () => {
    const dayNumber = Math.floor(
      (Date.now() - new Date('2024-01-01').getTime()) / 86400000,
    );
    const text = generateShareText(
      dayNumber,
      todayScore,
      streak,
      roundResults,
      difficulty,
      true,
    );

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      if (navigator.share) {
        await navigator.share({ text });
      }
    }
  };

  return (
    <motion.div
      className="space-y-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Lock icon animation */}
      <div className="pt-8 flex justify-center">
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <div className="w-[120px] h-[120px] rounded-full bg-gold-flash/15 flex items-center justify-center glow-gold">
            <motion.span
              className="text-5xl"
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              🔒
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        className="text-3xl font-bold text-gradient-gold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Score Locked In!
      </motion.h2>

      {/* Points added */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-soft-white text-lg">
          <span className="text-gold-flash font-bold text-2xl">
            +{formatNumber(todayScore)}
          </span>{' '}
          <span className="text-muted-gray">added to lifetime</span>
        </p>
        <p className="text-sm font-mono text-muted-gray">
          Lifetime: {formatNumber(lifetimeScore)}
        </p>
      </motion.div>

      {/* Streak */}
      <div className="flex justify-center">
        <StreakBadge streak={streak} size="lg" />
      </div>

      {/* Shareable result card preview */}
      <motion.div
        className="glass rounded-2xl p-5 mx-auto max-w-sm space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-sm font-bold text-soft-white">🧠 WikiWager</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gold-flash">💰 {formatNumber(todayScore)} pts</span>
          <span className="text-hot-coral">🔥 {streak} streak</span>
        </div>
        {roundResults.length > 0 && (
          <div className="flex justify-center gap-1">
            {roundResults.map((correct, i) => (
              <span key={i} className="text-base">
                {correct ? '🟢' : '🔴'}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-gray">🔒 Locked In!</p>
      </motion.div>

      {/* Share button */}
      <NeonButton onClick={handleShare} variant="cyan" size="lg" className="w-full">
        <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Result
      </NeonButton>

      {/* View leaderboard link */}
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-2 text-sm text-neon-violet hover:text-neon-violet-light transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        View Leaderboard
      </Link>

      {/* Countdown timer */}
      {user?.next_reset_time && (
        <div className="glass rounded-2xl p-4">
          <CountdownTimer
            targetTime={user.next_reset_time}
            label="Next daily reset"
            onComplete={() => {
              useUserStore.getState().fetchUser();
              useGameStore.getState().resetForNewDay();
            }}
          />
        </div>
      )}

      {/* Come back message */}
      <p className="text-sm text-muted-gray">
        Come back tomorrow for more wagers!
      </p>
    </motion.div>
  );
}
