// ============================================================================
// seed-bots.ts — One-time CLI script to insert 2,560 bot users into Supabase
//
// Usage:  npx tsx src/scripts/seed-bots.ts
//
// This script is idempotent — it uses upsert with conflict resolution so
// running it multiple times will not create duplicates.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID, createHash } from 'crypto';

import {
  BOT_FIRST_NAMES,
  BOT_LAST_INITIALS,
  generateBotDisplayName,
  generateBotUsername,
} from '../lib/bot-names';
import { AVATAR_EMOJIS, LEAGUES } from '../lib/constants';

// ============================================================================
// Environment Loading
// ============================================================================

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    /* .env.local not found, rely on process.env */
  }
}

loadEnv();

// ============================================================================
// Supabase Client (service role — bypasses RLS)
// ============================================================================

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://iwcmbkzpvshlqpbtykpa.supabase.co';

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y21ia3pwdnNobHFwYnR5a3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjgzMDE3MiwiZXhwIjoyMDg4NDA2MTcyfQ.bt5YzAd_z4g4YeNgiZJYtWgn3-smLVmwSFioHaD6fMY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// Constants & Helpers
// ============================================================================

const TOTAL_BOTS = 2560;
const BATCH_SIZE = 100;
const FRIENDSHIP_PAIRS = 500;

/** Bot tier definitions with counts, score ranges, streak ranges, and win rates */
const TIER_CONFIG = [
  { tier: 'elite',    count: 50,   scoreMin: 15000, scoreMax: 80000, streakMin: 5,  streakMax: 15, bestStreakMin: 10, bestStreakMax: 30, winRate: 0.80 },
  { tier: 'strong',   count: 200,  scoreMin: 3000,  scoreMax: 15000, streakMin: 2,  streakMax: 10, bestStreakMin: 5,  bestStreakMax: 15, winRate: 0.65 },
  { tier: 'mid',      count: 800,  scoreMin: 500,   scoreMax: 3000,  streakMin: 1,  streakMax: 5,  bestStreakMin: 3,  bestStreakMax: 8,  winRate: 0.50 },
  { tier: 'casual',   count: 1000, scoreMin: 50,    scoreMax: 500,   streakMin: 0,  streakMax: 3,  bestStreakMin: 1,  bestStreakMax: 4,  winRate: 0.35 },
  { tier: 'newcomer', count: 510,  scoreMin: 0,     scoreMax: 50,    streakMin: 0,  streakMax: 1,  bestStreakMin: 0,  bestStreakMax: 2,  winRate: 0.25 },
] as const;

/** Random integer in [min, max] (inclusive) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array */
function randPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Generate a referral code from user ID: WW + first 6 hex chars of MD5 */
function makeReferralCode(id: string): string {
  const hash = createHash('md5').update(id).digest('hex');
  return 'WW' + hash.substring(0, 6).toUpperCase();
}

/**
 * Determine current_league from lifetime_score.
 * Iterates LEAGUES in reverse order to find the highest qualifying league.
 */
function leagueFromScore(score: number): string {
  const entries = Object.entries(LEAGUES) as [string, { minScore: number }][];
  // Sort descending by minScore so we find the highest qualifying first
  const sorted = [...entries].sort((a, b) => b[1].minScore - a[1].minScore);
  for (const [key, league] of sorted) {
    if (score >= league.minScore) return key;
  }
  return 'bronze'; // fallback
}

// ============================================================================
// Bot Generation
// ============================================================================

interface BotUser {
  id: string;
  display_name: string;
  username: string;
  avatar_emoji: string;
  referral_code: string;
  lifetime_score: number;
  today_score: number;
  today_tries: number;
  current_streak: number;
  best_streak: number;
  current_league: string;
  total_correct: number;
  total_wrong: number;
  is_bot: boolean;
  base_guesses: number;
  extra_guesses: number;
  streak_shields: number;
  revenge_tokens: number;
  friend_count: number;
  created_at: string;
  login_streak: number;
  achievements: never[];
  score_locked: null;
  last_played_date: null;
}

