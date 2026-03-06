'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { cn, formatNumber } from '@/lib/utils';
import { NeonButton } from '@/components/ui/NeonButton';
import { GradientButton } from '@/components/ui/GradientButton';
import { StreakBadge } from '@/components/ui/StreakBadge';

// Pre-computed confetti particles
const confettiParticles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  color: ['#7C3AED', '#06D6A0', '#FFD700', '#EF4444'][i % 4],
  size: 4 + (i % 5),
  xPercent: (i / 24) * 100,
  delay: (i % 6) * 0.08,
  duration: 1.2 + (i % 8) * 0.15,
}));

function getResultTitle(streak: number): string {
  if (streak <= 0) return 'Correct!';
  if (streak === 1) return 'Nice!';
  if (streak === 2) return 'Smart!';
  if (streak === 3) return 'On Fire!';
  if (streak === 4) return 'Genius!';
  if (streak <= 9) return 'Unstoppable!';
  return 'LEGENDARY!';
}

export function ResultView() {
  const lastResult = useGameStore((s) => s.lastResult);
  const nextRound = useGameStore((s) => s.nextRound);
  const lockInScore = useGameStore((s) => s.lockInScore);
  const setDayComplete = useGameStore((s) => s.setDayComplete);
  const user = useUserStore((s) => s.user);

  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 100);
    const confettiTimer = setTimeout(() => setShowConfetti(true), 300);
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(confettiTimer);
    };
  }, []);

  // Refetch user after result to get updated stats
  useEffect(() => {
    useUserStore.getState().fetchUser();
  }, []);

  if (!lastResult) return null;

  const isCorrect = lastResult.isCorrect;
  const triesRemaining = lastResult.triesRemaining;
  const hasTriesLeft = triesRemaining > 0;
  const todayScore = user?.today_score ?? 0;
  const isScoreLocked = user?.score_locked
    ? new Date(user.score_locked).toDateString() === new Date().toDateString()
    : false;

  return (
    <div className="relative space-y-6">
      {/* Confetti overlay (correct only) */}
      {isCorrect && showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {confettiParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, opacity: 1 }}
              animate={{ y: '120%', opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: `${p.xPercent}%`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
              }}
            />
          ))}
        </div>
      )}

      {/* Result icon */}
      <motion.div
        className="flex justify-center pt-6"
        initial={{ scale: 0.3, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <div className="relative">
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              isCorrect ? 'bg-electric-cyan/15' : 'bg-hot-coral/15',
            )}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          />
          <div
            className={cn(
              'relative w-[130px] h-[130px] flex items-center justify-center rounded-full',
              isCorrect ? 'glow-cyan' : 'glow-coral',
            )}
          >
            <svg
              className={cn(
                'w-16 h-16',
                isCorrect ? 'text-electric-cyan' : 'text-hot-coral',
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {isCorrect ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Result text */}
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={showContent ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2
          className={cn(
            'text-3xl font-bold',
            isCorrect ? 'text-electric-cyan' : 'text-hot-coral',
          )}
        >
          {isCorrect ? getResultTitle(lastResult.newStreak) : 'Wrong!'}
        </h2>

        {isCorrect ? (
          <>
            {/* Points earned */}
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.4 }}
            >
              <span className="text-3xl font-bold text-gold-flash">
                +{lastResult.pointsEarned}
              </span>
              <span className="text-sm font-mono text-gold-flash/70">pts</span>
            </motion.div>

            {/* Streak badge */}
            {lastResult.newStreak > 1 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                  <span>🔥</span>
                  <span className="font-bold text-hot-coral">
                    {lastResult.newStreak} streak!
                  </span>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {/* Correct answer */}
            {lastResult.correctPageTitle && (
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-gray">Correct answer:</p>
                <p className="text-lg font-bold text-electric-cyan">
                  {lastResult.correctPageTitle}
                </p>
              </div>
            )}

            {/* Streak lost + tries remaining */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="text-muted-gray flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Streak lost
              </span>
              <span
                className={cn(
                  'font-mono',
                  triesRemaining <= 1 ? 'text-hot-coral' : 'text-muted-gray',
                )}
              >
                {triesRemaining} {triesRemaining === 1 ? 'try' : 'tries'} left
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Updated streak badge */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1 } : {}}
        transition={{ delay: 0.6 }}
      >
        <StreakBadge streak={lastResult.newStreak} size="lg" />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="space-y-3 pt-2"
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1 } : {}}
        transition={{ delay: 0.7 }}
      >
        {/* Next round / Try again */}
        {hasTriesLeft && (
          <NeonButton
            onClick={nextRound}
            variant={isCorrect ? 'cyan' : 'violet'}
            size="lg"
            className="w-full"
          >
            {isCorrect ? 'Next Wager' : 'Try Again'}
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NeonButton>
        )}

        {/* Lock in score */}
        {todayScore > 0 && !isScoreLocked && (
          <GradientButton
            onClick={lockInScore}
            gradient="gold"
            size="lg"
            fullWidth
          >
            <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Lock In {formatNumber(todayScore)} pts
          </GradientButton>
        )}

        {/* No tries left */}
        {!hasTriesLeft && (
          <NeonButton
            onClick={setDayComplete}
            variant="coral"
            size="lg"
            className="w-full"
          >
            Day Complete
          </NeonButton>
        )}

        {/* Back to home */}
        <button
          onClick={() => useGameStore.setState({ gameState: 'idle' })}
          className="w-full text-sm text-muted-gray hover:text-soft-white transition-colors py-2"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}
