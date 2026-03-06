'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { AdBanner } from '@/components/ads/AdBanner';

export default function LeaderboardPage() {
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);

  const {
    filteredEntries,
    isLoading,
    currentTab,
    setTab,
    search,
    searchQuery,
  } = useLeaderboard(user?.id);

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-soft-white">Leaderboard</h1>
        <p className="text-sm text-muted-gray mt-0.5">
          {currentTab === 'daily'
            ? "Today's top players"
            : currentTab === 'allTime'
              ? 'All-time legends'
              : 'Compete with friends'}
        </p>
      </div>

      {/* Tabs */}
      <LeaderboardTabs activeTab={currentTab} onTabChange={setTab} />

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => search(e.target.value)}
          placeholder="Search by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-soft-white placeholder:text-muted-gray/60 focus:outline-none focus:border-neon-violet/40 border border-transparent transition-colors"
        />
      </div>

      {/* Leaderboard content */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="glass rounded-xl h-14 animate-pulse"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ) : (
        <LeaderboardTable
          entries={filteredEntries}
          currentUserId={user?.id}
        />
      )}

      {/* Bottom ad */}
      <div className="mt-4">
        <AdBanner slot="leaderboard-bottom" format="auto" />
      </div>
    </div>
  );
}
