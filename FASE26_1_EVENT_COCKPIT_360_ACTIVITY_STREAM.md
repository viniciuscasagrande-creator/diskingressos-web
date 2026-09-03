# Fase 26.1 — Event Cockpit 360 + Activity Stream

Release: `26.1-event-cockpit-activity-stream-2026-09-03`

## Objetivo
Transformar o Centro de Comando criado na Fase 26.0 em uma visão operacional viva do evento, sem duplicar a fonte de verdade dos módulos existentes.

## Regra de segurança
O endpoint valida `eventId` no backend e compara o `producerId` do evento com o tenant autenticado. Produtores não podem consultar o Activity Stream de eventos de outras produtoras. Administradores globais mantêm o comportamento previsto na arquitetura do PDT.

## Implementado
- Event Cockpit 360 como tela principal do contexto do evento.
- Activity Stream unificado com vendas/pedidos, check-ins, recuperação, estornos/reembolsos, movimentações financeiras, marketing e incidentes.
- Endpoint `GET /api/events/:id/activity-stream`.
- Atualização automática operacional a cada 15 segundos, com opção de pausa e atualização manual.
- Pulso operacional: vendas e receita em 15 minutos/1 hora, check-ins, vendas recuperadas, estornos e incidentes abertos.
- Tendência das últimas 12 horas para vendas e check-ins.
- Filtros rápidos do Activity Stream por domínio.
- Mantidos score de saúde, readiness, alertas e atalhos dos módulos da Fase 26.0.
- Layout responsivo integrado ao padrão Enterprise/Limitless já aplicado.

## Estratégia de eficiência
O Activity Stream não cria uma cópia paralela de vendas, check-ins ou financeiro. Ele consolida as tabelas transacionais já existentes em leitura. Isso reduz inconsistência, evita sincronizações desnecessárias e mantém cada módulo como fonte oficial dos seus dados.

Nesta etapa foi adotado polling de 15 segundos por ser simples, resiliente e compatível com a infraestrutura atual. A arquitetura permite migrar posteriormente o mesmo contrato para SSE/WebSocket sem alterar o conceito da tela.

## Fontes operacionais consolidadas
- `Order`
- `CheckIn`
- `RecoveryOpportunity`
- `RefundRequest`
- `FinancialTransaction`
- `MarketingCampaign`
- `EventIncident`

## Próxima etapa recomendada
**Fase 26.2 — Inventory Engine**: lotes, setores, holds, capacidade, disponibilidade, velocidade de venda e previsão de esgotamento.
