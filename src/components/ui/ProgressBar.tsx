'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type ProgressColor = 'violet' | 'cyan' | 'gold';
type ProgressSize = 'sm' | 'md';

interface ProgressBarProps {
  value: number;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
}

const colorStyles: Record<ProgressColor, { bar: string; bg: string }> = {
  violet: {
    bar: 'bg-gradient-to-r from-neon-violet to-neon-violet-light',
    bg: 'bg-neon-violet/10',
  },
  cyan: {
    bar: 'bg-gradient-to-r from-electric-cyan to-electric-cyan-light',
    bg: 'bg-electric-cyan/10',
  },
  gold: {
    bar: 'bg-gradient-to-r from-gold-flash to-gold-flash-light',
    bg: 'bg-gold-flash/10',
  },
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-3',
};

const labelColors: Record<ProgressColor, string> = {
  violet: 'text-neon-violet-light',
  cyan: 'text-electric-cyan-light',
  gold: 'text-gold-flash-light',
};

export function ProgressBar({
  value,
  color = 'violet',
  size = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const styles = colorStyles[color];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-end mb-1">
          <span className={cn('text-xs font-medium tabular-nums', labelColors[color])}>
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', styles.bg, sizeStyles[size])}>
        <motion.div
          className={cn('h-full rounded-full', styles.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
