-- Phase 1-4: Dynamic pricing, coupons, and manual-grant tracking
-- All admin-only data; no end-user RLS reads expected.

-- 1) products: editable price + active toggle per course/tool
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  price       NUMERIC(10,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'CLP',
  active      BOOLEAN NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

INSERT INTO products (id, price) VALUES
  ('acceso-calculadoras',  50000),
  ('curso-evar',          897000),
  ('curso-fevar',         897000),
  ('curso-tevar',         897000),
  ('curso-angiografia',   897000),
  ('curso-ultrasonido',   897000),
  ('curso-accesos',       897000)
ON CONFLICT (id) DO NOTHING;

-- 2) coupons: discount codes with usage tracking
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value  NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  product_ids     TEXT[],
  max_uses        INTEGER,
  uses_count      INTEGER NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until     TIMESTAMPTZ,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(LOWER(code));
CREATE INDEX IF NOT EXISTS coupons_active_idx ON coupons(active) WHERE active = true;

-- 3) Track coupon use + manual-grant metadata on each purchase
ALTER TABLE course_purchases
  ADD COLUMN IF NOT EXISTS coupon_id          UUID REFERENCES coupons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS granted_manually   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS manual_grant_notes TEXT,
  ADD COLUMN IF NOT EXISTS granted_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL;
