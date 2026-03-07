// ============================================================
// WikiWager Web — Constants
// Mirrors: WikiWager/WikiWager/Utilities/Constants.swift
// ============================================================

// ---- Game Config ----
export const GUESSES_PER_RESET = 5;
export const RESET_INTERVAL_HOURS = 12;
export const MAX_BASE_GUESSES = 15;
export const BASE_POINTS = 100;
export const STREAK_MULTIPLIER = 1.5;
export const MAX_FREE_TRIES = 3;

// ---- Difficulty ----
export const DIFFICULTIES = {
  normal: { label: 'Normal', options: 2, multiplier: 1, color: '#06D6A0', icon: '🧠' },
  hard:   { label: 'Hard',   options: 3, multiplier: 2, color: '#FFD700', icon: '🔥' },
  expert: { label: 'Expert', options: 4, multiplier: 3, color: '#FF6B6B', icon: '💀' },
} as const;

export type Difficulty = keyof typeof DIFFICULTIES;

// ---- Colors ----
export const COLORS = {
  deepVoid:       '#0A0E1A',
  deepVoidLight:  '#0F1629',
  neonViolet:     '#7C3AED',
  neonVioletLight:'#A855F7',
  electricCyan:   '#06D6A0',
  electricCyanLight:'#34D399',
  hotCoral:       '#EF4444',
  hotCoralLight:  '#FF6B6B',
  goldFlash:      '#FFD700',
  goldFlashLight: '#FBBF24',
  softWhite:      '#F0F0F5',
  mutedGray:      '#6B7280',
  cardBG:         '#1A1F35',
  cardBGLight:    '#252B45',
  cardBGHover:    '#2A3050',
} as const;

// ---- Stripe Product IDs ----
// These map to Stripe Price IDs. Replace with real IDs after creating products in Stripe Dashboard.
// To create in Stripe: Dashboard → Products → Add Product → copy the price_xxx ID
export const PRODUCTS = {
  guesses5:      'price_guesses5',       // TODO: Replace with real Stripe price ID
  guesses15:     'price_guesses15',      // TODO: Replace with real Stripe price ID
  guesses50:     'price_guesses50',      // TODO: Replace with real Stripe price ID
  shield1:       'price_shield1',        // TODO: Replace with real Stripe price ID
  shield3:       'price_shield3',        // TODO: Replace with real Stripe price ID
  shield10:      'price_shield10',       // TODO: Replace with real Stripe price ID
  revenge1:      'price_revenge1',       // TODO: Replace with real Stripe price ID
  revenge5:      'price_revenge5',       // TODO: Replace with real Stripe price ID
  starterPack:   'price_starter_pack',   // TODO: Replace with real Stripe price ID
  proPack:       'price_pro_pack',       // TODO: Replace with real Stripe price ID
  ultimatePack:  'price_ultimate_pack',  // TODO: Replace with real Stripe price ID
  weeklyPass:    'price_weekly_pass',    // TODO: Replace with real Stripe price ID
  monthlyVIP:    'price_monthly_vip',    // TODO: Replace with real Stripe price ID
} as const;

