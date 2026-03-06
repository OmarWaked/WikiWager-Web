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
export const PRODUCTS = {
  guesses5:      'price_guesses5',
  guesses15:     'price_guesses15',
  guesses50:     'price_guesses50',
  shield1:       'price_shield1',
  shield3:       'price_shield3',
  shield10:      'price_shield10',
  revenge1:      'price_revenge1',
  revenge5:      'price_revenge5',
  starterPack:   'price_starter_pack',
  proPack:       'price_pro_pack',
  ultimatePack:  'price_ultimate_pack',
  weeklyPass:    'price_weekly_pass',
  monthlyVIP:    'price_monthly_vip',
} as const;

// ---- Product Metadata ----
export const PRODUCT_DETAILS = {
  guesses5:     { name: '5 Guesses',     price: '$1.99',  guesses: 5,   shields: 0,  revenge: 0,  tag: '' },
  guesses15:    { name: '15 Guesses',    price: '$3.99',  guesses: 15,  shields: 0,  revenge: 0,  tag: 'Popular' },
  guesses50:    { name: '50 Guesses',    price: '$9.99',  guesses: 50,  shields: 0,  revenge: 0,  tag: '' },
  shield1:      { name: '1 Shield',      price: '$0.99',  guesses: 0,   shields: 1,  revenge: 0,  tag: '' },
  shield3:      { name: '3 Shields',     price: '$1.99',  guesses: 0,   shields: 3,  revenge: 0,  tag: 'Best Value' },
  shield10:     { name: '10 Shields',    price: '$4.99',  guesses: 0,   shields: 10, revenge: 0,  tag: '' },
  revenge1:     { name: '1 Revenge',     price: '$0.99',  guesses: 0,   shields: 0,  revenge: 1,  tag: '' },
  revenge5:     { name: '5 Revenge',     price: '$2.99',  guesses: 0,   shields: 0,  revenge: 5,  tag: '' },
  starterPack:  { name: 'Starter Pack',  price: '$4.99',  guesses: 10,  shields: 2,  revenge: 2,  tag: '20% Savings' },
  proPack:      { name: 'Pro Pack',      price: '$9.99',  guesses: 30,  shields: 5,  revenge: 5,  tag: '35% Savings' },
  ultimatePack: { name: 'Ultimate Pack', price: '$19.99', guesses: 100, shields: 15, revenge: 15, tag: '50% Savings' },
  weeklyPass:   { name: 'Weekly Pass',   price: '$2.99/wk',  guesses: 50,  shields: 0,  revenge: 0,  tag: 'Unlimited' },
  monthlyVIP:   { name: 'Monthly VIP',   price: '$9.99/mo',  guesses: 100, shields: 3,  revenge: 3,  tag: 'Best Value' },
} as const;

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
