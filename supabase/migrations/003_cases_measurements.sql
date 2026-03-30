-- Run in Supabase SQL Editor
-- Adds measurements column and UPDATE policy for case editing

ALTER TABLE cases ADD COLUMN IF NOT EXISTS measurements JSONB;

CREATE POLICY "users_update_own_cases"
  ON cases FOR UPDATE USING (auth.uid() = user_id);