// ---- Complete Product Catalog ----
// Single source of truth for all products. Used by:
//   - Store UI (name, displayPrice, tag)
//   - Stripe checkout (amountCents, currency, mode)
//   - Webhook fulfillment (guesses, shields, revenge)
//   - iOS IAP cross-reference (iosProductId)
export const PRODUCT_DETAILS = {
  // --- Guess Packs (one-time consumables) ---
  guesses5: {
    name: '5 Guesses',
    displayPrice: '$1.99',
    amountCents: 199,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 5, shields: 0, revenge: 0,
    tag: '',
    iosProductId: 'com.wikiwager.guesses5',
    stripeProductName: 'WikiWager - 5 Extra Guesses',
    stripeDescription: '5 extra guesses for WikiWager',
  },
  guesses15: {
    name: '15 Guesses',
    displayPrice: '$3.99',
    amountCents: 399,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 15, shields: 0, revenge: 0,
    tag: 'Popular',
    iosProductId: 'com.wikiwager.guesses15',
    stripeProductName: 'WikiWager - 15 Extra Guesses',
    stripeDescription: '15 extra guesses for WikiWager',
  },
  guesses50: {
    name: '50 Guesses',
    displayPrice: '$9.99',
    amountCents: 999,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 50, shields: 0, revenge: 0,
    tag: '',
    iosProductId: 'com.wikiwager.guesses50',
    stripeProductName: 'WikiWager - 50 Extra Guesses',
    stripeDescription: '50 extra guesses for WikiWager',
  },

  // --- Streak Shields (one-time consumables) ---
  shield1: {
    name: '1 Shield',
    displayPrice: '$0.99',
    amountCents: 99,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 0, shields: 1, revenge: 0,
    tag: '',
    iosProductId: 'com.wikiwager.shield1',
    stripeProductName: 'WikiWager - 1 Streak Shield',
    stripeDescription: 'Protect your streak from one wrong answer',
  },
  shield3: {
    name: '3 Shields',
    displayPrice: '$1.99',
    amountCents: 199,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 0, shields: 3, revenge: 0,
    tag: 'Best Value',
    iosProductId: 'com.wikiwager.shield3',
    stripeProductName: 'WikiWager - 3 Streak Shields',
    stripeDescription: '3 streak shields to protect your streak',
  },
  shield10: {
    name: '10 Shields',
    displayPrice: '$4.99',
    amountCents: 499,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 0, shields: 10, revenge: 0,
    tag: '',
    iosProductId: 'com.wikiwager.shield10',
    stripeProductName: 'WikiWager - 10 Streak Shields',
    stripeDescription: '10 streak shields to protect your streak',
  },

  // --- Revenge Tokens (one-time consumables) ---
  revenge1: {
    name: '1 Revenge',
    displayPrice: '$0.99',
    amountCents: 99,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 0, shields: 0, revenge: 1,
    tag: '',
    iosProductId: 'com.wikiwager.revenge1',
    stripeProductName: 'WikiWager - 1 Revenge Token',
    stripeDescription: 'Retry a wrong answer with one option eliminated',
  },
  revenge5: {
    name: '5 Revenge',
    displayPrice: '$2.99',
    amountCents: 299,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 0, shields: 0, revenge: 5,
    tag: '',
    iosProductId: 'com.wikiwager.revenge5',
    stripeProductName: 'WikiWager - 5 Revenge Tokens',
    stripeDescription: '5 revenge tokens to retry wrong answers',
  },

  // --- Bundles (one-time consumables) ---
  starterPack: {
    name: 'Starter Pack',
    displayPrice: '$4.99',
    amountCents: 499,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 10, shields: 2, revenge: 2,
    tag: '20% Savings',
    iosProductId: 'com.wikiwager.starter_pack',
    stripeProductName: 'WikiWager - Starter Pack',
    stripeDescription: '10 guesses + 2 shields + 2 revenge tokens (20% savings)',
  },
  proPack: {
    name: 'Pro Pack',
    displayPrice: '$9.99',
    amountCents: 999,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 30, shields: 5, revenge: 5,
    tag: '35% Savings',
    iosProductId: 'com.wikiwager.pro_pack',
    stripeProductName: 'WikiWager - Pro Pack',
    stripeDescription: '30 guesses + 5 shields + 5 revenge tokens (35% savings)',
  },
  ultimatePack: {
    name: 'Ultimate Pack',
    displayPrice: '$19.99',
    amountCents: 1999,
    currency: 'usd',
    mode: 'payment' as const,
    guesses: 100, shields: 15, revenge: 15,
    tag: '50% Savings',
    iosProductId: 'com.wikiwager.ultimate_pack',
    stripeProductName: 'WikiWager - Ultimate Pack',
    stripeDescription: '100 guesses + 15 shields + 15 revenge tokens (50% savings)',
  },

  // --- Subscriptions (recurring) ---
  weeklyPass: {
    name: 'Weekly Pass',
    displayPrice: '$2.99/wk',
    amountCents: 299,
    currency: 'usd',
    mode: 'subscription' as const,
    interval: 'week' as const,
    guesses: 50, shields: 0, revenge: 0,
    tag: 'Unlimited',
    iosProductId: 'com.wikiwager.weekly_pass',
    stripeProductName: 'WikiWager - Weekly Pass',
    stripeDescription: '50 guesses per week + ad-free experience',
  },
  monthlyVIP: {
    name: 'Monthly VIP',
    displayPrice: '$9.99/mo',
    amountCents: 999,
    currency: 'usd',
    mode: 'subscription' as const,
    interval: 'month' as const,
    guesses: 100, shields: 3, revenge: 3,
    tag: 'Best Value',
    iosProductId: 'com.wikiwager.monthly_vip',
    stripeProductName: 'WikiWager - Monthly VIP',
    stripeDescription: '100 guesses + 3 shields + 3 revenge tokens per month + ad-free + VIP badge',
  },
} as const;

