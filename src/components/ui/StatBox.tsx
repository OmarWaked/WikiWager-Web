import { cn } from '@/lib/utils';

type StatColor = 'violet' | 'cyan' | 'gold' | 'coral';

interface StatBoxProps {
  label: string;
  value: string | number;
  icon: string;
  color?: StatColor;
  pulse?: boolean;
}

const colorStyles: Record<StatColor, string> = {
  violet: 'text-neon-violet',
  cyan: 'text-electric-cyan',
  gold: 'text-gold-flash',
  coral: 'text-hot-coral',
};

const borderGlow: Record<StatColor, string> = {
  violet: 'border-neon-violet/20',
  cyan: 'border-electric-cyan/20',
  gold: 'border-gold-flash/20',
  coral: 'border-hot-coral/20',
};

export function StatBox({
  label,
  value,
  icon,
  color = 'violet',
  pulse = false,
}: StatBoxProps) {
  return (
    <div
      className={cn(
        'glass rounded-xl p-4 flex flex-col items-center gap-1 border',
        borderGlow[color],
      )}
    >
      <span className={cn('text-2xl', pulse && 'animate-neon-pulse')}>{icon}</span>
      <span className={cn('text-2xl font-bold tabular-nums', colorStyles[color])}>
        {value}
      </span>
      <span className="text-xs text-muted-gray uppercase tracking-wider">{label}</span>
    </div>
  );
}
