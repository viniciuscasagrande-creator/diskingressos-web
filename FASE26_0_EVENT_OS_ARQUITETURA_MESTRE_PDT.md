# Fase 26.0 — DiskIngressos Event OS / Arquitetura Mestre do PDT

Release: `26.0-event-os-master-foundation-2026-09-03`

## Objetivo
Transformar o PDT no sistema operacional de eventos da DiskIngressos sem substituir os módulos já construídos. `diskingressos.com.br` permanece o frontend comercial/checkout; o PDT concentra operação, governança, dados e inteligência.

## Regra estrutural
`producerId` define o tenant e é derivado da autenticação para perfis não globais. `eventId` é o contexto operacional central. Todo endpoint contextual deve validar a associação evento → produtora no backend.

## Núcleos do Event OS
1. Event Command Center
2. Vendas & Pedidos
3. Inventory Engine
4. Customer 360 / CRM
5. Finance Event Ledger
6. Growth, Marketing e Atribuição
7. Recovery Engine
8. Live Event Operations / Check-in
9. SAC & Incident Center
10. Risk & Fraud
11. Analytics & Intelligence
12. Governança, RBAC e Auditoria

## Implementado nesta fase
- Novo `event-command-center` no contexto do evento e abertura padrão do card de evento para o Centro de Comando.
- Endpoint seguro `GET /api/events/:id/command-center` com isolamento de tenant.
- KPIs reais consolidados de pedidos pagos, receita, ingressos, participantes, check-ins, inventário, recuperação e campanhas.
- Score de saúde operacional, checklist de prontidão e alertas derivados.
- Atalhos contextuais para Financeiro, Marketing, Remarketing, Analytics e Governança.
- `src/domain/eventOS.ts` com registry oficial dos módulos e princípios de arquitetura.
- Banco preparado para snapshots operacionais, incidentes e readiness checks.
- Nenhuma mudança estrutural no Dashboard Financeiro aprovado, Ledger, Split, Conta Gráfica, Estornos, Marketing 360 ou Remarketing 25.8.x.

## Sequência recomendada
- 26.1 — Event Cockpit 360 e Activity Stream em tempo real
- 26.2 — Inventory Engine (lotes, setores, holds, capacidade e previsão de esgotamento)
- 26.3 — Customer 360 / CRM de participantes
- 26.4 — Live Event Operations / Check-in & Gate Control
- 26.5 — Incident Center + observabilidade/SLA
- 26.6 — Disk Intelligence / forecast e recomendações
- 26.7 — Global Search + Command Palette
- 26.8 — RBAC enterprise e matriz granular de permissões

## Critério de eficiência
A partir desta fase, novas funções devem reutilizar a mesma identidade de evento, tenant, ledger, tracking, automação e auditoria. Evitar páginas isoladas, duplicação de dados e regras somente no frontend.
