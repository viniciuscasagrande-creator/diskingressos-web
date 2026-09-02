-- FASE 25.0 — fundação de segregação, versionamento, ledger e auditoria.
-- PostgreSQL. Validar plano de contas/regras fiscais com a contabilidade responsável antes de produção.
CREATE TABLE IF NOT EXISTS financial_agreement_versions (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL, producer_id uuid NOT NULL, event_id uuid NOT NULL,
  version integer NOT NULL, valid_from timestamptz NOT NULL, valid_until timestamptz,
  status varchar(24) NOT NULL, rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by uuid, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, version)
);
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL, code varchar(40) NOT NULL, name varchar(160) NOT NULL,
  nature varchar(16) NOT NULL CHECK (nature IN ('asset','liability','revenue','expense','equity')),
  owner_scope varchar(16) NOT NULL CHECK (owner_scope IN ('platform','producer','event','order')),
  active boolean NOT NULL DEFAULT true, UNIQUE(tenant_id, code)
);
CREATE TABLE IF NOT EXISTS ledger_batches (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL, producer_id uuid, event_id uuid, order_id uuid, transaction_id uuid,
  description text NOT NULL, source_type varchar(60) NOT NULL, source_id varchar(120) NOT NULL,
  reversal_of_batch_id uuid REFERENCES ledger_batches(id), created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY, batch_id uuid NOT NULL REFERENCES ledger_batches(id), account_id uuid NOT NULL REFERENCES ledger_accounts(id),
  side varchar(6) NOT NULL CHECK (side IN ('debit','credit')), amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency char(3) NOT NULL DEFAULT 'BRL', reversal_of_entry_id uuid REFERENCES ledger_entries(id), occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS producer_financial_accounts (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL, producer_id uuid NOT NULL, currency char(3) NOT NULL DEFAULT 'BRL',
  status varchar(20) NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(tenant_id, producer_id, currency)
);
CREATE TABLE IF NOT EXISTS financial_reserves (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL, producer_id uuid NOT NULL, event_id uuid, amount_cents bigint NOT NULL CHECK(amount_cents >= 0),
  reason varchar(80) NOT NULL, status varchar(20) NOT NULL, released_at timestamptz, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS financial_audit_logs (
  id uuid PRIMARY KEY, tenant_id uuid NOT NULL, actor_id uuid NOT NULL, actor_role varchar(40) NOT NULL,
  action varchar(100) NOT NULL, entity_type varchar(80) NOT NULL, entity_id varchar(120) NOT NULL,
  reason text, before_data jsonb, after_data jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
-- Regra operacional: ledger_entries são append-only. Correções devem gerar batch de reversão/ajuste, nunca UPDATE/DELETE.
