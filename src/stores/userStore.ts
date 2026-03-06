'use client';

import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/user';

// ============================================================
// WikiWager Web — User Store
// ============================================================

interface UserStore {
  // ── State ──────────────────────────────────────────────────
  user: User | null;
  isLoading: boolean;

  // ── Internal ───────────────────────────────────────────────
  _channel: RealtimeChannel | null;

  // ── Actions ────────────────────────────────────────────────
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  subscribeToChanges: () => void;
  unsubscribe: () => void;

  // ── Computed helpers ───────────────────────────────────────
  getTriesRemaining: () => number;
  canPlay: () => boolean;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  // ── Initial State ──────────────────────────────────────────
  user: null,
  isLoading: false,
  _channel: null,

  // ── Actions ────────────────────────────────────────────────

  setUser: (user) => {
    set({ user });
  },

  fetchUser: async () => {
    set({ isLoading: true });

    try {
      const supabase = createClient();

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        set({ user: null, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('[userStore] fetchUser error:', error.message);
        set({ user: null, isLoading: false });
        return;
      }

      set({ user: data as User, isLoading: false });
    } catch (error) {
      console.error('[userStore] fetchUser unexpected error:', error);
      set({ user: null, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      const supabase = createClient();

      // Only allow safe profile fields
      const safeUpdates: Partial<User> = {};
      if (updates.display_name !== undefined)
        safeUpdates.display_name = updates.display_name;
      if (updates.avatar_emoji !== undefined)
        safeUpdates.avatar_emoji = updates.avatar_emoji;
      if (updates.username !== undefined)
        safeUpdates.username = updates.username;

      const { error } = await supabase
        .from('users')
        .update(safeUpdates)
        .eq('id', user.id);

      if (error) {
        console.error('[userStore] updateProfile error:', error.message);
        return;
      }

      // Optimistic update
      set({ user: { ...user, ...safeUpdates } });
    } catch (error) {
      console.error('[userStore] updateProfile unexpected error:', error);
    }
  },

  subscribeToChanges: () => {
    const { user, _channel } = get();
    if (!user || _channel) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`user:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          set({ user: payload.new as User });
        }
      )
      .subscribe();

    set({ _channel: channel });
  },

  unsubscribe: () => {
    const { _channel } = get();
    if (!_channel) return;

    const supabase = createClient();
    supabase.removeChannel(_channel);
    set({ _channel: null });
  },

  // ── Computed helpers ───────────────────────────────────────

  getTriesRemaining: () => {
    const { user } = get();
    if (!user) return 0;

    const total = user.base_guesses + user.extra_guesses;
    return Math.max(0, total - user.today_tries);
  },

  canPlay: () => {
    const { user } = get();
    if (!user) return false;

    const triesRemaining = get().getTriesRemaining();
    if (triesRemaining <= 0) return false;

    // Check if score is already locked today
    if (user.score_locked) {
      const lockedDate = new Date(user.score_locked).toDateString();
      const today = new Date().toDateString();
      if (lockedDate === today) return false;
    }

    return true;
  },
}));