function generateBots(): BotUser[] {
  const bots: BotUser[] = [];
  let globalIndex = 0;

  for (const tier of TIER_CONFIG) {
    for (let i = 0; i < tier.count; i++) {
      const id = randomUUID();
      const displayName = generateBotDisplayName(globalIndex);
      const username = generateBotUsername(displayName, globalIndex);
      const lifetimeScore = randInt(tier.scoreMin, tier.scoreMax);
      const currentStreak = randInt(tier.streakMin, tier.streakMax);
      const bestStreak = randInt(tier.bestStreakMin, tier.bestStreakMax);

      // Derive total games and correct/wrong from win rate
      const totalGames = Math.floor(lifetimeScore / 150);
      const totalCorrect = Math.floor(totalGames * tier.winRate);
      const totalWrong = totalGames - totalCorrect;

      bots.push({
        id,
        display_name: displayName,
        username,
        avatar_emoji: randPick(AVATAR_EMOJIS),
        referral_code: makeReferralCode(id),
        lifetime_score: lifetimeScore,
        today_score: 0,
        today_tries: 0,
        current_streak: currentStreak,
        best_streak: Math.max(bestStreak, currentStreak), // best >= current
        current_league: leagueFromScore(lifetimeScore),
        total_correct: totalCorrect,
        total_wrong: totalWrong,
        is_bot: true,
        base_guesses: 5,
        extra_guesses: 0,
        streak_shields: 0,
        revenge_tokens: 0,
        friend_count: 0, // updated after friendships
        created_at: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        login_streak: randInt(0, 5),
        achievements: [],
        score_locked: null,
        last_played_date: null,
      });

      globalIndex++;
    }
  }

  return bots;
}

// ============================================================================
// Batch Insert Helpers
// ============================================================================

