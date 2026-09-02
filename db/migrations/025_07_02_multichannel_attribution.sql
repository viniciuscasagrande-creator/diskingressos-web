-- SafeSaff Fase 25.7.2 — Central de Atribuição Multicanal
-- Consolida click ids, UTMs, sessões, pedidos e custos para análise first/last/linear/position/data-driven.
CREATE TABLE IF NOT EXISTS marketing_attribution_touchpoints (
  id BIGSERIAL PRIMARY KEY,
  producer_id BIGINT NOT NULL,
  event_id BIGINT,
  session_key VARCHAR(180) NOT NULL,
  visitor_key VARCHAR(180),
  source VARCHAR(120), medium VARCHAR(120), campaign VARCHAR(180), content VARCHAR(180), term VARCHAR(180),
  fbclid TEXT, ttclid TEXT, gclid TEXT, msclkid TEXT,
  referrer TEXT, landing_url TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attr_touchpoint_scope ON marketing_attribution_touchpoints(producer_id,event_id,occurred_at);
CREATE INDEX IF NOT EXISTS idx_attr_touchpoint_session ON marketing_attribution_touchpoints(session_key,occurred_at);

CREATE TABLE IF NOT EXISTS marketing_channel_costs (
  id BIGSERIAL PRIMARY KEY,
  producer_id BIGINT NOT NULL,
  event_id BIGINT,
  provider VARCHAR(80) NOT NULL,
  campaign_external_id VARCHAR(180),
  campaign_name VARCHAR(240),
  reference_date DATE NOT NULL,
  spend_cents BIGINT NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(producer_id,event_id,provider,campaign_external_id,reference_date)
);
CREATE INDEX IF NOT EXISTS idx_channel_cost_scope ON marketing_channel_costs(producer_id,event_id,reference_date);
