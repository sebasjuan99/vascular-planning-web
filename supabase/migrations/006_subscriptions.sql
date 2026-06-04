-- Phase A: Subscription model for the EVAR+FEVAR calculators bundle.
-- Replaces the one-time 'acceso-calculadoras' product with two
-- recurring options (monthly / yearly), both granting the same modules.

CREATE TABLE IF NOT EXISTS subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id               TEXT NOT NULL,
  mp_preapproval_id        TEXT UNIQUE,
  mp_preapproval_plan_id   TEXT,
  status                   TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','authorized','paused','cancelled','expired')),
  amount                   NUMERIC(10,2) NOT NULL,
  currency                 TEXT NOT NULL DEFAULT 'CLP',
  frequency_value          INTEGER NOT NULL DEFAULT 1,
  frequency_type           TEXT   NOT NULL CHECK (frequency_type IN ('months','years','days')),
  start_date               TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT false,
  cancelled_at             TIMESTAMPTZ,
  init_point               TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS subscriptions_user_idx     ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS subscriptions_mp_idx       ON subscriptions(mp_preapproval_id);
CREATE INDEX IF NOT EXISTS subscriptions_product_idx  ON subscriptions(product_id, status);
CREATE POLICY "users_select_own_subs" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS subscription_charges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  mp_payment_id   TEXT,
  amount          NUMERIC(10,2),
  currency        TEXT DEFAULT 'CLP',
  status          TEXT,
  charged_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE subscription_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_sub_charges" ON subscription_charges
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM subscriptions s WHERE s.id = subscription_id AND s.user_id = auth.uid())
  );

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_subscription   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS frequency_value   INTEGER,
  ADD COLUMN IF NOT EXISTS frequency_type    TEXT;

UPDATE products SET active = false WHERE id = 'acceso-calculadoras';

INSERT INTO products (id, price, currency, active, is_subscription, frequency_value, frequency_type) VALUES
  ('suscripcion-calculadoras-mensual',  50000, 'CLP', true, true, 1, 'months'),
  ('suscripcion-calculadoras-anual',   480000, 'CLP', true, true, 1, 'years')
ON CONFLICT (id) DO NOTHING;
