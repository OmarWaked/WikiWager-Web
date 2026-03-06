import { cn } from '@/lib/utils';

type StreakSize = 'sm' | 'md' | 'lg';

interface StreakBadgeProps {
  streak: number;
  size?: StreakSize;
}

const sizeStyles: Record<StreakSize, { container: string; text: string; emoji: string }> = {
  sm: { container: 'px-2 py-0.5 rounded-md gap-1', text: 'text-xs font-semibold', emoji: 'text-xs' },
  md: { container: 'px-3 py-1 rounded-lg gap-1.5', text: 'text-sm font-bold', emoji: 'text-sm' },
  lg: { container: 'px-4 py-1.5 rounded-xl gap-2', text: 'text-base font-bold', emoji: 'text-base' },
};

function getStreakColor(streak: number): { text: string; bg: string } {
  if (streak <= 0) return { text: 'text-muted-gray', bg: 'bg-muted-gray/10' };
  if (streak < 5) return { text: 'text-electric-cyan', bg: 'bg-electric-cyan/10' };
  if (streak < 10) return { text: 'text-gold-flash', bg: 'bg-gold-flash/10' };
  return { text: 'text-hot-coral', bg: 'bg-hot-coral/10' };
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const styles = sizeStyles[size];
  const colors = getStreakColor(streak);

  return (
    <div
      className={cn(
        'inline-flex items-center',
        styles.container,
        colors.bg,
        streak > 0 && 'animate-neon-pulse',
      )}
    >
      <span className={styles.emoji}>{streak > 0 ? '\uD83D\uDD25' : '\u2744\uFE0F'}</span>
      <span className={cn(styles.text, 'tabular-nums', colors.text)}>{streak}</span>
    </div>
  );
}
