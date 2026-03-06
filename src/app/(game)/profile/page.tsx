'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { createClient } from '@/lib/supabase/client';
import { cn, formatNumber } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarEmoji } from '@/components/ui/AvatarEmoji';
import { StatBox } from '@/components/ui/StatBox';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NeonButton } from '@/components/ui/NeonButton';
import { Modal } from '@/components/ui/Modal';
import { LEAGUES, ACHIEVEMENTS, DAILY_REWARDS, AVATAR_EMOJIS } from '@/lib/constants';

// ── Helpers ─────────────────────────────────────────────────

function getLeague(leagueKey: string) {
  return (
    LEAGUES[leagueKey as keyof typeof LEAGUES] ?? LEAGUES.bronze
  );
}

function getNextLeague(leagueKey: string) {
  const keys = Object.keys(LEAGUES) as (keyof typeof LEAGUES)[];
  const index = keys.indexOf(leagueKey as keyof typeof LEAGUES);
  if (index < 0 || index >= keys.length - 1) return null;
  return LEAGUES[keys[index + 1]];
}

function getLeagueProgress(score: number, leagueKey: string): number {
  const current = getLeague(leagueKey);
  const next = getNextLeague(leagueKey);
  if (!next) return 100;
  const range = next.minScore - current.minScore;
  if (range <= 0) return 100;
  return Math.min(100, ((score - current.minScore) / range) * 100);
}

function getWinRate(correct: number, wrong: number): string {
  const total = correct + wrong;
  if (total === 0) return '0%';
  return `${Math.round((correct / total) * 100)}%`;
}

// ── Achievement Rarity Colors ───────────────────────────────

const rarityColors: Record<string, string> = {
  common: 'border-muted-gray/30',
  uncommon: 'border-electric-cyan/30',
  rare: 'border-neon-violet/30',
  epic: 'border-gold-flash/30',
  legendary: 'border-hot-coral/30',
};

const rarityGlows: Record<string, string> = {
  common: '',
  uncommon: 'glow-cyan',
  rare: 'glow-violet',
  epic: 'glow-gold',
  legendary: 'glow-coral',
};

