-- Fase 25.7.1 — Motor Universal de Conversões
-- Evento canônico -> fan-out idempotente para integrações de marketing ativas.

CREATE TABLE IF NOT EXISTS marketing_conversion_events (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  producer_id BIGINT NOT NULL,
  event_entity_id BIGINT NULL,
  order_id BIGINT NULL,
  value_cents BIGINT NOT NULL DEFAULT 0 CHECK (value_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'BRL',
  email_hash TEXT NULL,
  phone_hash TEXT NULL,
  external_id_hash TEXT NULL,
  attribution_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mce_producer_event ON marketing_conversion_events(producer_id,event_name);
CREATE INDEX IF NOT EXISTS idx_mce_event_entity ON marketing_conversion_events(event_entity_id);
CREATE INDEX IF NOT EXISTS idx_mce_order ON marketing_conversion_events(order_id);
CREATE INDEX IF NOT EXISTS idx_mce_occurred ON marketing_conversion_events(occurred_at);

CREATE TABLE IF NOT EXISTS marketing_conversion_dispatches (
  id BIGSERIAL PRIMARY KEY,
  conversion_event_id BIGINT NOT NULL REFERENCES marketing_conversion_events(id) ON DELETE CASCADE,
  integration_id BIGINT NOT NULL,
  provider TEXT NOT NULL,
  provider_event_name TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_code INTEGER NULL,
  response_message TEXT NULL,
  last_attempt_at TIMESTAMPTZ NULL,
  next_attempt_at TIMESTAMPTZ NULL,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcd_integration_status ON marketing_conversion_dispatches(integration_id,status);
CREATE INDEX IF NOT EXISTS idx_mcd_provider_status ON marketing_conversion_dispatches(provider,status);
CREATE INDEX IF NOT EXISTS idx_mcd_retry ON marketing_conversion_dispatches(next_attempt_at);

-- Regra-chave:
-- event_id e idempotency_key impedem dupla contabilização mesmo com reprocessamento/webhook repetido.
