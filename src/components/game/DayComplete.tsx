'use client';

import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { cn, formatNumber, generateShareText } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function DayComplete() {
  const lockInScore = useGameStore((s) => s.lockInScore);
  const roundResults = useGameStore((s) => s.roundResults);
  const difficulty = useGameStore((s) => s.difficulty);
  const user = useUserStore((s) => s.user);

  const todayScore = user?.today_score ?? 0;
  const streak = user?.current_streak ?? 0;
  const isScoreLocked = user?.score_locked
    ? new Date(user.score_locked).toDateString() === new Date().toDateString()
    : false;

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
      isScoreLocked,
    );

    try {
      await navigator.clipboard.writeText(text);
      // Could integrate with uiStore toast here
    } catch {
      // Fallback: use share API if available
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
      {/* Skull icon */}
      <div className="pt-8">
        <motion.span
          className="text-6xl inline-block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          💀
        </motion.span>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-hot-coral">
          Daily Plays Complete!
        </h2>
        <p className="text-sm text-muted-gray">
          {isScoreLocked
            ? 'Your score is locked in for today.'
            : 'Your daily score was lost.\nCome back tomorrow or buy more guesses.'}
        </p>
      </div>

      {/* Today's score */}
      <div className="glass rounded-2xl p-6 space-y-3">
        <p className="text-xs font-mono text-muted-gray uppercase tracking-wider">
          Today&apos;s Score
        </p>
        <p className="text-4xl font-bold text-gold-flash">
          {formatNumber(todayScore)}
        </p>

        {/* Streak */}
        <div className="flex justify-center">
          <StreakBadge streak={streak} size="lg" />
        </div>

        {/* Round results */}
        {roundResults.length > 0 && (
          <div className="flex justify-center gap-1.5 pt-2">
            {roundResults.map((correct, i) => (
              <span
                key={i}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  correct
                    ? 'bg-electric-cyan/20 text-electric-cyan'
                    : 'bg-hot-coral/20 text-hot-coral',
                )}
              >
                {correct ? '✓' : '✗'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Warning if not locked */}
      {!isScoreLocked && todayScore > 0 && (
        <motion.p
          className="text-sm text-hot-coral font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          ⚠️ Lock in your score to save it!
        </motion.p>
      )}

      {/* Lock in button */}
      {!isScoreLocked && todayScore > 0 && (
        <NeonButton
          onClick={lockInScore}
          variant="gold"
          size="lg"
          className="w-full glow-gold"
        >
          <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Lock In {formatNumber(todayScore)} pts
        </NeonButton>
      )}

      {/* Get more guesses */}
      <Link href="/store">
        <NeonButton variant="violet" size="lg" className="w-full">
          <span className="mr-1.5">🛒</span>
          Get More Guesses
        </NeonButton>
      </Link>

      {/* Countdown timer */}
      {user?.next_reset_time && (
        <div className="glass rounded-2xl p-4">
          <CountdownTimer
            targetTime={user.next_reset_time}
            label="Next guess deposit"
            onComplete={() => useUserStore.getState().fetchUser()}
          />
        </div>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className="text-sm text-muted-gray hover:text-electric-cyan transition-colors flex items-center justify-center gap-2 w-full py-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Result
      </button>
    </motion.div>
  );
}
