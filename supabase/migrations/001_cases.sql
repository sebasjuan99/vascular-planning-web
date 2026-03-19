-- supabase/migrations/001_cases.sql
-- Run in Supabase SQL Editor

CREATE TABLE cases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('evar', 'fevar')),
  patient_ref TEXT NOT NULL,
  notes       TEXT,
  pdf_url     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_cases"
  ON cases FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_cases"
  ON cases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_cases"
  ON cases FOR DELETE USING (auth.uid() = user_id);
