'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { DIFFICULTIES } from '@/lib/constants';
import { calculatePoints, cn } from '@/lib/utils';
import { WikiPageCard } from './WikiPageCard';
import { OptionCard } from './OptionCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { StreakBadge } from '@/components/ui/StreakBadge';
import type { Difficulty } from '@/types/game';

export function GameView() {
  const currentRound = useGameStore((s) => s.currentRound);
  const selectedOption = useGameStore((s) => s.selectedOption);
  const selectOption = useGameStore((s) => s.selectOption);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const gameState = useGameStore((s) => s.gameState);
  const difficulty = useGameStore((s) => s.difficulty);
  const user = useUserStore((s) => s.user);

  if (!currentRound) return null;

  const diffConfig = DIFFICULTIES[difficulty];
  const streak = user?.current_streak ?? 0;
  const potentialPoints = calculatePoints(streak, diffConfig.multiplier);
  const isSubmitting = gameState === 'loading';

  return (
    <div className="space-y-5">
      {/* Round indicator + difficulty badge + streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neon-violet uppercase tracking-[0.2em]">
            Round {currentRound.roundNumber + 1}
          </span>
          {difficulty !== 'normal' && (
            <span
              className={cn(
                'text-[10px] font-mono uppercase px-2.5 py-1 rounded-full text-white',
                difficulty === 'hard' ? 'bg-gold-flash/80' : 'bg-hot-coral/80',
              )}
            >
              {diffConfig.label}
            </span>
          )}
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-mono text-hot-coral">x{streak}</span>
          </div>
        )}
      </div>

      {/* Current page card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <WikiPageCard page={currentRound.currentPage} />
      </motion.div>

      {/* Question */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl font-bold text-center text-gradient-violet"
      >
        What comes next?
      </motion.p>

      {/* Points preview */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm font-mono text-gold-flash/70 text-center"
      >
        🎯 {potentialPoints} pts
      </motion.p>

      {/* Option cards */}
      <div className="space-y-3">
        {currentRound.options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 + index * 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              delay: 0.4 + index * 0.1,
            }}
          >
            <OptionCard
              page={option}
              index={index}
              isSelected={selectedOption === option.id}
              onSelect={selectOption}
              disabled={isSubmitting}
            />
          </motion.div>
        ))}
      </div>

      {/* Submit button */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <NeonButton
            onClick={submitAnswer}
            variant="violet"
            size="lg"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full"
          >
            Lock It In
            {!isSubmitting && (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </NeonButton>
        </motion.div>
      )}
    </div>
  );
}
