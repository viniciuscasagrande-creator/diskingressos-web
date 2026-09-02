-- FASE 25.2 — Motor de Split e Contratos Financeiros
-- Contrato versionado por evento + regras por meio de pagamento + execução imutável de split.

ALTER TABLE financial_agreement_versions ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE financial_agreement_versions ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE financial_agreement_versions ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE financial_agreement_versions ADD COLUMN IF NOT EXISTS checksum varchar(64);

CREATE TABLE IF NOT EXISTS financial_agreement_rules (
  id uuid PRIMARY KEY,
  agreement_version_id uuid NOT NULL REFERENCES financial_agreement_versions(id),
  payment_method varchar(24) NOT NULL,
  payment_fee_bps integer NOT NULL DEFAULT 0 CHECK(payment_fee_bps BETWEEN 0 AND 10000),
  installment_fee_bps integer NOT NULL DEFAULT 0 CHECK(installment_fee_bps BETWEEN 0 AND 10000),
  anticipation_fee_bps integer NOT NULL DEFAULT 0 CHECK(anticipation_fee_bps BETWEEN 0 AND 10000),
  service_fee_bps integer NOT NULL DEFAULT 0 CHECK(service_fee_bps BETWEEN 0 AND 10000),
  service_fee_bearer varchar(16) NOT NULL DEFAULT 'customer' CHECK(service_fee_bearer IN ('customer','producer','platform')),
  anticipation_fee_bearer varchar(16) NOT NULL DEFAULT 'producer' CHECK(anticipation_fee_bearer IN ('customer','producer','platform')),
  platform_share_bps integer NOT NULL DEFAULT 0 CHECK(platform_share_bps BETWEEN 0 AND 10000),
  reserve_bps integer NOT NULL DEFAULT 0 CHECK(reserve_bps BETWEEN 0 AND 10000),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agreement_version_id, payment_method)
);

CREATE TABLE IF NOT EXISTS financial_agreement_participants (
  id uuid PRIMARY KEY,
  agreement_version_id uuid NOT NULL REFERENCES financial_agreement_versions(id),
  participant_kind varchar(24) NOT NULL CHECK(participant_kind IN ('producer','platform','coproducer','affiliate','reserve','third_party')),
  participant_ref varchar(120) NOT NULL,
  destination_ref varchar(160),
  share_bps integer NOT NULL DEFAULT 0 CHECK(share_bps BETWEEN 0 AND 10000),
  fixed_cents bigint CHECK(fixed_cents IS NULL OR fixed_cents >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS split_executions (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  producer_id uuid NOT NULL,
  event_id uuid NOT NULL,
  order_id uuid,
  transaction_id uuid,
  agreement_version_id uuid NOT NULL REFERENCES financial_agreement_versions(id),
  payment_method varchar(24) NOT NULL,
  gross_ticket_cents bigint NOT NULL CHECK(gross_ticket_cents >= 0),
  customer_total_cents bigint NOT NULL CHECK(customer_total_cents >= 0),
  service_fee_cents bigint NOT NULL DEFAULT 0,
  payment_cost_cents bigint NOT NULL DEFAULT 0,
  installment_cost_cents bigint NOT NULL DEFAULT 0,
  anticipation_cost_cents bigint NOT NULL DEFAULT 0,
  producer_net_cents bigint NOT NULL DEFAULT 0,
  platform_revenue_cents bigint NOT NULL DEFAULT 0,
  reserve_cents bigint NOT NULL DEFAULT 0,
  ledger_batch_id uuid REFERENCES ledger_batches(id),
  idempotency_key varchar(160) NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS split_allocations (
  id uuid PRIMARY KEY,
  split_execution_id uuid NOT NULL REFERENCES split_executions(id),
  participant_kind varchar(24) NOT NULL,
  participant_ref varchar(120) NOT NULL,
  destination_ref varchar(160),
  amount_cents bigint NOT NULL CHECK(amount_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_financial_agreements_event_status ON financial_agreement_versions(tenant_id,event_id,status,valid_from DESC);
CREATE INDEX IF NOT EXISTS ix_split_executions_event_date ON split_executions(tenant_id,event_id,executed_at DESC);
CREATE INDEX IF NOT EXISTS ix_split_executions_transaction ON split_executions(tenant_id,transaction_id);
CREATE INDEX IF NOT EXISTS ix_split_allocations_execution ON split_allocations(split_execution_id);

-- Uma versão ativa não deve ser editada para alterar vendas antigas.
-- Alterações comerciais criam nova versão com nova vigência.
CREATE OR REPLACE FUNCTION prevent_active_financial_agreement_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status='active' AND (NEW.rules IS DISTINCT FROM OLD.rules OR NEW.valid_from IS DISTINCT FROM OLD.valid_from OR NEW.event_id IS DISTINCT FROM OLD.event_id) THEN
    RAISE EXCEPTION 'Contrato financeiro ativo é versionado. Crie nova versão em vez de alterar a vigente.';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_financial_agreement_version_guard ON financial_agreement_versions;
CREATE TRIGGER trg_financial_agreement_version_guard BEFORE UPDATE ON financial_agreement_versions
FOR EACH ROW EXECUTE FUNCTION prevent_active_financial_agreement_mutation();

CREATE OR REPLACE VIEW active_financial_agreements AS
SELECT DISTINCT ON (tenant_id,event_id)
  id,tenant_id,producer_id,event_id,version,valid_from,valid_until,status,rules,approved_by,approved_at,checksum
FROM financial_agreement_versions
WHERE status='active' AND valid_from <= now() AND (valid_until IS NULL OR valid_until >= now())
ORDER BY tenant_id,event_id,valid_from DESC,version DESC;

-- Regra: a venda guarda agreement_version_id. Uma alteração futura jamais recalcula venda histórica automaticamente.
