# DiskIngressos — Fase 13

## Automações + WhatsApp + E-mail Marketing + Remarketing

A Fase 13 transforma os módulos de automação e recuperação em recursos persistentes no backend, mantendo o isolamento multi-produtor.

### Entidades adicionadas
- `AutomationFlow`: jornada, gatilho, canal, atraso, público, evento e métricas.
- `MessageTemplate`: templates de WhatsApp e e-mail por produtora/evento.
- `AutomationExecution`: histórico de execuções e testes de fluxo.
- `RecoveryOpportunity`: carrinho, pagamento pendente, cliente inativo e pós-evento.

### Gatilhos previstos
- Compra confirmada
- Carrinho abandonado
- Último lote
- Aniversário
- Pós-evento
- Pagamento pendente

### Endpoints
- `GET/POST /api/automation/flows`
- `PATCH /api/automation/flows/:id`
- `POST /api/automation/flows/:id/test`
- `GET/POST /api/automation/templates`
- `GET /api/automation/executions`
- `GET/POST /api/automation/recoveries`
- `PATCH /api/automation/recoveries/:id/recover`
- `GET /api/automation/summary`

### Segurança
O backend resolve `producerId` pela identidade autenticada. Produtores não podem consultar ou alterar automações, templates ou oportunidades de outra produtora. Admin Master/Admin podem operar no escopo global.

### Observação sobre integrações reais
Nesta fase, WhatsApp e e-mail são modelados como canais e filas internas. O envio externo real requer um provedor (ex.: WhatsApp Business Platform e serviço de e-mail transacional) e credenciais próprias. Não há credenciais embutidas no projeto.
