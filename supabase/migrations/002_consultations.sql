-- supabase/migrations/002_consultations.sql

CREATE TABLE consultations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id     UUID REFERENCES cases(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  urgency     TEXT NOT NULL CHECK (urgency IN ('electiva', 'urgente')),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'in_review', 'resolved')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_consultations"
  ON consultations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_consultations"
  ON consultations FOR INSERT WITH CHECK (auth.uid() = user_id);