// ── Profile Page ────────────────────────────────────────────

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const isLoading = useUserStore((s) => s.isLoading);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  // Sync edit fields when user loads
  useEffect(() => {
    if (user) {
      setEditName(user.display_name);
      setEditUsername(user.username ?? '');
      setEditAvatar(user.avatar_emoji);
    }
  }, [user]);

  const openEditModal = useCallback(() => {
    if (user) {
      setEditName(user.display_name);
      setEditUsername(user.username ?? '');
      setEditAvatar(user.avatar_emoji);
    }
    setEditModalOpen(true);
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (!editName.trim()) return;

    setIsSaving(true);
    await updateProfile({
      display_name: editName.trim(),
      username: editUsername.trim() || undefined,
      avatar_emoji: editAvatar,
    });
    setIsSaving(false);
    setEditModalOpen(false);
  }, [editName, editUsername, editAvatar, updateProfile]);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }, []);

  if (isLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Skeleton */}
        <div className="glass rounded-2xl p-6 animate-pulse flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-card-bg-light" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-card-bg-light rounded" />
            <div className="h-3 w-20 bg-card-bg-light rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const league = getLeague(user.current_league);
  const nextLeague = getNextLeague(user.current_league);
  const leagueProgress = getLeagueProgress(
    user.lifetime_score,
    user.current_league,
  );
  const userAchievements = new Set(user.achievements ?? []);
  const loginStreakDay = Math.max(1, ((user.login_streak - 1) % 7) + 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* ── Profile Header ─────────────────────────────────── */}
      <GlassCard>
        <div className="flex items-center gap-4">
          <AvatarEmoji
            emoji={user.avatar_emoji}
            size="lg"
            vip={user.is_vip}
            ring
          />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-soft-white truncate">
              {user.display_name}
            </h1>
            {user.username && (
              <p className="text-sm text-muted-gray truncate">
                @{user.username}
              </p>
            )}
            {user.is_vip && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-gold-flash bg-gold-flash/10 px-2 py-0.5 rounded-full">
                ⭐ VIP
              </span>
            )}
          </div>

          <NeonButton
            onClick={openEditModal}
            variant="violet"
            size="sm"
          >
            Edit
          </NeonButton>
        </div>
      </GlassCard>

      {/* ── Stats Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatBox
          label="Lifetime Score"
          value={formatNumber(user.lifetime_score)}
          icon="💰"
          color="gold"
        />
        <StatBox
          label="Best Streak"
          value={user.best_streak}
          icon="🔥"
          color="coral"
        />
        <StatBox
          label="Total Correct"
          value={formatNumber(user.total_correct)}
          icon="✅"
          color="cyan"
        />
        <StatBox
          label="Win Rate"
          value={getWinRate(user.total_correct, user.total_wrong)}
          icon="📊"
          color="violet"
        />
        <StatBox
          label="Expert Correct"
          value={user.expert_correct}
          icon="💀"
          color="coral"
        />
        <StatBox
          label="Friends"
          value={user.friend_count}
          icon="👥"
          color="cyan"
        />
      </div>

      {/* ── League Display ─────────────────────────────────── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{league.emoji}</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: league.color }}>
              {league.name} League
            </h2>
            {nextLeague ? (
              <p className="text-xs text-muted-gray">
                {formatNumber(nextLeague.minScore - user.lifetime_score)} pts
                to {nextLeague.name}
              </p>
            ) : (
              <p className="text-xs text-muted-gray">
                Max rank achieved!
              </p>
            )}
          </div>
        </div>
        <ProgressBar value={leagueProgress} color="gold" showLabel />
      </GlassCard>

      {/* ── Achievements ───────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-soft-white mb-3">
          Achievements
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = userAchievements.has(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.1 }}
                className={cn(
                  'relative flex flex-col items-center justify-center p-2 rounded-xl border aspect-square cursor-default',
                  isUnlocked
                    ? cn(
                        'glass',
                        rarityColors[achievement.rarity],
                        rarityGlows[achievement.rarity],
                      )
                    : 'bg-card-bg/40 border-card-bg-light/30 opacity-40',
                )}
                title={`${achievement.name}: ${achievement.desc}${isUnlocked ? ' (Unlocked!)' : ''}`}
              >
                <span className={cn('text-2xl', !isUnlocked && 'grayscale')}>
                  {achievement.icon}
                </span>
                <span className="text-[9px] text-muted-gray mt-0.5 text-center leading-tight truncate w-full">
                  {achievement.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Daily Rewards Tracker ──────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold text-soft-white mb-3">
          Daily Rewards
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {DAILY_REWARDS.map((reward) => {
            const isCurrent = reward.day === loginStreakDay;
            const isClaimed = reward.day < loginStreakDay;

            return (
              <div
                key={reward.day}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl border text-center',
                  isCurrent
                    ? 'glass border-neon-violet/50 glow-violet'
                    : isClaimed
                      ? 'glass border-electric-cyan/20 opacity-60'
                      : 'bg-card-bg/40 border-card-bg-light/30 opacity-40',
                )}
              >
                <span className="text-[10px] text-muted-gray font-medium">
                  Day {reward.day}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {reward.day === 7 ? '🎁' : `+${reward.guesses}`}
                </span>
                <span className="text-[9px] text-muted-gray leading-tight">
                  {reward.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sign Out ───────────────────────────────────────── */}
      <div className="pt-4">
        <NeonButton
          onClick={handleSignOut}
          variant="coral"
          size="md"
          className="w-full"
        >
          Sign Out
        </NeonButton>
      </div>

      {/* ── Edit Profile Modal ─────────────────────────────── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="flex flex-col gap-4">
          {/* Avatar picker */}
          <div>
            <label className="text-sm text-muted-gray mb-2 block">
              Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setEditAvatar(emoji)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all',
                    editAvatar === emoji
                      ? 'bg-neon-violet/20 ring-2 ring-neon-violet scale-110'
                      : 'bg-card-bg hover:bg-card-bg-light',
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Display name */}
          <div>
            <label
              htmlFor="edit-display-name"
              className="text-sm text-muted-gray mb-1.5 block"
            >
              Display Name
            </label>
            <input
              id="edit-display-name"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-soft-white placeholder:text-muted-gray/60 focus:outline-none focus:border-neon-violet/40 border border-transparent transition-colors"
              placeholder="Your display name"
            />
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="edit-username"
              className="text-sm text-muted-gray mb-1.5 block"
            >
              Username
            </label>
            <input
              id="edit-username"
              type="text"
              value={editUsername}
              onChange={(e) =>
                setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              }
              maxLength={15}
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-soft-white placeholder:text-muted-gray/60 focus:outline-none focus:border-neon-violet/40 border border-transparent transition-colors"
              placeholder="username"
            />
          </div>

          {/* Save button */}
          <NeonButton
            onClick={handleSaveProfile}
            variant="violet"
            size="md"
            loading={isSaving}
            disabled={!editName.trim()}
            className="w-full mt-2"
          >
            Save Changes
          </NeonButton>
        </div>
      </Modal>
    </div>
  );
}
