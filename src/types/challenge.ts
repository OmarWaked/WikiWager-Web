// ============================================================
// WikiWager Web — Challenge Types
// Mirrors: WikiWager/WikiWager/Services/ChallengeService.swift
// ============================================================

export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'declined' | 'expired';

export interface Challenge {
  id: string;
  challenger_id: string;
  challenger_name: string;
  challenger_avatar: string;
  challenger_score?: number;
  opponent_id: string;
  opponent_name: string;
  opponent_avatar: string;
  opponent_score?: number;
  wager_amount: number;
  difficulty: string;
  status: ChallengeStatus;
  game_round_ids: string[];
  created_at: string;
  expires_at: string;
}
