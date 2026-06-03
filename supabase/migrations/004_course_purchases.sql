-- supabase/migrations/004_course_purchases.sql
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS course_purchases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id        TEXT NOT NULL,
  mp_preference_id TEXT,
  mp_payment_id    TEXT,
  mp_init_point    TEXT,
  status           TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','refunded')),
  amount           NUMERIC(12,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'CLP',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  approved_at      TIMESTAMPTZ
);

-- Defense-in-depth: no more than 1 approved purchase per (user, course)
CREATE UNIQUE INDEX IF NOT EXISTS cp_unique_approved
  ON course_purchases (user_id, course_id)
  WHERE status = 'approved';

-- Fast lookup for "any pending preference for user+course"
CREATE INDEX IF NOT EXISTS cp_user_course_status
  ON course_purchases (user_id, course_id, status);

-- Lookup by MercadoPago IDs (webhook)
CREATE INDEX IF NOT EXISTS cp_mp_preference_id
  ON course_purchases (mp_preference_id);

ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only see their own purchase records
DROP POLICY IF EXISTS "users_select_own_purchases" ON course_purchases;
CREATE POLICY "users_select_own_purchases"
  ON course_purchases FOR SELECT USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies → only service role can mutate.
-- This means the API routes must use createAdminClient() for writes.
