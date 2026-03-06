// ============================================================
// WikiWager Web — User Types
// Mirrors: WikiWager/WikiWager/Models/User.swift
// ============================================================

export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  display_name: string;
  username?: string;
  avatar_emoji: string;

  // Scoring
  lifetime_score: number;
  today_score: number;
  today_tries: number;
  current_streak: number;
  best_streak: number;

  // Guess economy
  base_guesses: number;
  extra_guesses: number;
  last_reset_time?: string;
  next_reset_time?: string;

  // Items
  streak_shields: number;
  active_shield_date?: string;
  revenge_tokens: number;

  // Referral
  referral_code: string;
  friend_count: number;

  // State
  score_locked?: string;
  last_played_date?: string;

  // Daily rewards
  login_streak: number;
  last_reward_claim?: string;

  // League
  current_league: string;
  weekly_score: number;
  season_score: number;

  // Achievements
  achievements: string[];

  // Subscription
  has_weekly_pass: boolean;
  weekly_pass_expiry?: string;
  is_vip: boolean;
  vip_expiry?: string;

  // Stats
  total_correct: number;
  total_wrong: number;
  expert_correct: number;

  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  display_name?: string;
  avatar_emoji?: string;
  lifetime_score?: number;
  added_at: string;
}