/** Split an array into chunks of a given size */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(`\nSupabase URL: ${SUPABASE_URL}`);
  console.log(`Service key:  ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);
  console.log('');

  // ── Step 1: Generate bots ──────────────────────────────────────────────
  console.log(`[1/5] Generating ${TOTAL_BOTS.toLocaleString()} bot users...`);
  const bots = generateBots();
  console.log(`      Generated ${bots.length} bots across ${TIER_CONFIG.length} tiers.`);

  // ── Step 2: Insert users ───────────────────────────────────────────────
  const userBatches = chunk(bots, BATCH_SIZE);
  const totalBatches = userBatches.length;
  console.log(`[2/5] Inserting users in batches of ${BATCH_SIZE}... (0/${totalBatches} batches)`);

  for (let i = 0; i < userBatches.length; i++) {
    const { error } = await supabase
      .from('users')
      .upsert(userBatches[i], { onConflict: 'id' });

    if (error) {
      console.error(`      ERROR on batch ${i + 1}:`, error.message);
      throw error;
    }

    // Log every 10 batches
    if ((i + 1) % 10 === 0 || i === userBatches.length - 1) {
      console.log(`[2/5] Inserting users in batches of ${BATCH_SIZE}... (${i + 1}/${totalBatches} batches)`);
    }
  }

  // ── Step 3: Insert referral codes ──────────────────────────────────────
  console.log('[3/5] Inserting referral codes...');
  const referralRows = bots.map((bot) => ({
    code: bot.referral_code,
    owner_id: bot.id,
  }));
  const referralBatches = chunk(referralRows, BATCH_SIZE);

  for (let i = 0; i < referralBatches.length; i++) {
    const { error } = await supabase
      .from('referral_codes')
      .upsert(referralBatches[i], { onConflict: 'code' });

    if (error) {
      console.error(`      ERROR on referral batch ${i + 1}:`, error.message);
      throw error;
    }
  }
  console.log(`      Inserted ${referralRows.length} referral codes.`);

  // ── Step 4: Create friendships ─────────────────────────────────────────
  console.log(`[4/5] Creating ${FRIENDSHIP_PAIRS} friendship pairs...`);

  // Pick 500 unique random pairs
  const botIds = bots.map((b) => b.id);
  const pairSet = new Set<string>();
  const friendshipRows: { user_id: string; friend_id: string; via: string }[] = [];

  while (pairSet.size < FRIENDSHIP_PAIRS) {
    const aIdx = Math.floor(Math.random() * botIds.length);
    let bIdx = Math.floor(Math.random() * botIds.length);
    if (aIdx === bIdx) continue; // no self-friendship

    const a = botIds[aIdx];
    const b = botIds[bIdx];
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (pairSet.has(key)) continue;

    pairSet.add(key);
    friendshipRows.push({ user_id: a, friend_id: b, via: 'bot' });
    friendshipRows.push({ user_id: b, friend_id: a, via: 'bot' });
  }

  // Insert friendship rows in batches (ignore duplicates via the unique constraint)
  const friendBatches = chunk(friendshipRows, BATCH_SIZE);
  for (let i = 0; i < friendBatches.length; i++) {
    const { error } = await supabase
      .from('friends')
      .upsert(friendBatches[i], { onConflict: 'user_id,friend_id' });

    if (error) {
      // If upsert with composite key fails, fall back to plain insert + ignore
      console.warn(`      WARN on friendship batch ${i + 1}: ${error.message}. Trying insert with ignore...`);
      // Insert one-by-one, ignoring duplicates
      for (const row of friendBatches[i]) {
        await supabase.from('friends').insert(row).select();
        // ignore individual errors (duplicate constraint violations)
      }
    }
  }
  console.log(`      Inserted ${friendshipRows.length} friendship rows (${FRIENDSHIP_PAIRS} pairs).`);

  // Update friend_count on affected users
  const friendCounts = new Map<string, number>();
  for (const row of friendshipRows) {
    friendCounts.set(row.user_id, (friendCounts.get(row.user_id) ?? 0) + 1);
  }

  console.log(`      Updating friend_count for ${friendCounts.size} users...`);
  const countEntries = Array.from(friendCounts.entries());
  const countBatches = chunk(countEntries, BATCH_SIZE);

  for (const batch of countBatches) {
    for (const [userId, count] of batch) {
      const { error } = await supabase
        .from('users')
        .update({ friend_count: count })
        .eq('id', userId);

      if (error) {
        console.warn(`      WARN updating friend_count for ${userId}: ${error.message}`);
      }
    }
  }

  // ── Step 5: Upsert alltime leaderboard ─────────────────────────────────
  console.log('[5/5] Upserting alltime leaderboard entries...');

  const leaderboardRows = bots
    .filter((b) => b.lifetime_score > 0)
    .map((b) => ({
      user_id: b.id,
      display_name: b.display_name,
      avatar_emoji: b.avatar_emoji,
      score: b.lifetime_score,
    }));

  const leaderboardBatches = chunk(leaderboardRows, BATCH_SIZE);
  for (let i = 0; i < leaderboardBatches.length; i++) {
    const { error } = await supabase
      .from('leaderboard_alltime')
      .upsert(leaderboardBatches[i], { onConflict: 'user_id' });

    if (error) {
      console.error(`      ERROR on leaderboard batch ${i + 1}:`, error.message);
      throw error;
    }

    if ((i + 1) % 10 === 0 || i === leaderboardBatches.length - 1) {
      console.log(`      Leaderboard: ${i + 1}/${leaderboardBatches.length} batches`);
    }
  }
  console.log(`      Upserted ${leaderboardRows.length} leaderboard entries.`);

  // ── Done ───────────────────────────────────────────────────────────────
  console.log(`\n\u2705 Done! Seeded ${bots.length.toLocaleString()} bots.\n`);
}

// Run
main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
