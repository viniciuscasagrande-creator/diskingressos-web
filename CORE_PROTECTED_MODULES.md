# CORE_PROTECTED_MODULES — SafeSaff / PDT

Release: `26.x.1.1-estornos-protected-2026-09-03`

## Regra permanente

O módulo **Estornos** é independente e protegido. Nenhuma fase, refatoração, agente de IA ou reorganização de menu pode removê-lo, ocultá-lo dentro do Financeiro, trocar sua rota principal ou substituir sua tela sem autorização explícita do responsável pelo produto.

Contrato mínimo obrigatório:
- menu principal independente: `Estornos`;
- rota canônica: `/app/finance-refunds`;
- PageKey: `finance-refunds`;
- tela: `FinanceDisputesHubPage`;
- fluxos: Estornos & Devoluções, Chargebacks, Impacto Financeiro, Motor Enterprise e Webhooks;
- badge ERP preservado;
- backend e auditoria existentes preservados.

## Gate de build

`npm run verify:protected-modules` deve passar antes do build Vercel. O script falha propositalmente se as assinaturas estruturais do módulo forem removidas.

## Gate E2E

`npm run test:e2e:protected` valida menu, rota e carregamento da Central de Estornos.
