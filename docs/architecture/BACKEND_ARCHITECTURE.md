# DiskIngressos — Fase 9: Backend e Multi-Tenant

## Segurança implementada

- Autenticação pela API com JWT de 8 horas.
- Senhas armazenadas apenas como `bcrypt` hash (cost 12).
- Usuário comum nunca escolhe `producerId` para consultar dados: o backend usa o `producerId` do token.
- Admin Master/Admin podem consultar múltiplas produtoras.
- Eventos possuem `producerId` obrigatório e índice por produtora.
- Criação/alteração de usuário e evento gera `AuditLog`.
- APIs administrativas exigem perfil adequado.

## Rotas

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/producers`
- `PATCH /api/producers/:id/status`
- `GET/POST /api/users`
- `PATCH /api/users/:id/status`
- `GET/POST /api/events`
- `PUT /api/events/:id`
- `GET /api/audit`
- `GET /api/health`

## Banco

SQLite é usado na Fase 9 para instalação local simples. O schema Prisma foi preparado para migração futura para PostgreSQL/MySQL. Para produção, recomenda-se PostgreSQL e segredo JWT via cofre de segredos.

## Regra multi-tenant crítica

A filtragem por produtora acontece no servidor. Ocultar cards ou menus no React não é considerado segurança. Toda nova tabela de negócio (vendas, participantes, financeiro, POS, repasses etc.) deve incluir `producerId` ou possuir uma relação inequívoca com um recurso que tenha `producerId`.
