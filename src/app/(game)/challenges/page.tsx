'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChallengeCard } from '@/components/social/ChallengeCard';
import { CreateChallengeModal } from '@/components/game/CreateChallengeModal';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { cn } from '@/lib/utils';
import type { Challenge, ChallengeStatus } from '@/types/challenge';

type TabKey = 'pending' | 'active' | 'completed';

const TABS: { key: TabKey; label: string; icon: string; statuses: ChallengeStatus[] }[] = [
  { key: 'pending', label: 'Pending', icon: '\u{23F3}', statuses: ['pending'] },
  { key: 'active', label: 'Active', icon: '\u{26A1}', statuses: ['active'] },
  {
    key: 'completed',
    label: 'Completed',
    icon: '\u{1F3C6}',
    statuses: ['completed', 'declined', 'expired'],
  },
];

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/challenges');
      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to fetch challenges:', data.error);
        return;
      }

      setChallenges(data.challenges ?? []);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);
      fetchChallenges();
    }

    init();
  }, [fetchChallenges, router]);

  async function handleAccept(challengeId: string) {
    setActionLoading(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to accept challenge');
        return;
      }

      toast.success('Challenge accepted! Time to play!');
      fetchChallenges();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(challengeId: string) {
    setActionLoading(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to decline challenge');
        return;
      }

      toast.success('Challenge declined. Wager refunded.');
      fetchChallenges();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  }

  // Filter challenges for current tab
  const currentTabConfig = TABS.find((t) => t.key === activeTab)!;
  const filteredChallenges = challenges.filter((c) =>
    currentTabConfig.statuses.includes(c.status),
  );

  // Count badges
  const pendingCount = challenges.filter((c) => c.status === 'pending').length;
  const activeCount = challenges.filter((c) => c.status === 'active').length;

  function getTabBadge(key: TabKey): number | null {
    if (key === 'pending' && pendingCount > 0) return pendingCount;
    if (key === 'active' && activeCount > 0) return activeCount;
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 animate-pulse h-40"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-soft-white">Challenges</h1>
          <p className="text-sm text-muted-gray">
            Wager guesses, compete with friends
          </p>
        </div>
        <NeonButton
          onClick={() => setShowCreateModal(true)}
          variant="violet"
          size="sm"
        >
          + Create
        </NeonButton>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="relative flex gap-1 glass rounded-xl p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const badge = getTabBadge(tab.key);

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors z-10',
                  isActive
                    ? 'text-soft-white'
                    : 'text-muted-gray hover:text-soft-white/70',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="challenge-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-neon-violet/20 border border-neon-violet/40"
                    style={{
                      boxShadow:
                        '0 0 16px rgba(124, 58, 237, 0.3), 0 0 32px rgba(124, 58, 237, 0.1)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
                {badge != null && (
                  <span className="relative z-10 ml-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-hot-coral text-[10px] font-bold text-white px-1">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Challenge list */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {filteredChallenges.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="text-center py-10">
                <p className="text-3xl mb-3">
                  {activeTab === 'pending'
                    ? '\u{1F4E8}'
                    : activeTab === 'active'
                      ? '\u{1F3AE}'
                      : '\u{1F4CA}'}
                </p>
                <p className="text-sm text-muted-gray">
                  {activeTab === 'pending'
                    ? 'No pending challenges. Create one!'
                    : activeTab === 'active'
                      ? 'No active challenges right now.'
                      : 'No completed challenges yet.'}
                </p>
                {activeTab === 'pending' && (
                  <div className="mt-4">
                    <NeonButton
                      onClick={() => setShowCreateModal(true)}
                      variant="cyan"
                      size="sm"
                    >
                      Challenge a Friend
                    </NeonButton>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredChallenges.map((challenge) => (
                <div key={challenge.id} className="relative">
                  {/* Loading overlay for action in progress */}
                  {actionLoading === challenge.id && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-deep-void/40 backdrop-blur-sm rounded-2xl">
                      <div className="w-6 h-6 border-2 border-neon-violet border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  <ChallengeCard
                    challenge={challenge}
                    currentUserId={currentUserId ?? ''}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                  />

                  {/* Outgoing pending indicator */}
                  {challenge.status === 'pending' &&
                    challenge.challenger_id === currentUserId && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-center"
                      >
                        <span className="text-xs text-gold-flash/80 font-medium px-3 py-1 rounded-full bg-gold-flash/10">
                          {'\u{23F3}'} Waiting for response...
                        </span>
                      </motion.div>
                    )}

                  {/* Play button for active challenges */}
                  {challenge.status === 'active' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3"
                    >
                      <NeonButton
                        onClick={() => router.push('/play')}
                        variant="cyan"
                        size="sm"
                        className="w-full"
                      >
                        {'\u{1F3AE}'} Play Challenge
                      </NeonButton>
                    </motion.div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChallengeCreated={fetchChallenges}
      />

      {/* Bottom ad */}
      <div className="mt-4">
        <AdBanner slot="challenges-bottom" format="auto" />
      </div>
    </div>
  );
}
