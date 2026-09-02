-- Fase 25.8 — Motor Enterprise de Estornos
CREATE TABLE IF NOT EXISTS refund_approval_steps (
  id BIGSERIAL PRIMARY KEY,
  refund_request_id BIGINT NOT NULL,
  approval_level INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  actor_id VARCHAR(120),
  actor_role VARCHAR(80),
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(refund_request_id, approval_level)
);
CREATE INDEX IF NOT EXISTS idx_refund_approval_steps_status ON refund_approval_steps(refund_request_id, status);

CREATE TABLE IF NOT EXISTS refund_eligibility_snapshots (
  id BIGSERIAL PRIMARY KEY,
  refund_request_id BIGINT NOT NULL,
  eligible BOOLEAN NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  required_approvals INTEGER NOT NULL DEFAULT 1,
  checks_json TEXT NOT NULL,
  blocking_reasons_json TEXT NOT NULL,
  evaluated_by VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refund_eligibility_request ON refund_eligibility_snapshots(refund_request_id, created_at DESC);

CREATE TABLE IF NOT EXISTS refund_reversal_plans (
  id BIGSERIAL PRIMARY KEY,
  refund_request_id BIGINT NOT NULL,
  strategy VARCHAR(50) NOT NULL DEFAULT 'compensating_entries',
  amount_cents INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'planned',
  plan_json TEXT NOT NULL,
  created_by VARCHAR(120),
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refund_reversal_plan ON refund_reversal_plans(refund_request_id, status);
