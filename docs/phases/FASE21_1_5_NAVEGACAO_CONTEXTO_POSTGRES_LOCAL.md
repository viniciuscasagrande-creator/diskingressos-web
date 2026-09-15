# Fase 21.1.5 — Navegação, Contexto Global e PostgreSQL Local Efetivo

## Corrigido
- Voltar/Avançar do navegador agora restaura a tela anterior por `history.state.page`.
- Toda navegação de módulo cria uma entrada de histórico (`/app/<page>`), com fallback das rotas de evento já existentes.
- Contexto de Marketing (`eventId` + período) fica persistido em `sessionStorage` por produtora.
- Campanhas e Campanhas Prontas recebem o evento selecionado no Dashboard.
- O seletor não deve voltar silenciosamente para o primeiro evento ao trocar de tela.
- `npm run db:local:setup` agora ativa de fato o `.env` PostgreSQL local antes de gerar/push/seed.
- O `.env` anterior é preservado em `.env.before-local-postgres` na primeira ativação.

## Subida local
```bash
docker compose -f docker-compose.local.yml up -d
npm install
npm run db:local:setup
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:3333/api
Prisma Studio: `npm run db:local:studio`

## Teste obrigatório
1. Marketing > Dashboard.
2. Selecione um evento.
3. Confirme KPIs.
4. Abra Performance por Canal ou Campanhas.
5. Use Voltar do navegador.
6. O Dashboard deve retornar com o mesmo evento e período.
7. Selecione outro evento e confirme alteração dos dados.

## Observação
`MarketingCampaignsPage.tsx` ainda contém uma camada visual legada com mocks para parte da tela de Campanhas. Esta fase não removeu esse módulo para evitar uma refatoração ampla. O Dashboard Marketing e o endpoint consolidado continuam baseados no banco/API. A substituição completa dos mocks da tela de Campanhas deve ser feita como etapa operacional própria.
