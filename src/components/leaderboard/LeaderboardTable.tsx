'use client';

import { motion } from 'framer-motion';
import { RankCard } from './RankCard';
import type { LeaderboardEntry } from '@/types/leaderboard';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">🏜️</span>
        <p className="text-lg font-semibold text-soft-white mb-1">
          No entries yet
        </p>
        <p className="text-sm text-muted-gray">
          Be the first to claim the top spot!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {entries.map((entry, index) => {
        const rank = entry.rank ?? index + 1;
        const isCurrentUser = currentUserId === entry.user_id;
        const isTop3 = rank <= 3;

        return (
          <motion.div key={entry.user_id} variants={itemVariants}>
            <RankCard
              entry={entry}
              rank={rank}
              isCurrentUser={isCurrentUser}
              isTop3={isTop3}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
