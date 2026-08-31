# Fase 21.1 — Marketing OS / Hub Marketing V2

Implementação visual e operacional do Hub Marketing aprovado.

## Arquivos alterados
- `src/pages/marketing/MarketingHubOSPage.tsx` — novo Hub compacto.
- `src/pages/MarketingPage.tsx` — rota `mode="hub"` passa a usar o novo Hub.
- `src/styles.css` — estilos responsivos da Fase 21.1.

## Dados
O Hub não usa KPIs de demonstração em produção. Ele lê APIs já existentes:
- campanhas de marketing;
- ativações de campanhas prontas;
- tracking resolvido;
- resumo de automações;
- resumo de comunicação.

ROAS, CPA e conversão são calculados a partir dos dados retornados.

## Regras para Gemini / VS Code
1. Aplicar somente os arquivos desta fase.
2. NÃO reescrever `App.tsx`.
3. NÃO remover rotas existentes.
4. NÃO alterar Financeiro ou Contabilidade.
5. NÃO fundir Marketing e Remarketing.
6. NÃO substituir APIs reais por mocks ou números fixos.
7. Preservar tenant `producerId` e filtro por evento.
8. Preservar responsividade desktop/mobile.

## Validação local
Execute no projeto:
`npm install`
`npm run typecheck`
`npm run build`

O ambiente de geração não continha `node_modules`, portanto typecheck/build não foram executados aqui.
