# Fase 21.1.11 — Correção integral de escopo Produtor → Eventos → Marketing

## Diagnóstico confirmado pelo vídeo
O login reconhece o Produtor Admin e a produtora, porém retorna 0 eventos. Sem eventos, o Dashboard Marketing não possui `eventId` real e seus KPIs ficam zerados.

## Correções
- Novo `GET /api/scope/diagnostics`: compara JWT, usuário, producerId, produtora, eventos e campanhas no MESMO banco.
- `cloud:scope:check`: diagnóstico direto no PostgreSQL cloud, sem mover ou apagar dados.
- `cloud:bootstrap:demo`: bootstrap não destrutivo e explicitamente bloqueado por padrão; serve apenas para homologação/demo.
- Health da API marcado como 21.1.11.
- Mantida a regra de tenant: produtor nunca consulta eventos de outra produtora.

## Railway / cloud
Após deploy da API:
1. `npm run cloud:db:deploy`
2. `npm run cloud:scope:check`
3. Se o ambiente for HOMOLOGAÇÃO/DEMO e retornar zero eventos:
   `ALLOW_CLOUD_DEMO_BOOTSTRAP=true npm run cloud:bootstrap:demo`
4. Rode novamente `npm run cloud:scope:check`.
5. Faça logout/login na Vercel.

Não execute `prisma/seed.ts` no banco real: ele é destrutivo (deleteMany). Não use o bootstrap demo em produção com dados reais.
