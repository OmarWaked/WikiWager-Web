'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { AvatarEmoji } from '@/components/ui/AvatarEmoji';
import type { LeaderboardEntry } from '@/types/leaderboard';

interface RankCardProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
  isTop3: boolean;
}

const medalEmojis: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

const top3Gradients: Record<number, string> = {
  1: 'from-yellow-500/20 via-yellow-600/10 to-transparent border-yellow-500/30',
  2: 'from-gray-300/15 via-gray-400/8 to-transparent border-gray-400/25',
  3: 'from-amber-700/15 via-amber-800/8 to-transparent border-amber-700/25',
};

export function RankCard({
  entry,
  rank,
  isCurrentUser,
  isTop3,
}: RankCardProps) {
  const medal = medalEmojis[rank];
  const top3Gradient = top3Gradients[rank];

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
        isTop3
          ? cn('bg-gradient-to-r border', top3Gradient)
          : 'glass',
        isCurrentUser && 'border border-neon-violet/50 glow-violet',
        !isTop3 && !isCurrentUser && 'border border-transparent',
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          'w-8 text-center font-bold tabular-nums shrink-0',
          isTop3 ? 'text-2xl' : 'text-sm text-muted-gray',
        )}
      >
        {medal ?? rank}
      </div>

      {/* Avatar */}
      <AvatarEmoji
        emoji={entry.avatar_emoji}
        size={isTop3 ? 'lg' : 'sm'}
        vip={entry.is_vip}
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-semibold truncate',
              isTop3 ? 'text-base' : 'text-sm',
              isCurrentUser && 'text-neon-violet-light',
            )}
          >
            {entry.display_name}
          </span>
          {entry.is_vip && (
            <span className="text-gold-flash text-xs" title="VIP">
              ⭐
            </span>
          )}
        </div>
        {isCurrentUser && (
          <span className="text-[10px] text-neon-violet-light/70 uppercase tracking-wider">
            You
          </span>
        )}
      </div>

      {/* Score */}
      <div
        className={cn(
          'font-bold tabular-nums shrink-0',
          isTop3 ? 'text-lg text-gold-flash' : 'text-sm text-electric-cyan',
        )}
      >
        {formatNumber(entry.score)}
      </div>
    </motion.div>
  );
}
