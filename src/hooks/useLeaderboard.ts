'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { LeaderboardEntry, LeaderboardType } from '@/types/leaderboard';

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  filteredEntries: LeaderboardEntry[];
  isLoading: boolean;
  currentTab: LeaderboardType;
  setTab: (tab: LeaderboardType) => void;
  search: (query: string) => void;
  searchQuery: string;
}

export function useLeaderboard(
  userId: string | undefined,
): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LeaderboardEntry[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<LeaderboardType>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchEntries = useCallback(
    async (tab: LeaderboardType) => {
      setIsLoading(true);

      try {
        const supabase = createClient();

        let data: LeaderboardEntry[] = [];

        if (tab === 'daily') {
          const { data: rows, error } = await supabase
            .from('leaderboard_daily')
            .select('*')
            .order('score', { ascending: false })
            .limit(100);

          if (!error && rows) data = rows as LeaderboardEntry[];
        } else if (tab === 'allTime') {
          const { data: rows, error } = await supabase
            .from('leaderboard_alltime')
            .select('*')
            .order('score', { ascending: false })
            .limit(100);

          if (!error && rows) data = rows as LeaderboardEntry[];
        } else if (tab === 'friends') {
          if (!userId) {
            setEntries([]);
            setFilteredEntries([]);
            setIsLoading(false);
            return;
          }

          // Get friend IDs
          const { data: friends, error: friendsError } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', userId);

          if (friendsError || !friends) {
            setEntries([]);
            setFilteredEntries([]);
            setIsLoading(false);
            return;
          }

          const friendIds = friends.map((f) => f.friend_id);
          // Include current user in friends leaderboard
          friendIds.push(userId);

          const { data: rows, error } = await supabase
            .from('users')
            .select(
              'id, display_name, avatar_emoji, lifetime_score, is_vip',
            )
            .in('id', friendIds)
            .order('lifetime_score', { ascending: false });

          if (!error && rows) {
            data = rows.map((row) => ({
              user_id: row.id,
              display_name: row.display_name,
              avatar_emoji: row.avatar_emoji,
              score: row.lifetime_score,
              is_vip: row.is_vip,
            }));
          }
        }

        // Assign ranks
        const ranked = data.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

        setEntries(ranked);
        setFilteredEntries(ranked);
      } catch (error) {
        console.error('[useLeaderboard] fetchEntries error:', error);
        setEntries([]);
        setFilteredEntries([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  // Subscribe to realtime updates for daily leaderboard
  const subscribe = useCallback(() => {
    if (channelRef.current) return;

    const supabase = createClient();

    const channel = supabase
      .channel('leaderboard_daily_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_daily',
        },
        () => {
          // Re-fetch on any change
          if (currentTab === 'daily') {
            fetchEntries('daily');
          }
        },
      )
      .subscribe();

    channelRef.current = channel;
  }, [currentTab, fetchEntries]);

  const unsubscribe = useCallback(() => {
    if (!channelRef.current) return;

    const supabase = createClient();
    supabase.removeChannel(channelRef.current);
    channelRef.current = null;
  }, []);

  // Tab change handler
  const setTab = useCallback(
    (tab: LeaderboardType) => {
      setCurrentTab(tab);
      setSearchQuery('');
      fetchEntries(tab);
    },
    [fetchEntries],
  );

  // Search handler
  const search = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setFilteredEntries(entries);
        return;
      }

      const lower = query.toLowerCase();
      setFilteredEntries(
        entries.filter((e) =>
          e.display_name.toLowerCase().includes(lower),
        ),
      );
    },
    [entries],
  );

  // Initial fetch and subscription
  useEffect(() => {
    fetchEntries(currentTab);
    subscribe();

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    entries,
    filteredEntries,
    isLoading,
    currentTab,
    setTab,
    search,
    searchQuery,
  };
}
