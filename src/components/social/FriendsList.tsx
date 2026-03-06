'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarEmoji } from '@/components/ui/AvatarEmoji';
import { NeonButton } from '@/components/ui/NeonButton';
import { formatNumber } from '@/lib/utils';
import type { Friend } from '@/types/user';

interface FriendsListProps {
  friends: Friend[];
}

export function FriendsList({ friends }: FriendsListProps) {
  const [search, setSearch] = useState('');

  const filtered = friends.filter((f) =>
    (f.display_name ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  if (friends.length === 0) {
    return (
      <GlassCard className="text-center py-12 space-y-4">
        <span className="text-5xl block">{'\u{1F465}'}</span>
        <h3 className="text-lg font-semibold text-soft-white">No friends yet!</h3>
        <p className="text-sm text-muted-gray max-w-xs mx-auto">
          Share your referral code above to add friends and compete together.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-gray"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-deep-void/60 border border-card-bg-light/50 text-sm text-soft-white placeholder:text-muted-gray focus:outline-none focus:border-neon-violet/50 transition-colors"
        />
      </div>

      {/* Friend rows */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((friend, i) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <GlassCard hover className="!p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <AvatarEmoji emoji={friend.avatar_emoji ?? '\u{1F9E0}'} size="md" />

                  {/* Name + score */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-soft-white truncate">
                      {friend.display_name ?? 'Player'}
                    </p>
                    <p className="text-xs text-muted-gray">
                      {'\u{1F4B0}'} {formatNumber(friend.lifetime_score ?? 0)} lifetime
                    </p>
                  </div>

                  {/* Challenge button */}
                  <Link href="/challenges">
                    <NeonButton variant="cyan" size="sm">
                      Challenge
                    </NeonButton>
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && search && (
          <p className="text-center text-sm text-muted-gray py-6">
            No friends matching &quot;{search}&quot;
          </p>
        )}
      </div>
    </div>
  );
}
