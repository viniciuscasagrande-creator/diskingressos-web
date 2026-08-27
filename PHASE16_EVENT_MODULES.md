# Fase 16 — Gestão Contextual Completa do Evento

Esta fase transforma a navegação contextual criada na Fase 15 em telas funcionais dentro do evento selecionado.

## Módulos implementados

- Consultar Ingresso: busca, tabela de participantes/pedidos, status de acesso e exportação demonstrativa.
- Cortesias: indicadores, emissão rápida e regras de controle.
- Relatórios: catálogo contextual de relatórios comerciais, financeiros, operacionais e de público.
- Detalhes: formulário completo do evento preservando `eventId` e `producerId`.
- Pixel & Analytics: herança Global → Produtora → Evento e estados herdado/próprio/desativado.
- Links, UTMs e QR Codes: gerador de URL rastreável e representação de QR Code.
- Analytics GA4: usuários, visualizações, engajamento, conversão, eventos e canais.
- Tráfego do Site: sessões, CTR, novos usuários, duração e origem.
- Campanhas Meta Ads: investimento, cliques, conversões, ROAS e lista de campanhas.
- Remarketing do Evento: carrinhos, pagamentos, públicos e receita recuperada.

## Regra de contexto

Toda tela é aberta a partir de `/eventos/:eventId/...` e reutiliza o evento já selecionado. O usuário não precisa escolher o evento novamente.

A autorização continua obedecendo:

`user -> producerId -> eventId -> permission -> module`

Um produtor não deve conseguir acessar dados de outro produtor apenas alterando o ID na URL. A validação definitiva deve ocorrer no backend.
