// ============================================================
// WikiWager Web — Game Types
// Mirrors: WikiWager/WikiWager/Models/WikiPage.swift
// ============================================================

export interface WikiPage {
  id: string;
  title: string;
  extract: string;
  thumbnail?: string;
  description?: string;
}

export interface GameRound {
  currentPage: WikiPage;
  options: WikiPage[];
  roundNumber: number;
}

export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  newStreak: number;
  correctPageId: string;
  correctPageTitle?: string;
  triesRemaining: number;
}

export type GameState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'showingResult'
  | 'dayComplete'
  | 'locked';

export type Difficulty = 'normal' | 'hard' | 'expert';
