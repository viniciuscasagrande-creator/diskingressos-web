# Fase 15 — Navegação Contextual por Evento

A Fase 15 altera a navegação do painel para reproduzir o comportamento do sistema de referência: ao clicar em um evento, a sidebar geral é substituída por uma sidebar exclusiva do evento selecionado.

## Fluxo

1. O usuário entra em `Todos os Eventos`.
2. Ao clicar em qualquer card, o sistema define `selectedEvent`.
3. A URL muda para `/eventos/{codigo}/dashboard`.
4. A sidebar passa a exibir a capa/resumo do evento e menus contextuais.
5. Dashboard, ingressos, cortesias, relatórios, tracking, Meta Ads e remarketing preservam o mesmo evento.
6. O contexto só é encerrado quando o usuário clica em `Voltar`.

## Menu contextual

### Evento
- Dashboard
- Consultar Ingresso
- Cortesias
- Relatórios
- Detalhes

### Configurações
- Pixel GA
- Links UTM
- Analytics GA4
- Tráfego Site
- Campanhas Meta Ads
- Remarketing

### Administração
- Usuários
- Logs
- Permissões

Também permanecem atalhos para Lotes, Participantes e Núcleo Operacional.

## Segurança multi-produtor

O `eventId` nunca deve ser aceito como autorização por si só. O backend verifica se o evento pertence à `producerId` do usuário autenticado. Admins globais continuam podendo acessar eventos entre produtoras conforme as permissões existentes.

Foi adicionado `GET /api/events/:id` com validação de tenant para permitir a evolução futura para deep links reais e recarregamento de contexto pelo backend.

## URLs contextuais

- `/eventos/1760/dashboard`
- `/eventos/1760/tickets`
- `/eventos/1760/reports`
- `/eventos/1760/ga4`
- `/eventos/1760/meta-ads`
- `/eventos/1760/remarketing`

A navegação atualiza o History API para refletir o módulo ativo sem perder o contexto selecionado.
