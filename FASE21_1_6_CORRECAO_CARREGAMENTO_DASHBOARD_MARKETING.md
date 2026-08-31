# Fase 21.1.6 — Correção definitiva de carregamento do Dashboard Marketing

## Diagnóstico
As telas operacionais de Marketing conseguiam carregar campanhas por evento, mas o Dashboard dependia exclusivamente de `/api/marketing/os/summary`. Quando esse endpoint consolidado não estava publicado, incompatível com o banco ou indisponível, o Dashboard ficava zerado apesar de existirem dados nas APIs operacionais.

## Correção
`MarketingHubOSPage.tsx` agora:
1. tenta a fonte consolidada `/marketing/os/summary`;
2. se ela falhar, consulta em paralelo as APIs operacionais já existentes de Campanhas, Campanhas Prontas, Tracking, Automação e Comunicação;
3. mantém campanhas e KPIs reais mesmo se fontes complementares falharem;
4. mostra aviso específico sem transformar falha de uma fonte em KPIs zero de todo o Hub;
5. preserva `producerId`, `eventId` e `period` do contexto atual.

## Validação esperada
- Se Campanhas funciona para um evento, o Dashboard deve exibir os mesmos dados-base daquele evento.
- Trocar o evento deve disparar nova consulta.
- A ausência do endpoint consolidado não pode mais zerar o Dashboard.

## Ambiente local
Confirme `VITE_API_URL=http://localhost:3333/api`, API em execução e PostgreSQL local ativo. Depois execute `npm run db:local:setup` quando precisar recriar/preencher a base local.