// Helper: get display price (backwards compat)
export type ProductId = keyof typeof PRODUCT_DETAILS;
export function getProductPrice(id: ProductId): string {
  return PRODUCT_DETAILS[id].displayPrice;
}

// ---- Bot Simulation Tiers ----
export const BOT_TIERS = {
  elite:    { tier: 'elite',    winRate: 0.80, playChance: 0.85, roundsRange: [2, 3] as const, streakBreakChance: 0.15 },
  strong:   { tier: 'strong',   winRate: 0.65, playChance: 0.70, roundsRange: [2, 3] as const, streakBreakChance: 0.30 },
  mid:      { tier: 'mid',      winRate: 0.50, playChance: 0.55, roundsRange: [1, 3] as const, streakBreakChance: 0.45 },
  casual:   { tier: 'casual',   winRate: 0.35, playChance: 0.35, roundsRange: [1, 2] as const, streakBreakChance: 0.60 },
  newcomer: { tier: 'newcomer', winRate: 0.25, playChance: 0.20, roundsRange: [1, 2] as const, streakBreakChance: 0.75 },
} as const;

export type BotTier = keyof typeof BOT_TIERS;

export function getBotTierFromScore(lifetimeScore: number): typeof BOT_TIERS[BotTier] {
  if (lifetimeScore >= 8000) return BOT_TIERS.elite;
  if (lifetimeScore >= 3000) return BOT_TIERS.strong;
  if (lifetimeScore >= 500) return BOT_TIERS.mid;
  if (lifetimeScore >= 50) return BOT_TIERS.casual;
  return BOT_TIERS.newcomer;
}

// ---- Near-Miss Messages (for wrong answers) ----
export const NEAR_MISS_MESSAGES = [
  'So close! That was a tough one.',
  'Almost had it! Keep going.',
  'Tricky question — most players miss this one.',
  'You were on the right track!',
  'Don\'t give up — your next one could be legendary!',
  'The best players miss one now and then.',
  'One wrong answer away from greatness!',
  'Wikipedia can be deceiving — shake it off!',
] as const;

// ---- Ad Reward Limits ----
export const AD_REWARDS_PER_DAY = 3;

// ---- Leagues ----
export const LEAGUES = {
  bronze:       { name: 'Bronze',       minScore: 0,     emoji: '🥉', color: '#CD7F32', weeklyGuesses: 2,  weeklyShields: 0, weeklyRevenge: 0 },
  silver:       { name: 'Silver',       minScore: 500,   emoji: '🥈', color: '#C0C0C0', weeklyGuesses: 3,  weeklyShields: 0, weeklyRevenge: 0 },
  gold:         { name: 'Gold',         minScore: 1500,  emoji: '🥇', color: '#FFD700', weeklyGuesses: 5,  weeklyShields: 1, weeklyRevenge: 0 },
  platinum:     { name: 'Platinum',     minScore: 3500,  emoji: '💎', color: '#E5E4E2', weeklyGuesses: 7,  weeklyShields: 1, weeklyRevenge: 1 },
  diamond:      { name: 'Diamond',      minScore: 7000,  emoji: '💠', color: '#B9F2FF', weeklyGuesses: 10, weeklyShields: 2, weeklyRevenge: 1 },
  master:       { name: 'Master',       minScore: 15000, emoji: '👑', color: '#FF6B6B', weeklyGuesses: 15, weeklyShields: 3, weeklyRevenge: 2 },
  grandmaster:  { name: 'Grandmaster',  minScore: 30000, emoji: '🏆', color: '#A855F7', weeklyGuesses: 25, weeklyShields: 5, weeklyRevenge: 3 },
} as const;

// ---- Daily Rewards (7-day cycle) ----
export const DAILY_REWARDS = [
  { day: 1, guesses: 1, shields: 0, revenge: 0, label: '+1 Guess' },
  { day: 2, guesses: 1, shields: 0, revenge: 0, label: '+1 Guess' },
  { day: 3, guesses: 2, shields: 0, revenge: 0, label: '+2 Guesses' },
  { day: 4, guesses: 1, shields: 0, revenge: 0, label: '+1 Guess' },
  { day: 5, guesses: 1, shields: 2, revenge: 0, label: '+1 Guess & 2 Shields' },
  { day: 6, guesses: 2, shields: 0, revenge: 0, label: '+2 Guesses' },
  { day: 7, guesses: 5, shields: 1, revenge: 1, label: 'JACKPOT!' },
] as const;

