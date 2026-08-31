# Aplicar Fase 21.1.8
Copie os arquivos preservando a estrutura de pastas. Não reescreva App.tsx e não remova rotas/módulos existentes.

Depois:
1. Configure PostgreSQL cloud no backend.
2. Configure as variáveis do backend conforme `.env.backend.cloud.example`.
3. Execute `npm install` e `npm run cloud:db:prepare` no backend.
4. Publique a API com `npm run cloud:start`.
5. Na Vercel configure `VITE_API_URL=https://SEU-BACKEND/api` e faça novo deploy.
6. Valide `/api/health` e faça login na Vercel.

Não execute `db:seed:marketing-test` no banco de produção.
