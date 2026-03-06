'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LeaderboardType } from '@/types/leaderboard';

interface LeaderboardTabsProps {
  activeTab: LeaderboardType;
  onTabChange: (tab: LeaderboardType) => void;
}

const tabs: { key: LeaderboardType; label: string; icon: string }[] = [
  { key: 'daily', label: 'Daily', icon: '📅' },
  { key: 'allTime', label: 'All Time', icon: '🏆' },
  { key: 'friends', label: 'Friends', icon: '👥' },
];

export function LeaderboardTabs({
  activeTab,
  onTabChange,
}: LeaderboardTabsProps) {
  return (
    <div className="relative flex gap-1 glass rounded-xl p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10',
              isActive ? 'text-soft-white' : 'text-muted-gray hover:text-soft-white/70',
            )}
          >
            {/* Active tab indicator with glow */}
            {isActive && (
              <motion.div
                layoutId="leaderboard-tab-indicator"
                className="absolute inset-0 rounded-lg bg-neon-violet/20 border border-neon-violet/40"
                style={{
                  boxShadow: '0 0 16px rgba(124, 58, 237, 0.3), 0 0 32px rgba(124, 58, 237, 0.1)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <span className="relative z-10">{tab.icon}</span>
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
