# Fase 14 — SAC, SLA, ITIL e Integrações

## Objetivo
Adicionar ao template global do DiskIngressos um Service Desk multi-produtor com abertura e acompanhamento de chamados, prioridades, SLA, práticas ITIL e integrações com os demais módulos.

## Menu SAC
- Hub de Atendimento
- Dashboard SAC
- Chamados
- Abrir Chamado
- SLA & ITIL
- Integrações
- Base de Conhecimento
- Relatórios

## Fluxo do chamado
Novo → Aberto → Em atendimento → Pendente → Resolvido → Fechado. Chamados podem ser reabertos em evolução futura.

## Matriz ITIL
A prioridade é calculada no backend pela combinação de impacto e urgência. P1 possui maior criticidade. O backend grava os deadlines de primeira resposta e resolução no momento da abertura.

Metas seed:
- P1: resposta 15 min / resolução 4 h / 24x7
- P2: resposta 30 min / resolução 8 h / 24x7
- P3: resposta 2 h / resolução 24 h / horário comercial
- P4: resposta 4 h / resolução 48 h / horário comercial

## Integração
O módulo está preparado para correlacionar chamados com produtor e evento e apresentar conexões com Eventos, Pedidos, Ingressos, Participantes, Check-in, Financeiro, Marketing, Remarketing, WhatsApp e E-mail.

## API
- GET /api/support/summary
- GET /api/support/tickets
- POST /api/support/tickets
- PATCH /api/support/tickets/:id
- POST /api/support/tickets/:id/messages
- GET /api/support/sla-policies
- GET /api/support/integrations

## Segurança
Todas as rotas usam autenticação e filtro de tenant. Produtores não podem consultar chamados de outra produtora; Admin Master/Admin podem usar visão global.

## Produção
Os conectores WhatsApp/e-mail nesta fase representam configuração e arquitetura. Credenciais reais, webhooks, filas, retries, consentimento LGPD, anexos e entrega omnichannel devem ser implementados com provedores autorizados antes da produção.

## Integrações de Comunicação
A Fase 14 também inclui uma central em Marketing > Integrações de Comunicação, preparada para WhatsApp Business, e-mail transacional, fila de mensagens, webhooks, retries e consentimentos LGPD.

APIs adicionais:
- GET /api/communication/summary
- GET /api/communication/channels
- PATCH /api/communication/channels/:id
- GET /api/communication/queue
- GET /api/communication/consents
- POST /api/communication/consents
