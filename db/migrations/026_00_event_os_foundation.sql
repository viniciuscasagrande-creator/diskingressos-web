-- Fase 26.0 — DiskIngressos Event OS / arquitetura mestre do PDT
-- Estruturas de observabilidade operacional. O evento permanece a unidade central e producer_id o limite de tenant.
CREATE TABLE IF NOT EXISTS event_operational_snapshots (
  id BIGSERIAL PRIMARY KEY,
  producer_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  health_score INTEGER NOT NULL DEFAULT 0,
  revenue_cents BIGINT NOT NULL DEFAULT 0,
  paid_orders INTEGER NOT NULL DEFAULT 0,
  tickets INTEGER NOT NULL DEFAULT 0,
  checkins INTEGER NOT NULL DEFAULT 0,
  inventory_capacity INTEGER NOT NULL DEFAULT 0,
  inventory_sold INTEGER NOT NULL DEFAULT 0,
  open_recoveries INTEGER NOT NULL DEFAULT 0,
  recoverable_cents BIGINT NOT NULL DEFAULT 0,
  payload_json TEXT,
  captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS event_operational_snapshots_scope_idx ON event_operational_snapshots(producer_id,event_id,captured_at);

CREATE TABLE IF NOT EXISTS event_incidents (
  id BIGSERIAL PRIMARY KEY,
  producer_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  code VARCHAR(80) NOT NULL,
  category VARCHAR(40) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'warning',
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  title VARCHAR(180) NOT NULL,
  description TEXT,
  source VARCHAR(60) NOT NULL DEFAULT 'system',
  opened_by VARCHAR(120),
  resolved_by VARCHAR(120),
  opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS event_incidents_scope_idx ON event_incidents(producer_id,event_id,status,severity);

CREATE TABLE IF NOT EXISTS event_readiness_checks (
  id BIGSERIAL PRIMARY KEY,
  producer_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  check_key VARCHAR(80) NOT NULL,
  label VARCHAR(180) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  detail TEXT,
  source VARCHAR(60) NOT NULL DEFAULT 'system',
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(producer_id,event_id,check_key)
);
