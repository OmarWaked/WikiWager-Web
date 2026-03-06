'use client';

import { create } from 'zustand';

// ============================================================
// WikiWager Web — UI Store
// ============================================================

interface UIStore {
  // ── State ──────────────────────────────────────────────────
  showDailyReward: boolean;
  showStreakShieldOffer: boolean;
  showRevengeModeOffer: boolean;
  showAchievementUnlock: string | null;
  isMobile: boolean;
  adInterstitialDue: boolean;

  // ── Actions ────────────────────────────────────────────────
  setShowDailyReward: (v: boolean) => void;
  setShowStreakShieldOffer: (v: boolean) => void;
  setShowRevengeModeOffer: (v: boolean) => void;
  setShowAchievementUnlock: (id: string | null) => void;
  setIsMobile: (v: boolean) => void;
  setAdInterstitialDue: (v: boolean) => void;
  dismissAll: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  // ── Initial State ──────────────────────────────────────────
  showDailyReward: false,
  showStreakShieldOffer: false,
  showRevengeModeOffer: false,
  showAchievementUnlock: null,
  isMobile: false,
  adInterstitialDue: false,

  // ── Actions ────────────────────────────────────────────────

  setShowDailyReward: (v) => {
    set({ showDailyReward: v });
  },

  setShowStreakShieldOffer: (v) => {
    set({ showStreakShieldOffer: v });
  },

  setShowRevengeModeOffer: (v) => {
    set({ showRevengeModeOffer: v });
  },

  setShowAchievementUnlock: (id) => {
    set({ showAchievementUnlock: id });
  },

  setIsMobile: (v) => {
    set({ isMobile: v });
  },

  setAdInterstitialDue: (v) => {
    set({ adInterstitialDue: v });
  },

  dismissAll: () => {
    set({
      showDailyReward: false,
      showStreakShieldOffer: false,
      showRevengeModeOffer: false,
      showAchievementUnlock: null,
    });
  },
}));
