# Fase 16.8.1 — Correção da implementação UTM do Gemini

## Objetivo

Eliminar a duplicidade entre a tela UTM mockada criada no frontend e a Central UTM real já suportada pela API.

## Problema encontrado

O projeto possuía duas implementações concorrentes:

1. `src/pages/marketing/EventUtmCentralPage.tsx` — aproximadamente 2.000 linhas, com campanhas, pedidos, métricas, gráficos e receitas fixos no frontend.
2. `src/components/UtmConversionsCenter.tsx` — implementação conectada ao backend real (`/marketing/links`, `/marketing/utm/dashboard` e `/marketing/utm/abandon-sweep`).

O fluxo ativo do contexto do evento já apontava para `UtmConversionsCenter`, enquanto telas antigas ainda podiam abrir a versão mockada. Isso criava divergência visual e funcional.

## Correção aplicada

- `EventUtmCentralPage.tsx` agora é apenas um adaptador para `UtmConversionsCenter`.
- Removida a fonte paralela de dados mockados do arquivo de página.
- `UtmLinksPage.tsx` passa a usar o mesmo componente oficial.
- O menu global **Marketing > Links, UTMs e QR Codes** agora exige selecionar um evento e abre a mesma Central UTM oficial.
- Sem evento selecionado, a tela apresenta estado vazio explicativo.
- Sem URL selecionada, KPIs, funil, gráficos e pedidos permanecem vazios.
- Ao selecionar uma URL, `linkId` + `eventId` alimentam toda a página via API.
- Criação de UTM permanece no drawer da própria Central e a nova URL é selecionada automaticamente.

## Fonte única de verdade

```text
Evento
  ↓
GET /api/marketing/links?eventId=...
  ↓
Selecionar linkId
  ↓
GET /api/marketing/utm/dashboard?eventId=...&linkId=...
  ↓
KPIs + Funil + Gráficos + Pedidos + Atribuições
  ↓
POST /api/marketing/utm/abandon-sweep
  ↓
Remarketing
```

## Regra de UX preservada

A tela começa vazia. Nenhum gráfico deve mostrar números sem que uma URL rastreável tenha sido selecionada.

## Arquivos principais

- `src/components/UtmConversionsCenter.tsx`
- `src/pages/MarketingPage.tsx`
- `src/pages/marketing/EventUtmCentralPage.tsx`
- `src/pages/marketing/UtmLinksPage.tsx`
- `src/services/api.ts`
- `server/src/routes/marketing.ts`

## Segurança

O backend continua validando evento, link e produtora autenticada antes de retornar os dados da Central UTM.
