'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { DIFFICULTIES } from '@/lib/constants';
import type { Difficulty } from '@/types/game';
import { cn } from '@/lib/utils';

const difficultyKeys: Difficulty[] = ['normal', 'hard', 'expert'];

const glowColors: Record<Difficulty, string> = {
  normal: 'glow-cyan',
  hard: 'glow-gold',
  expert: 'glow-coral',
};

const borderColors: Record<Difficulty, string> = {
  normal: 'border-electric-cyan',
  hard: 'border-gold-flash',
  expert: 'border-hot-coral',
};

const bgColors: Record<Difficulty, string> = {
  normal: 'bg-electric-cyan/10',
  hard: 'bg-gold-flash/10',
  expert: 'bg-hot-coral/10',
};

const textColors: Record<Difficulty, string> = {
  normal: 'text-electric-cyan',
  hard: 'text-gold-flash',
  expert: 'text-hot-coral',
};

export function DifficultySelector() {
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-gray uppercase tracking-[0.2em] text-center font-mono">
        Difficulty
      </p>

      <div className="grid grid-cols-3 gap-3">
        {difficultyKeys.map((key) => {
          const d = DIFFICULTIES[key];
          const isSelected = difficulty === key;

          return (
            <motion.button
              key={key}
              onClick={() => setDifficulty(key)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              layout
              className={cn(
                'relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-300',
                'glass',
                isSelected
                  ? cn(borderColors[key], bgColors[key], glowColors[key])
                  : 'border-card-bg-light hover:border-muted-gray/30',
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="difficulty-selection"
                  className={cn(
                    'absolute inset-0 rounded-xl border-2',
                    borderColors[key],
                  )}
                  style={{ opacity: 0.6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <span className="text-xl">{d.icon}</span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-soft-white' : 'text-muted-gray',
                )}
              >
                {d.label}
              </span>
              <span
                className={cn(
                  'text-xs font-mono px-2 py-0.5 rounded-full',
                  isSelected
                    ? cn(textColors[key], bgColors[key])
                    : 'text-muted-gray bg-card-bg-light',
                )}
              >
                {d.multiplier}x
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
