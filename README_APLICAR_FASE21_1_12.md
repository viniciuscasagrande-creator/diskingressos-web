# Aplicar Fase 21.1.12

## Recomendado
Use o ZIP de projeto completo desta fase como nova base no VS Code.

## Deploy Vercel
1. Suba o projeto para o mesmo repositório usado pela Vercel.
2. Cadastre as variáveis de `.env.vercel.example` na Vercel.
3. Garanta um PostgreSQL acessível publicamente por `DATABASE_URL`.
4. Prepare o schema uma única vez com `npm run db:deploy:vercel` usando a URL do banco de produção.
5. Faça Redeploy.
6. Teste `/api/health` antes de testar qualquer senha.

## Não fazer
- Não apontar `VITE_API_URL` para Railway.
- Não usar `localhost` em Production.
- Não colocar `DATABASE_URL` em variável com prefixo `VITE_`.
- Não executar seed destrutivo em produção.
- Não voltar a alterar login/Marketing antes de `/api/health` estar verde.
