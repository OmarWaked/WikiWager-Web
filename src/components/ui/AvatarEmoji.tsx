import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarEmojiProps {
  emoji: string;
  size?: AvatarSize;
  ring?: boolean;
  vip?: boolean;
}

const sizeStyles: Record<AvatarSize, { container: string; emoji: string }> = {
  sm: { container: 'w-8 h-8', emoji: 'text-lg' },
  md: { container: 'w-12 h-12', emoji: 'text-2xl' },
  lg: { container: 'w-16 h-16', emoji: 'text-4xl' },
};

export function AvatarEmoji({
  emoji,
  size = 'md',
  ring = false,
  vip = false,
}: AvatarEmojiProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-card-bg to-card-bg-light flex items-center justify-center shrink-0',
        styles.container,
        ring && !vip && 'ring-2 ring-neon-violet/50 glow-violet',
        vip && 'ring-2 ring-gold-flash/60 glow-gold',
      )}
    >
      <span className={styles.emoji}>{emoji}</span>
    </div>
  );
}
