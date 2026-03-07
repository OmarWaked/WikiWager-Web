-- ============================================================================
-- WikiWager: Bot System Migration
-- Migration: 00002_bot_system.sql
-- Description: Add is_bot flag to users table and drop the FK constraint
--              so bot users can be inserted without auth.users entries.
-- ============================================================================

-- 1. Add bot flag column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

-- 2. Index for filtering bots
CREATE INDEX IF NOT EXISTS idx_users_is_bot ON public.users (is_bot);

-- 3. Drop the FK constraint on users.id -> auth.users(id)
--    This allows bot users to be inserted directly without auth entries.
--    Real users are still created via the handle_new_user() trigger on auth.users.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
