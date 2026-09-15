# Fase 25.8 — Motor Enterprise de Estornos

Release: `25.8-enterprise-refund-engine-2026-09-02`

## Objetivo
Transformar o módulo independente de Estornos em um workflow financeiro corporativo, auditável e integrado ao SAC, pagamentos, split, reservas, conta gráfica, ledger e conciliação.

## Implementado
- Motor de elegibilidade antes da aprovação.
- Classificação de risco por valor/modalidade.
- Aprovação multinível: 1 nível até R$ 999,99; 2 níveis a partir de R$ 1.000; 3 níveis a partir de R$ 5.000.
- Segregação de função para impedir autoaprovação em alçadas elevadas.
- Estorno total e parcial.
- Plano de reversão financeira em sete etapas.
- Reversão de split e consumo de reserva previstos no plano operacional.
- Ledger imutável: correções são lançamentos compensatórios, nunca edição de saldo.
- Idempotência prevista no envio ao gateway/adquirente.
- SLA, auditoria e integração com SAC preservados.
- Novos snapshots de elegibilidade, passos de aprovação e planos de reversão persistidos.

## Endpoints
- `GET /api/finance/disputes/enterprise/overview`
- `POST /api/finance/disputes/refunds/:id/eligibility`
- `POST /api/finance/disputes/refunds/:id/enterprise-approve`
- `POST /api/finance/disputes/refunds/:id/reversal-plan`

## Regra financeira
Nenhum usuário altera saldo diretamente. O estorno gera uma cadeia controlada: bloqueio de exposição → reversão proporcional do split → reserva → gateway → lançamento compensatório no ledger → conciliação → auditoria.
