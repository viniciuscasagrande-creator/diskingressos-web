# Fase 25.0 — Arquitetura Mestre ERP + CRM + Financeiro + Produtor

**Release:** `25.0-master-erp-crm-finance-producer-2026-09-02`

## Objetivo
Estabelecer a fundação única do SafeSaff para integrar ERP corporativo, operação marketplace de ingressos, CRM/SAC e Portal do Produtor, preservando as telas financeiras homologadas das Fases 24.x.

## Princípios obrigatórios
1. **Segregação econômica:** valores atribuíveis ao produtor não são confundidos com receita própria da plataforma.
2. **Ledger append-only:** lançamento contabilizado não é editado/apagado; correção ocorre por reversão ou lançamento compensatório auditável.
3. **Dupla entrada:** todo batch do ledger deve fechar débito = crédito.
4. **Contrato financeiro versionado:** cada venda referencia a versão de regra vigente; mudança futura não recalcula venda histórica automaticamente.
5. **Administração central:** DiskIngressos/SafeSaff possui governança global; produtor opera somente seu escopo e somente ações liberadas.
6. **SAC sem edição de saldo:** SAC consulta a verdade financeira e abre workflows (ex.: solicitação de estorno), sem manipular ledger.
7. **Saldo derivado:** snapshots/cache podem existir, mas devem ser reconciliáveis com o ledger.
8. **Auditoria:** ações críticas registram ator, papel, motivo, antes/depois e entidade afetada.

## Autoridade
- **Super Admin:** configuração global e governança; ajustes financeiros somente por operações auditáveis.
- **Financeiro:** acordos, reservas, repasses, estornos, conciliação e ajustes autorizados.
- **Contabilidade:** ledger, fechamento, fiscal e relatórios corporativos.
- **SAC:** Cliente 360º, pedidos e solicitação de workflows financeiros.
- **Produtor Owner:** visão integral do próprio tenant/eventos, solicitação de repasse e de alteração comercial.
- **Equipe do produtor:** permissões delegadas e restritas ao próprio escopo.

## Fluxo mestre
`Pedido → Transação → Contrato Financeiro Vigente → Split → Ledger → Recebíveis → Liquidação → Conta Gráfica → Saldo Disponível → Repasse → Conciliação`

Estornos/chargebacks produzem reversões e novos eventos financeiros, preservando o histórico original.

## Integração com Fases 24
- 24.5 Saldo/Extrato: leitura do ledger e projeções.
- 24.6 Recebíveis: receivables + settlements.
- 24.7 Repasses: conta financeira + reservas + payouts.
- 24.8 Negociação: financial_agreement_versions.
- 24.9 Estornos: refunds/chargebacks/disputes + reversões do ledger.

## Fundação adicionada ao projeto
- `src/domain/erp/masterArchitecture.ts`: contratos, RBAC inicial e validação de batch balanceado.
- `db/migrations/025_00_master_erp_architecture.sql`: acordo versionado, contas/batches/entries do ledger, conta do produtor, reservas e auditoria.

## Regra de UI
O Dashboard Financeiro homologado não é redesenhado nesta fase. A Fase 25.0 cria a fundação que gradualmente substituirá mocks/fontes isoladas por serviços financeiros consistentes.

## Próxima fase
**25.1 — Ledger Contábil e Plano de Contas:** implementar plano de contas, serviço transacional de lançamentos, reversões, idempotência, saldos derivados e consultas por produtor/evento/pedido.

> Observação: classificação contábil, fiscal e regulatória final deve ser parametrizável e homologada pelos responsáveis contábil/jurídico da operação; não deve ficar hard-coded na aplicação.
