'use client';

import { create } from 'zustand';
import type {
  GameState,
  GameRound,
  AnswerResult,
  Difficulty,
} from '@/types/game';

// ============================================================
// WikiWager Web — Game Store
// State machine mirroring GameService.swift
// ============================================================

interface GameStore {
  // ── State ──────────────────────────────────────────────────
  gameState: GameState;
  currentRound: GameRound | null;
  lastResult: AnswerResult | null;
  roundNumber: number;
  difficulty: Difficulty;
  selectedOption: string | null;
  roundResults: boolean[];
  roundCount: number;

  // ── Actions ────────────────────────────────────────────────
  setDifficulty: (d: Difficulty) => void;
  startRound: () => Promise<void>;
  selectOption: (pageId: string) => void;
  submitAnswer: () => Promise<void>;
  nextRound: () => Promise<void>;
  lockInScore: () => Promise<void>;
  resetForNewDay: () => void;
  setDayComplete: () => void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  // ── Initial State ──────────────────────────────────────────
  gameState: 'idle',
  currentRound: null,
  lastResult: null,
  roundNumber: 0,
  difficulty: 'normal',
  selectedOption: null,
  roundResults: [],
  roundCount: 0,

  // ── Actions ────────────────────────────────────────────────

  setDifficulty: (d) => {
    set({ difficulty: d });
  },

  startRound: async () => {
    set({ gameState: 'loading' });

    try {
      const { roundNumber, difficulty } = get();
      const res = await fetch('/api/game/round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber, difficulty }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch round: ${res.status}`);
      }

      const round: GameRound = await res.json();
      set({ currentRound: round, gameState: 'playing' });
    } catch (error) {
      console.error('[gameStore] startRound error:', error);
      set({ gameState: 'idle' });
    }
  },

  selectOption: (pageId) => {
    set({ selectedOption: pageId });
  },

  submitAnswer: async () => {
    const { selectedOption, roundNumber, difficulty } = get();
    if (!selectedOption) return;

    set({ gameState: 'loading' });

    try {
      const res = await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundNumber,
          selectedPageId: selectedOption,
          difficulty,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to submit answer: ${res.status}`);
      }

      const result: AnswerResult = await res.json();

      set((state) => ({
        lastResult: result,
        gameState: 'showingResult',
        roundResults: [...state.roundResults, result.isCorrect],
        roundCount: state.roundCount + 1,
      }));
    } catch (error) {
      console.error('[gameStore] submitAnswer error:', error);
      set({ gameState: 'playing' });
    }
  },

  nextRound: async () => {
    set((state) => ({
      selectedOption: null,
      lastResult: null,
      roundNumber: state.roundNumber + 1,
    }));

    await get().startRound();
  },

  lockInScore: async () => {
    try {
      const res = await fetch('/api/game/lock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Failed to lock in score: ${res.status}`);
      }

      set({ gameState: 'locked' });
    } catch (error) {
      console.error('[gameStore] lockInScore error:', error);
    }
  },

  resetForNewDay: () => {
    set({
      gameState: 'idle',
      currentRound: null,
      lastResult: null,
      roundNumber: 0,
      selectedOption: null,
      roundResults: [],
      roundCount: 0,
    });
  },

  setDayComplete: () => {
    set({ gameState: 'dayComplete' });
  },
}));
