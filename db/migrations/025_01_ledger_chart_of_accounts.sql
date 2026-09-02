-- FASE 25.1 — Ledger Contábil e Plano de Contas
-- PostgreSQL. Extensão da fundação 25.0.

ALTER TABLE ledger_accounts ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES ledger_accounts(id);
ALTER TABLE ledger_accounts ADD COLUMN IF NOT EXISTS allows_posting boolean NOT NULL DEFAULT true;
ALTER TABLE ledger_accounts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE ledger_accounts ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE ledger_batches ADD COLUMN IF NOT EXISTS idempotency_key varchar(160);
ALTER TABLE ledger_batches ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'posted';
ALTER TABLE ledger_batches ADD COLUMN IF NOT EXISTS posted_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE ledger_batches ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS producer_ref varchar(80);
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS event_ref varchar(80);
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS order_ref varchar(120);
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS transaction_ref varchar(120);
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS memo text;

CREATE UNIQUE INDEX IF NOT EXISTS ux_ledger_batches_tenant_idempotency
  ON ledger_batches(tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_ledger_batches_source ON ledger_batches(tenant_id, source_type, source_id);
CREATE INDEX IF NOT EXISTS ix_ledger_batches_order ON ledger_batches(tenant_id, order_id);
CREATE INDEX IF NOT EXISTS ix_ledger_entries_account_date ON ledger_entries(account_id, occurred_at);
CREATE INDEX IF NOT EXISTS ix_ledger_entries_producer_ref ON ledger_entries(producer_ref, occurred_at);
CREATE INDEX IF NOT EXISTS ix_ledger_entries_event_ref ON ledger_entries(event_ref, occurred_at);
CREATE INDEX IF NOT EXISTS ix_ledger_entries_order_ref ON ledger_entries(order_ref, occurred_at);

-- O lote somente pode ser considerado postado quando a soma de débitos = créditos.
CREATE OR REPLACE FUNCTION assert_ledger_batch_balanced(p_batch_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_debit bigint;
  v_credit bigint;
BEGIN
  SELECT COALESCE(SUM(CASE WHEN side='debit' THEN amount_cents ELSE 0 END),0),
         COALESCE(SUM(CASE WHEN side='credit' THEN amount_cents ELSE 0 END),0)
    INTO v_debit, v_credit
    FROM ledger_entries WHERE batch_id=p_batch_id;
  IF v_debit <> v_credit OR v_debit = 0 THEN
    RAISE EXCEPTION 'Ledger batch % não balanceado: debit=%, credit=%', p_batch_id, v_debit, v_credit;
  END IF;
END $$;

-- Impede UPDATE/DELETE de lançamentos contabilizados. Correção = reversão/novo lote.
CREATE OR REPLACE FUNCTION prevent_ledger_entry_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'ledger_entries é append-only. Use lote de reversão/ajuste.';
END $$;
DROP TRIGGER IF EXISTS trg_ledger_entries_no_update ON ledger_entries;
CREATE TRIGGER trg_ledger_entries_no_update BEFORE UPDATE OR DELETE ON ledger_entries
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_entry_mutation();

-- View de saldo derivado. Ativo/despesa: débito positivo. Passivo/receita/patrimônio: crédito positivo.
CREATE OR REPLACE VIEW ledger_account_balances AS
SELECT a.tenant_id, a.id AS account_id, a.code, a.name, a.nature, a.owner_scope,
       COALESCE(SUM(CASE
         WHEN a.nature IN ('asset','expense') AND e.side='debit' THEN e.amount_cents
         WHEN a.nature IN ('asset','expense') AND e.side='credit' THEN -e.amount_cents
         WHEN a.nature IN ('liability','revenue','equity') AND e.side='credit' THEN e.amount_cents
         ELSE -e.amount_cents END),0)::bigint AS balance_cents
FROM ledger_accounts a
LEFT JOIN ledger_entries e ON e.account_id=a.id
GROUP BY a.tenant_id,a.id,a.code,a.name,a.nature,a.owner_scope;

CREATE OR REPLACE VIEW ledger_producer_balances AS
SELECT b.tenant_id, e.producer_ref,
       COALESCE(SUM(CASE WHEN a.nature='liability' AND e.side='credit' THEN e.amount_cents
                         WHEN a.nature='liability' AND e.side='debit' THEN -e.amount_cents ELSE 0 END),0)::bigint AS custody_balance_cents
FROM ledger_entries e
JOIN ledger_batches b ON b.id=e.batch_id
JOIN ledger_accounts a ON a.id=e.account_id
WHERE a.owner_scope='producer'
GROUP BY b.tenant_id,e.producer_ref;

-- Regra operacional: NUNCA UPDATE/DELETE em ledger_entries.
-- Uma venda, estorno, repasse, ajuste ou chargeback deve possuir source_type/source_id e idempotency_key.
