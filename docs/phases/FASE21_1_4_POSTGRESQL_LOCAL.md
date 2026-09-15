# Fase 21.1.4 — PostgreSQL Local + Prisma + Dados de Teste

## Objetivo
Criar a base local oficial de desenvolvimento do DiskIngressos em PostgreSQL, preservando o schema existente e alimentando os eventos/Marketing com dados persistidos no banco.

## Arquivos adicionados
- `docker-compose.local.yml`: PostgreSQL 16 local com volume persistente e healthcheck.
- `.env.local.postgres.example`: configuração local da API/frontend.
- `prisma/schema.postgresql.prisma`: schema PostgreSQL já existente no projeto e mantido como fonte do banco local.
- `prisma/seed.ts`: dados-base do sistema.
- `prisma/seed-marketing-test.ts`: massa de Marketing por evento.

## Instalação no Windows / VS Code
1. Instale e abra Docker Desktop.
2. Copie `.env.local.postgres.example` para `.env` (guarde antes seu `.env` atual, se necessário).
3. Execute:

```bash
docker compose -f docker-compose.local.yml up -d
npm install
npm run db:local:setup
npm run dev
```

## Prisma Studio
```bash
npm run db:local:studio
```

## O que o seed de Marketing faz
O seed de teste trabalha sobre os eventos existentes e cria campanhas/canais e métricas persistidas relacionadas ao evento. O Dashboard continua consultando a API; não há KPI hardcoded no React.

## Reiniciar somente o banco
```bash
docker compose -f docker-compose.local.yml restart postgres
```

## Parar sem apagar dados
```bash
docker compose -f docker-compose.local.yml down
```

## Apagar completamente o banco local
Somente quando realmente quiser zerar os testes:
```bash
docker compose -f docker-compose.local.yml down -v
```

## Regra de segurança
Este compose é exclusivamente para desenvolvimento local. Não use a senha, JWT secret ou tracking secret de exemplo em produção.
