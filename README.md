## Fase 16.5 — Central UTM & Conversões

Esta versão adiciona a Central UTM & Conversões em tela única. Consulte `PHASE16_4_UTM_CONVERSIONS.md`.

# DiskIngressos — Fase 16.5

Esta versão adiciona suporte a múltiplos Meta Pixels e múltiplos Tokens da Conversion API por produtora/evento. Consulte `PHASE16_1_MULTI_PIXEL_TOKEN.md`.

# DiskIngressos — Fase 14

Esta versão consolida as fases anteriores e adiciona **Integrações de Comunicação + SAC / Service Desk com SLA e práticas ITIL**.

## Novidades
- Hub SAC, Dashboard, Chamados, Abertura, SLA & ITIL, Integrações, Base de Conhecimento e Relatórios.
- Priorização automática P1–P4 por impacto × urgência.
- Metas de primeira resposta e resolução persistidas no backend.
- Isolamento multi-produtor nas rotas do SAC.
- Central de Comunicação com WhatsApp Business, e-mail, fila, webhooks e consentimentos LGPD.
- Integração conceitual com Eventos, Ingressos, Participantes, Check-in, Financeiro, Marketing e Remarketing.

# DiskIngressos — Fase 12

Projeto React + TypeScript + Node/Express + Prisma com autenticação multi-produtor e núcleo operacional persistente.

## O que entrou nesta fase

Além de Login, Produtoras, Usuários, Eventos e Auditoria das fases anteriores, a API agora possui banco para **Lotes, Vendas, Ingressos, Participantes, Check-in, Terminais POS, Transações POS, Movimentações Financeiras e Repasses**.

O menu Eventos ganhou **Núcleo Operacional**, consumindo métricas reais do backend no mesmo template visual definido para o sistema.

Leia `PHASE10_OPERATIONS.md` para a arquitetura e rotas.

## Instalação

1. Copie `.env.example` para `.env`.
2. Instale as dependências:

```bash
npm install
```

3. Crie/atualize o banco e carregue os dados de demonstração:

```bash
npm run db:setup
```

4. Inicie frontend e API:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:3333/api`

## Usuários de demonstração

- Admin Master: `admin@diskingressos.com.br` / `Admin@123`
- Produtor Admin: `vinicius@diskingressos.com.br` / `Produtor@123`
- Financeiro FEP: `financeiro@fep.com.br` / `Financeiro@123`

As credenciais são somente para desenvolvimento local. As senhas são armazenadas como hash bcrypt no banco gerado pelo seed.

## Observação para produção

SQLite foi mantido para facilitar a execução local. Para produção, migre o datasource Prisma para PostgreSQL/MySQL, use segredos fortes, HTTPS, cookies/sessão apropriados ou estratégia de tokens com refresh, rate limiting e políticas formais de backup/auditoria.


## Fase 12 — Marketing & Remarketing

Foram adicionados Hub Marketing, Dashboard Marketing, menu completo de Marketing, Hub Remarketing, Dashboard Remarketing e menu completo de Remarketing. Os módulos respeitam o escopo da produtora e o perfil produtor-marketing. Consulte `PHASE11_MARKETING_REMARKETING.md`.


## Fase 12

Campanhas persistentes, Links/UTMs/QR Codes e Pixel & Analytics com herança Global → Produtora → Evento. Consulte `PHASE12_MARKETING_TRACKING.md`.

## Fase 13

Inclui automações persistentes, templates de WhatsApp/e-mail, histórico de execuções e oportunidades de remarketing. Consulte `PHASE13_AUTOMATIONS_MESSAGING.md`.

## Fase 15 — Navegação contextual por evento

Ao clicar em um card de evento, o painel troca a sidebar geral por uma sidebar contextual daquele evento. O contexto permanece ativo em Dashboard, ingressos, cortesias, relatórios, Pixel/GA, UTMs, GA4, tráfego, Meta Ads, Remarketing e Administração do evento. Consulte `PHASE15_EVENT_CONTEXT_NAVIGATION.md`.


## Fase 16.2 — Login e escopo por usuário

- Login é a primeira tela do sistema.
- Produtor DiskIngressos recebe somente seus 15 eventos.
- Admin Master abre a Visão Geral Administrativa e pode selecionar qualquer produtora.
- Sessão normal usa sessionStorage; a opção Lembrar acesso usa localStorage.
- Logout limpa a sessão e retorna para /login.
- Veja `PHASE16_2_LOGIN_SCOPE.md`.

## Fase 16.3 — Dashboard inicial por perfil

Esta versão adiciona redirecionamento pós-login por perfil. Admin Master/Admin entram na visão global; os demais perfis entram em **Meu Dashboard**, já limitado à sua produtora e com atalhos filtrados por permissão.

Novos acessos de teste:

- `operacao@diskingressos.com.br` / `Operacao@123`
- `consulta@diskingressos.com.br` / `Consulta@123`

Veja `PHASE16_3_PROFILE_DASHBOARDS.md` para o desenho de acesso.


## Fase 16.5
Veja `PHASE16_5_UTM_ATTRIBUTION.md` para o fluxo de atribuição UTM persistente, vínculo com pedidos e detecção de carrinho abandonado.

## Fase 16.6

Inclui remarketing automático ligado à origem UTM, fila de recuperação por WhatsApp/E-mail, consentimento por canal, tentativas/retries, dashboard de receita recuperada por campanha e fechamento da atribuição ao marcar uma venda como recuperada. Consulte `PHASE16_6_AUTOMATIC_REMARKETING.md`.