// ---- Achievements ----
export const ACHIEVEMENTS = [
  { id: 'first_win',       name: 'First Win',       desc: 'Get your first correct answer', rarity: 'common',    icon: '🎯', reward: { guesses: 1 } },
  { id: 'streak_3',        name: 'Hat Trick',        desc: '3-day streak',                  rarity: 'common',    icon: '🔥', reward: { guesses: 1 } },
  { id: 'streak_7',        name: 'On Fire',          desc: '7-day streak',                  rarity: 'uncommon',  icon: '🔥', reward: { guesses: 2 } },
  { id: 'streak_14',       name: 'Unstoppable',      desc: '14-day streak',                 rarity: 'rare',      icon: '⚡', reward: { guesses: 3 } },
  { id: 'streak_30',       name: 'Legend',            desc: '30-day streak',                 rarity: 'epic',      icon: '👑', reward: { guesses: 5 } },
  { id: 'streak_100',      name: 'Immortal',         desc: '100-day streak',                rarity: 'legendary', icon: '🏆', reward: { guesses: 10 } },
  { id: 'correct_10',      name: 'Quick Learner',    desc: '10 correct answers',            rarity: 'common',    icon: '📚', reward: { shields: 1 } },
  { id: 'correct_50',      name: 'Scholar',          desc: '50 correct answers',            rarity: 'uncommon',  icon: '🎓', reward: { shields: 1 } },
  { id: 'correct_100',     name: 'Professor',        desc: '100 correct answers',           rarity: 'rare',      icon: '🏛️', reward: { shields: 2 } },
  { id: 'correct_500',     name: 'Sage',             desc: '500 correct answers',           rarity: 'epic',      icon: '🧙', reward: { shields: 3 } },
  { id: 'correct_1000',    name: 'Oracle',           desc: '1000 correct answers',          rarity: 'legendary', icon: '🔮', reward: { shields: 3 } },
  { id: 'score_1k',        name: 'Rising Star',      desc: 'Reach 1,000 lifetime score',    rarity: 'common',    icon: '⭐', reward: { revenge: 1 } },
  { id: 'score_5k',        name: 'High Roller',      desc: 'Reach 5,000 lifetime score',    rarity: 'uncommon',  icon: '💰', reward: { revenge: 1 } },
  { id: 'score_10k',       name: 'Tycoon',           desc: 'Reach 10,000 lifetime score',   rarity: 'rare',      icon: '💎', reward: { revenge: 2 } },
  { id: 'score_50k',       name: 'Mogul',            desc: 'Reach 50,000 lifetime score',   rarity: 'epic',      icon: '🏰', reward: { revenge: 2 } },
  { id: 'score_100k',      name: 'Titan',            desc: 'Reach 100,000 lifetime score',  rarity: 'legendary', icon: '🌟', reward: { revenge: 2 } },
  { id: 'perfect_day',     name: 'Perfect Day',      desc: 'All correct, no mistakes',      rarity: 'rare',      icon: '✨', reward: { revenge: 1 } },
  { id: 'night_owl',       name: 'Night Owl',        desc: 'Play after midnight',           rarity: 'uncommon',  icon: '🦉', reward: { guesses: 1 } },
  { id: 'early_bird',      name: 'Early Bird',       desc: 'Play before 6am',               rarity: 'uncommon',  icon: '🐦', reward: { guesses: 1 } },
  { id: 'speed_demon',     name: 'Speed Demon',      desc: 'Answer in under 3 seconds',     rarity: 'rare',      icon: '⚡', reward: { revenge: 1 } },
  { id: 'expert_master',   name: 'Expert Master',    desc: '10 correct on Expert',          rarity: 'epic',      icon: '💀', reward: { shields: 1 } },
  { id: 'social_butterfly', name: 'Social Butterfly', desc: 'Add 5 friends',                rarity: 'uncommon',  icon: '🦋', reward: { guesses: 3 } },
  { id: 'big_spender',     name: 'Big Spender',      desc: 'First purchase',                rarity: 'common',    icon: '🛍️', reward: { shields: 1 } },
] as const;

// ---- Avatar Emojis ----
export const AVATAR_EMOJIS = [
  '🧠', '🎯', '🔥', '⚡', '💎', '👑', '🏆', '🦊', '🐉', '🦁',
  '🐺', '🦅', '🐙', '🦋', '🌟', '🎮', '🎲', '🃏', '🎪', '🚀',
  '🌈', '🍀', '🎸', '🎭', '🤖', '👽', '🧙', '🧛', '🦸', '🥷',
];

// ---- AdSense ----
export const ADSENSE_PUB_ID = 'ca-pub-6274768808904329';

// ---- Referral ----
export const REFERRAL_BONUS_GUESSES = 2;
