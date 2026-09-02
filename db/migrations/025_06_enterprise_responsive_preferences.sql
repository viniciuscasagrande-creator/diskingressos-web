-- Fase 25.6 — Responsividade Enterprise 360°
-- 25.6-enterprise-responsiveness-360-2026-09-02

CREATE TABLE IF NOT EXISTS user_ui_responsive_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  tenant_id BIGINT,
  producer_id BIGINT,
  viewport_breakpoint TEXT NOT NULL DEFAULT 'auto' CHECK (viewport_breakpoint IN ('auto', 'desktop', 'notebook', 'tablet', 'mobile')),
  table_density TEXT NOT NULL DEFAULT 'comfortable' CHECK (table_density IN ('compact', 'comfortable', 'spacious')),
  view_mode TEXT NOT NULL DEFAULT 'auto' CHECK (view_mode IN ('auto', 'table', 'cards', 'kanban')),
  navigation_collapsed BOOLEAN NOT NULL DEFAULT false,
  charts_simplified BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_ui_preferences_user ON user_ui_responsive_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ui_preferences_producer ON user_ui_responsive_preferences(producer_id);
