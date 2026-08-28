# Fase 16.7 — Deploy Web / Homologação

## Objetivo
Publicar o DiskIngressos pela web com frontend React, API Node/Express, login protegido e banco PostgreSQL persistente.

## Arquitetura recomendada para homologação

```text
Usuário / Navegador
        |
        v
Frontend React (Vercel ou Cloudflare Pages)
        |
        | HTTPS / VITE_API_URL
        v
API Node + Express (Render / Railway / container Node)
        |
        v
PostgreSQL gerenciado (Neon / Supabase / outro PostgreSQL)
```

## 1. Banco PostgreSQL
Crie um banco PostgreSQL e copie a `DATABASE_URL` completa.

Use o schema de produção:

```bash
npm run db:generate:prod
npm run db:push:prod
npm run db:seed:prod
```

> Execute o seed apenas quando desejar dados de demonstração/homologação.

## 2. Backend
Variáveis obrigatórias:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
TRACKING_TOKEN_SECRET=...
FRONTEND_URL=https://seu-frontend.pages.dev
PUBLIC_APP_URL=https://seu-frontend.pages.dev
NODE_ENV=production
```

Comandos:

```bash
npm ci
npm run db:generate:prod
npm run db:push:prod
npm run start:api
```

Teste:

```text
https://SEU-BACKEND/api/health
```

Deve responder com `ok: true` e `phase: 16.7`.

## 3. Frontend
Configure no provedor do frontend:

```env
VITE_API_URL=https://SEU-BACKEND/api
```

Build:

```bash
npm ci
npm run build:web
```

Diretório de publicação:

```text
dist
```

O arquivo `public/_redirects` foi incluído para preservar as rotas React ao atualizar a página.

## 4. Ordem de publicação

1. Criar PostgreSQL.
2. Publicar API.
3. Testar `/api/health`.
4. Configurar `VITE_API_URL`.
5. Publicar frontend.
6. Atualizar `FRONTEND_URL` na API com a URL final do frontend.
7. Fazer login e testar escopo de Admin e Produtor.

## 5. Testes obrigatórios de homologação

- Login abre antes do sistema.
- Logout volta ao login.
- Produtor visualiza somente seus eventos.
- Admin Master visualiza visão global.
- Tentativa de abrir evento de outra produtora é bloqueada.
- UTM mantém eventId e producerId.
- Pixel/Token não expõe token integral no frontend.
- Financeiro respeita producerId.
- SAC respeita producerId.
- `/api/health` responde publicamente.
- APIs protegidas rejeitam requisição sem token.

## 6. Domínio futuro

Frontend sugerido:

```text
https://homolog.diskingressos.com.br
```

API sugerida:

```text
https://api-homolog.diskingressos.com.br
```

Quando os subdomínios forem ativados, altere `VITE_API_URL`, `FRONTEND_URL` e `PUBLIC_APP_URL`.

## 7. Segurança

Nunca versionar `.env`, JWT_SECRET, TRACKING_TOKEN_SECRET, tokens Meta ou credenciais do banco. Para produção final, adicionar rate limiting, rotação de segredos, cookies HTTP-only ou estratégia de sessão endurecida, backups, observabilidade e migrações versionadas.
