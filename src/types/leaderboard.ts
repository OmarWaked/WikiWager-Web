// ============================================================
// WikiWager Web — Leaderboard Types
// Mirrors: WikiWager/WikiWager/Models/LeaderboardEntry.swift
// ============================================================

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  score: number;
  rank?: number;
  date?: string;
  is_vip?: boolean;
}

export type LeaderboardType = 'daily' | 'allTime' | 'friends' | 'league';
