-- Fase 25.5 — Repasses, Reservas e Disponibilidade Financeira
-- 25.5-payouts-reserves-availability-2026-09-02
CREATE TABLE IF NOT EXISTS producer_balance_reserves (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT,
  producer_id BIGINT NOT NULL,
  event_id BIGINT,
  reserve_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'active',
  reason TEXT NOT NULL,
  ledger_batch_id BIGINT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  releases_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_by BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_balance_reserves_producer_status ON producer_balance_reserves(producer_id,status);
CREATE INDEX IF NOT EXISTS idx_balance_reserves_event_status ON producer_balance_reserves(event_id,status);

CREATE TABLE IF NOT EXISTS payout_commitments (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT,
  producer_id BIGINT NOT NULL,
  event_id BIGINT,
  payout_reference TEXT NOT NULL UNIQUE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  status TEXT NOT NULL DEFAULT 'requested',
  bank_account_ref TEXT,
  method TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  ledger_batch_id BIGINT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payout_commitments_producer_status ON payout_commitments(producer_id,status);

CREATE OR REPLACE VIEW producer_payout_availability AS
WITH reserves AS (
  SELECT producer_id,event_id,SUM(amount_cents) AS reserved_cents
  FROM producer_balance_reserves WHERE status='active' GROUP BY producer_id,event_id
), commitments AS (
  SELECT producer_id,event_id,SUM(amount_cents) AS committed_cents
  FROM payout_commitments WHERE status IN ('requested','approved','scheduled','processing') GROUP BY producer_id,event_id
), ledger AS (
  SELECT producer_id,event_id,COALESCE(SUM(balance_cents),0) AS ledger_balance_cents
  FROM ledger_producer_balances GROUP BY producer_id,event_id
)
SELECT l.producer_id,l.event_id,l.ledger_balance_cents,
  COALESCE(r.reserved_cents,0) AS reserved_cents,
  COALESCE(c.committed_cents,0) AS committed_cents,
  GREATEST(l.ledger_balance_cents-COALESCE(r.reserved_cents,0)-COALESCE(c.committed_cents,0),0) AS available_for_payout_cents
FROM ledger l
LEFT JOIN reserves r ON r.producer_id=l.producer_id AND r.event_id IS NOT DISTINCT FROM l.event_id
LEFT JOIN commitments c ON c.producer_id=l.producer_id AND c.event_id IS NOT DISTINCT FROM l.event_id;
