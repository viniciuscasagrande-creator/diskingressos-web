-- Fase 25.4 — Recebíveis, Liquidação e Agenda Financeira
-- 25.4-receivables-settlement-agenda-2026-09-02
CREATE TABLE IF NOT EXISTS receivable_schedule_entries (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT,
  producer_id BIGINT NOT NULL,
  event_id BIGINT,
  order_id BIGINT,
  transaction_id BIGINT,
  ledger_batch_id BIGINT,
  external_receivable_id TEXT,
  payment_rail TEXT NOT NULL,
  installment_no INTEGER NOT NULL DEFAULT 1,
  installment_count INTEGER NOT NULL DEFAULT 1,
  gross_cents BIGINT NOT NULL CHECK (gross_cents >= 0),
  fee_cents BIGINT NOT NULL DEFAULT 0 CHECK (fee_cents >= 0),
  net_cents BIGINT NOT NULL CHECK (net_cents >= 0),
  expected_at TIMESTAMPTZ NOT NULL,
  settled_at TIMESTAMPTZ,
  reconciled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled',
  gateway_name TEXT,
  acquirer_name TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT receivable_amount_equation CHECK (gross_cents - fee_cents = net_cents)
);
CREATE INDEX IF NOT EXISTS idx_receivable_schedule_producer_expected ON receivable_schedule_entries(producer_id, expected_at);
CREATE INDEX IF NOT EXISTS idx_receivable_schedule_event_expected ON receivable_schedule_entries(event_id, expected_at);
CREATE INDEX IF NOT EXISTS idx_receivable_schedule_status ON receivable_schedule_entries(status);

CREATE TABLE IF NOT EXISTS settlement_reconciliations (
  id BIGSERIAL PRIMARY KEY,
  receivable_id BIGINT NOT NULL REFERENCES receivable_schedule_entries(id),
  expected_cents BIGINT NOT NULL,
  received_cents BIGINT NOT NULL,
  difference_cents BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  source_reference TEXT,
  reconciled_by BIGINT,
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE VIEW receivable_agenda_summary AS
SELECT producer_id,event_id,
  CASE
    WHEN expected_at::date <= CURRENT_DATE THEN 'D+0'
    WHEN expected_at::date <= CURRENT_DATE + 7 THEN 'D+7'
    WHEN expected_at::date <= CURRENT_DATE + 15 THEN 'D+15'
    WHEN expected_at::date <= CURRENT_DATE + 30 THEN 'D+30'
    ELSE 'D+60'
  END AS bucket,
  COUNT(*) AS item_count,
  SUM(gross_cents) AS gross_cents,
  SUM(fee_cents) AS fee_cents,
  SUM(net_cents) AS net_cents
FROM receivable_schedule_entries
WHERE status IN ('captured','scheduled','pending_settlement')
GROUP BY producer_id,event_id,bucket;
