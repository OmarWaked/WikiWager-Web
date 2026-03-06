'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/Modal';
import { NeonButton } from '@/components/ui/NeonButton';
import { AvatarEmoji } from '@/components/ui/AvatarEmoji';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { DIFFICULTIES } from '@/lib/constants';
import type { Friend } from '@/types/user';
import type { Difficulty } from '@/types/game';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated?: () => void;
}

const WAGER_AMOUNTS = [1, 2, 5, 10] as const;
const DIFFICULTY_KEYS: Difficulty[] = ['normal', 'hard', 'expert'];

const difficultyColors: Record<Difficulty, { border: string; bg: string; text: string }> = {
  normal: {
    border: 'border-electric-cyan',
    bg: 'bg-electric-cyan/10',
    text: 'text-electric-cyan',
  },
  hard: {
    border: 'border-gold-flash',
    bg: 'bg-gold-flash/10',
    text: 'text-gold-flash',
  },
  expert: {
    border: 'border-hot-coral',
    bg: 'bg-hot-coral/10',
    text: 'text-hot-coral',
  },
};

export function CreateChallengeModal({
  isOpen,
  onClose,
  onChallengeCreated,
}: CreateChallengeModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [wagerAmount, setWagerAmount] = useState<(typeof WAGER_AMOUNTS)[number]>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [extraGuesses, setExtraGuesses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const fetchFriendsAndGuesses = useCallback(async () => {
    setFriendsLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch user's extra_guesses
      const { data: profile } = await supabase
        .from('users')
        .select('extra_guesses')
        .eq('id', user.id)
        .single();

      if (profile) {
        setExtraGuesses(profile.extra_guesses ?? 0);
      }

      // Fetch friends
      const { data: friendRows } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, added_at')
        .eq('user_id', user.id);

      if (friendRows && friendRows.length > 0) {
        const friendIds = friendRows.map(
          (f: { friend_id: string }) => f.friend_id,
        );

        const { data: friendProfiles } = await supabase
          .from('users')
          .select('id, display_name, avatar_emoji, lifetime_score')
          .in('id', friendIds);

        const enriched: Friend[] = friendRows.map(
          (fr: {
            id: string;
            user_id: string;
            friend_id: string;
            added_at: string;
          }) => {
            const p = friendProfiles?.find(
              (fp: { id: string }) => fp.id === fr.friend_id,
            );
            return {
              id: fr.id,
              user_id: fr.user_id,
              friend_id: fr.friend_id,
              display_name: p?.display_name ?? 'Player',
              avatar_emoji: p?.avatar_emoji ?? '\u{1F9E0}',
              lifetime_score: p?.lifetime_score ?? 0,
              added_at: fr.added_at,
            };
          },
        );

        setFriends(enriched);
      }
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFriendsAndGuesses();
      // Reset form state
      setSelectedFriend('');
      setWagerAmount(1);
      setDifficulty('normal');
    }
  }, [isOpen, fetchFriendsAndGuesses]);

  async function handleSendChallenge() {
    if (!selectedFriend) {
      toast.error('Please select a friend');
      return;
    }

    if (wagerAmount > extraGuesses) {
      toast.error('Not enough extra guesses for this wager');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opponentId: selectedFriend,
          wagerAmount,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create challenge');
        return;
      }

      toast.success('Challenge sent!');
      setExtraGuesses((prev) => prev - wagerAmount);
      onChallengeCreated?.();
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const wagerExceedsBalance = wagerAmount > extraGuesses;
  const selectedFriendData = friends.find((f) => f.friend_id === selectedFriend);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Challenge" size="md">
      <div className="space-y-6">
        {/* Extra guesses display */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neon-violet/10 border border-neon-violet/20">
          <span className="text-sm text-muted-gray">Your extra guesses:</span>
          <span className="text-lg font-bold text-neon-violet">
            {extraGuesses}
          </span>
        </div>

        {/* Friend selector */}
        <div className="space-y-2">
          <label className="text-xs text-muted-gray uppercase tracking-[0.2em] font-mono">
            Challenge a Friend
          </label>
          {friendsLoading ? (
            <div className="glass rounded-xl p-4 animate-pulse h-14" />
          ) : friends.length === 0 ? (
            <GlassCard className="text-center py-4">
              <p className="text-sm text-muted-gray">
                No friends yet. Add friends to challenge them!
              </p>
            </GlassCard>
          ) : (
            <div className="relative">
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass text-sm text-soft-white bg-deep-void/60 border border-card-bg-light/50 focus:outline-none focus:border-neon-violet/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="" className="bg-deep-void text-muted-gray">
                  Select a friend...
                </option>
                {friends.map((friend) => (
                  <option
                    key={friend.friend_id}
                    value={friend.friend_id}
                    className="bg-deep-void text-soft-white"
                  >
                    {friend.avatar_emoji} {friend.display_name}
                  </option>
                ))}
              </select>
              {/* Dropdown arrow */}
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none"
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
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}

          {/* Selected friend preview */}
          {selectedFriendData && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card-bg-light/30"
            >
              <AvatarEmoji
                emoji={selectedFriendData.avatar_emoji ?? '\u{1F9E0}'}
                size="sm"
              />
              <span className="text-sm font-semibold text-soft-white">
                {selectedFriendData.display_name}
              </span>
            </motion.div>
          )}
        </div>

        {/* Wager amount selector */}
        <div className="space-y-2">
          <label className="text-xs text-muted-gray uppercase tracking-[0.2em] font-mono">
            Wager Amount
          </label>
          <div className="grid grid-cols-4 gap-2">
            {WAGER_AMOUNTS.map((amount) => {
              const isSelected = wagerAmount === amount;
              const isDisabled = amount > extraGuesses;

              return (
                <motion.button
                  key={amount}
                  onClick={() => !isDisabled && setWagerAmount(amount)}
                  whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                  whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                  className={cn(
                    'relative py-3 rounded-xl border text-center font-bold transition-all duration-300',
                    isSelected
                      ? 'border-gold-flash bg-gold-flash/15 text-gold-flash'
                      : isDisabled
                        ? 'border-card-bg-light/30 text-muted-gray/40 cursor-not-allowed'
                        : 'border-card-bg-light hover:border-muted-gray/30 text-muted-gray glass',
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="wager-selection"
                      className="absolute inset-0 rounded-xl border-2 border-gold-flash"
                      style={{ opacity: 0.6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="text-lg">{amount}</span>
                  <span className="block text-[10px] mt-0.5 opacity-70">
                    {amount === 1 ? 'guess' : 'guesses'}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Warning if wager exceeds balance */}
          {wagerExceedsBalance && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-hot-coral flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Not enough extra guesses! You need {wagerAmount} but have{' '}
              {extraGuesses}.
            </motion.p>
          )}
        </div>

        {/* Difficulty selector */}
        <div className="space-y-2">
          <label className="text-xs text-muted-gray uppercase tracking-[0.2em] font-mono">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_KEYS.map((key) => {
              const d = DIFFICULTIES[key];
              const isSelected = difficulty === key;
              const colors = difficultyColors[key];

              return (
                <motion.button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border transition-all duration-300 glass',
                    isSelected
                      ? cn(colors.border, colors.bg)
                      : 'border-card-bg-light hover:border-muted-gray/30',
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="challenge-difficulty-selection"
                      className={cn(
                        'absolute inset-0 rounded-xl border-2',
                        colors.border,
                      )}
                      style={{ opacity: 0.6 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="text-lg relative z-10">{d.icon}</span>
                  <span
                    className={cn(
                      'text-xs font-semibold relative z-10',
                      isSelected ? 'text-soft-white' : 'text-muted-gray',
                    )}
                  >
                    {d.label}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded-full relative z-10',
                      isSelected
                        ? cn(colors.text, colors.bg)
                        : 'text-muted-gray bg-card-bg-light',
                    )}
                  >
                    {d.multiplier}x
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Send button */}
        <NeonButton
          onClick={handleSendChallenge}
          variant="violet"
          size="lg"
          loading={loading}
          disabled={
            !selectedFriend ||
            wagerExceedsBalance ||
            friends.length === 0
          }
          className="w-full"
        >
          {'\u{2694}\u{FE0F}'} Send Challenge
        </NeonButton>
      </div>
    </Modal>
  );
}
