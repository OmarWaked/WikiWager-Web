-- ============================================================================
-- WikiWager: Initial Database Schema
-- Migration: 00001_initial_schema.sql
-- Description: Complete database schema including tables, indexes, RLS
--              policies, triggers, and the handle_new_user function.
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE public.users (
  -- Identity
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  phone_number    TEXT,
  display_name    TEXT NOT NULL DEFAULT '',
  username        TEXT UNIQUE,
  avatar_emoji    TEXT NOT NULL DEFAULT '🧠',

  -- Scoring
  lifetime_score  INTEGER NOT NULL DEFAULT 0,
  today_score     INTEGER NOT NULL DEFAULT 0,
  today_tries     INTEGER NOT NULL DEFAULT 0,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  best_streak     INTEGER NOT NULL DEFAULT 0,

  -- Guess economy
  base_guesses    INTEGER NOT NULL DEFAULT 5,
  extra_guesses   INTEGER NOT NULL DEFAULT 0,
  last_reset_time TIMESTAMPTZ,
  next_reset_time TIMESTAMPTZ,

  -- Items
  streak_shields  INTEGER NOT NULL DEFAULT 0,
  active_shield_date DATE,
  revenge_tokens  INTEGER NOT NULL DEFAULT 0,

  -- Referral
  referral_code   TEXT UNIQUE NOT NULL,
  friend_count    INTEGER NOT NULL DEFAULT 0,

  -- State
  score_locked    DATE,
  last_played_date DATE,

  -- Daily rewards
  login_streak    INTEGER NOT NULL DEFAULT 0,
  last_reward_claim DATE,

  -- League
  current_league    TEXT DEFAULT 'bronze',
  weekly_score      INTEGER NOT NULL DEFAULT 0,
  season_score      INTEGER NOT NULL DEFAULT 0,
  last_weekly_reset DATE,
  league_promotions INTEGER NOT NULL DEFAULT 0,

  -- Achievements
  achievements    TEXT[] DEFAULT '{}',

  -- Purchase tracking
  has_made_purchase BOOLEAN DEFAULT false,
  total_purchases   INTEGER NOT NULL DEFAULT 0,
  has_weekly_pass   BOOLEAN DEFAULT false,
  weekly_pass_expiry DATE,
  is_vip            BOOLEAN DEFAULT false,
  vip_expiry        DATE,

  -- Stats
  total_correct   INTEGER NOT NULL DEFAULT 0,
  total_wrong     INTEGER NOT NULL DEFAULT 0,
  expert_correct  INTEGER NOT NULL DEFAULT 0,
  challenge_wins  INTEGER NOT NULL DEFAULT 0,

  -- Meta
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users indexes
CREATE INDEX idx_users_username        ON public.users (username);
CREATE INDEX idx_users_referral_code   ON public.users (referral_code);
CREATE INDEX idx_users_lifetime_score  ON public.users (lifetime_score DESC);
CREATE INDEX idx_users_today_score     ON public.users (today_score DESC);
CREATE INDEX idx_users_league_weekly   ON public.users (current_league, weekly_score DESC);
CREATE INDEX idx_users_last_played     ON public.users (last_played_date);


-- ============================================================================
-- 2. WIKI_PAGES TABLE
-- ============================================================================
CREATE TABLE public.wiki_pages (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  extract     TEXT NOT NULL,
  thumbnail   TEXT,
  description TEXT,
  last_used   TIMESTAMPTZ,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wiki_pages_last_used ON public.wiki_pages (last_used ASC NULLS FIRST);


-- ============================================================================
-- 3. DAILY_SEEDS TABLE
-- ============================================================================
CREATE TABLE public.daily_seeds (
  date       DATE PRIMARY KEY,
  seed       TEXT NOT NULL,
  page_pool  TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 4. GAME_ANSWERS TABLE (anti-cheat)
-- ============================================================================
CREATE TABLE public.game_answers (
  id              TEXT PRIMARY KEY, -- format: "{user_id}-{date}-{round}"
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  round_number    INTEGER NOT NULL,
  correct_page_id TEXT,
  current_page_id TEXT,
  options         TEXT[],
  difficulty      TEXT DEFAULT 'normal',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_answers_user_date ON public.game_answers (user_id, date);


-- ============================================================================
-- 5. GAME_SESSIONS TABLE
-- ============================================================================
CREATE TABLE public.game_sessions (
  id               TEXT PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  round_number     INTEGER NOT NULL,
  selected_page_id TEXT,
  correct_page_id  TEXT,
  is_correct       BOOLEAN,
  points_earned    INTEGER NOT NULL DEFAULT 0,
  streak           INTEGER NOT NULL DEFAULT 0,
  difficulty       TEXT DEFAULT 'normal',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_game_sessions_user_created ON public.game_sessions (user_id, created_at DESC);
CREATE INDEX idx_game_sessions_date_points  ON public.game_sessions (date DESC, points_earned DESC);


-- ============================================================================
-- 6. LEADERBOARD_DAILY TABLE
-- ============================================================================
CREATE TABLE public.leaderboard_daily (
  user_id      UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_emoji TEXT DEFAULT '🧠',
  score        INTEGER NOT NULL DEFAULT 0,
  rank         INTEGER,
  date         DATE,
  is_vip       BOOLEAN DEFAULT false,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_daily_score ON public.leaderboard_daily (score DESC);
CREATE INDEX idx_leaderboard_daily_date  ON public.leaderboard_daily (date);


-- ============================================================================
-- 7. LEADERBOARD_ALLTIME TABLE
-- ============================================================================
CREATE TABLE public.leaderboard_alltime (
  user_id      UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_emoji TEXT DEFAULT '🧠',
  score        INTEGER NOT NULL DEFAULT 0,
  rank         INTEGER,
  is_vip       BOOLEAN DEFAULT false,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_alltime_score ON public.leaderboard_alltime (score DESC);


-- ============================================================================
-- 8. REFERRAL_CODES TABLE
-- ============================================================================
CREATE TABLE public.referral_codes (
  code             TEXT PRIMARY KEY,
  owner_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  redeemed_by      UUID[] DEFAULT '{}',
  redemption_count INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 9. FRIENDS TABLE
-- ============================================================================
CREATE TABLE public.friends (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  via       TEXT DEFAULT 'referral',
  added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friends_user_id   ON public.friends (user_id);
CREATE INDEX idx_friends_friend_id ON public.friends (friend_id);


-- ============================================================================
-- 10. CHALLENGES TABLE
-- ============================================================================
CREATE TABLE public.challenges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Challenger
  challenger_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenger_name   TEXT,
  challenger_avatar TEXT DEFAULT '🧠',
  challenger_score  INTEGER,

  -- Opponent
  opponent_id       UUID REFERENCES public.users(id) ON DELETE CASCADE,
  opponent_name     TEXT,
  opponent_avatar   TEXT DEFAULT '🧠',
  opponent_score    INTEGER,

  -- Challenge details
  wager_amount      INTEGER,
  difficulty        TEXT DEFAULT 'normal',
  status            TEXT DEFAULT 'pending',
  game_round_ids    TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ
);

CREATE INDEX idx_challenges_challenger ON public.challenges (challenger_id);
CREATE INDEX idx_challenges_opponent   ON public.challenges (opponent_id);
CREATE INDEX idx_challenges_status     ON public.challenges (status);


-- ============================================================================
-- 11. PURCHASES TABLE
-- ============================================================================
CREATE TABLE public.purchases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id            TEXT,
  stripe_session_id     TEXT,
  stripe_payment_intent TEXT,
  amount_cents          INTEGER,
  guesses_granted       INTEGER NOT NULL DEFAULT 0,
  shields_granted       INTEGER NOT NULL DEFAULT 0,
  revenge_granted       INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_user_created ON public.purchases (user_id, created_at DESC);


-- ============================================================================
-- 12. SHARED_RESULTS TABLE
-- ============================================================================
CREATE TABLE public.shared_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  avatar_emoji    TEXT DEFAULT '🧠',
  day_number      INTEGER,
  score           INTEGER,
  streak          INTEGER,
  correct_answers INTEGER,
  total_attempts  INTEGER,
  difficulty      TEXT DEFAULT 'normal',
  is_locked       BOOLEAN DEFAULT false,
  emoji_grid      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 13. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();


-- ============================================================================
-- 14. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ---------- users ----------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read all users (for leaderboards, profiles, etc.)
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update ONLY their own row, and ONLY safe fields.
-- Scoring / economy / achievement fields are excluded and can only be
-- modified by service_role (which bypasses RLS).
CREATE POLICY "users_update_own_safe_fields"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Restrict which columns authenticated users can actually change.
-- We revoke UPDATE on the protected columns so that even though the
-- policy above allows the row, the column-level grants block writes
-- to scoring fields.
REVOKE UPDATE ON public.users FROM authenticated;

GRANT UPDATE (
  display_name,
  username,
  avatar_emoji,
  login_streak,
  last_reward_claim
) ON public.users TO authenticated;

-- ---------- wiki_pages ----------
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wiki_pages_select_authenticated"
  ON public.wiki_pages FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies for authenticated — only service_role.

-- ---------- daily_seeds ----------
ALTER TABLE public.daily_seeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_seeds_select_authenticated"
  ON public.daily_seeds FOR SELECT
  TO authenticated
  USING (true);

-- ---------- game_answers ----------
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_answers_select_own"
  ON public.game_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No client writes — only service_role can INSERT/UPDATE/DELETE.

-- ---------- game_sessions ----------
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "game_sessions_select_own"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No client writes — only service_role can INSERT/UPDATE/DELETE.

-- ---------- leaderboard_daily ----------
ALTER TABLE public.leaderboard_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_daily_select_authenticated"
  ON public.leaderboard_daily FOR SELECT
  TO authenticated
  USING (true);

-- No client writes.

-- ---------- leaderboard_alltime ----------
ALTER TABLE public.leaderboard_alltime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_alltime_select_authenticated"
  ON public.leaderboard_alltime FOR SELECT
  TO authenticated
  USING (true);

-- No client writes.

-- ---------- referral_codes ----------
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_codes_select_authenticated"
  ON public.referral_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "referral_codes_insert_own"
  ON public.referral_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- ---------- friends ----------
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select_own"
  ON public.friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ---------- challenges ----------
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_own"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- ---------- purchases ----------
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases_select_own"
  ON public.purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------- shared_results ----------
ALTER TABLE public.shared_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shared_results_select_public"
  ON public.shared_results FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "shared_results_insert_authenticated"
  ON public.shared_results FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ============================================================================
-- 15. HANDLE_NEW_USER FUNCTION & TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_code TEXT;
BEGIN
  generated_code := 'WW' || UPPER(SUBSTR(MD5(NEW.id::text), 1, 6));

  -- Create the user profile
  INSERT INTO public.users (
    id,
    email,
    phone_number,
    referral_code,
    base_guesses,
    next_reset_time
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    generated_code,
    5,
    NOW() + INTERVAL '12 hours'
  );

  -- Create the matching referral code entry
  INSERT INTO public.referral_codes (
    code,
    owner_id
  ) VALUES (
    generated_code,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
