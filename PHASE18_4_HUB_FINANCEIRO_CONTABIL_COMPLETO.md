# Fase 18.4 — Hub Financeiro, Contábil, Borderôs e Assinatura Digital

## Objetivo
Transformar o Hub Financeiro em um núcleo ERP financeiro/contábil operacional, conectado a produtoras, eventos, pedidos, ingressos, transações, recebíveis, repasses e auditoria.

## Módulos implementados
- Dashboard Financeiro Contábil
- Centro de Custos hierárquico
- Plano de Contas
- Lançamentos Contábeis
- Conciliação automática e manual
- Contas a Pagar e Receber
- DRE por evento/produtora
- Orçado x Realizado
- Central de Borderôs
- Documentos e Assinaturas
- Camada pronta para Autentique / Clicksign / DocuSign / assinatura interna
- Fechamento Financeiro e Contábil
- Relatórios e exportação CSV
- Auditoria das operações críticas

## Central de Borderôs
Tipos disponíveis:
- resumido
- completo
- detalhado
- lote
- setor
- canal
- pagamento
- PDV
- cortesias
- cancelamentos
- taxas
- repasses
- comissões
- conciliação

Cada geração cria um snapshot versionado com dados do evento, pedidos, ingressos, lotes, transações, repasses, conciliações e obrigações. O documento pode ser aprovado e usado em uma solicitação de assinatura.

## Assinatura Digital
A arquitetura usa `SignatureRequest` e `SignatureSigner` e não amarra o sistema a um único fornecedor.

Provedores preparados:
- Autentique
- Clicksign
- DocuSign
- Interno

O fluxo Autentique-ready persiste `providerDocumentId`, status, URLs do documento, arquivo assinado, hash, signatários e eventos recebidos por webhook.

Para uma integração Autentique real, ainda é necessário adicionar a credencial da conta e implementar a chamada HTTP específica da API da conta contratada. O sistema entregue já possui o modelo de dados e webhook para essa conexão.

## Conciliação
Fontes suportadas no modelo operacional:
- banco
- cartão
- PIX
- POS
- split
- repasse
- taxas
- pedidos
- recebíveis

O endpoint de conciliação automática cria itens a partir dos pedidos do evento e evita duplicidade por referência.

## Fechamento
O fechamento impede encerramento se houver divergências abertas ou, em contexto de evento, se não existir borderô aprovado/assinado.

## Principais endpoints
Base: `/api/finance/accounting`

- `GET /summary`
- `POST /bootstrap`
- `GET|POST /cost-centers`
- `PATCH /cost-centers/:id`
- `GET|POST /chart-accounts`
- `GET|POST /entries`
- `GET|POST /reconciliations`
- `POST /reconciliations/auto`
- `PATCH /reconciliations/:id/reconcile`
- `GET|POST /obligations`
- `PATCH /obligations/:id/pay`
- `GET|POST /budgets`
- `GET /dre`
- `GET /borderos`
- `POST /borderos/generate`
- `GET /borderos/:id/detail`
- `PATCH /borderos/:id/approve`
- `GET|POST /signatures`
- `PATCH /signatures/:id/status`
- `PATCH /signatures/:requestId/signers/:signerId`
- `POST /signatures/webhook`
- `GET|POST /closings`
- `PATCH /closings/:id/close`

## Banco de dados
Novos modelos Prisma:
- `CostCenter`
- `ChartAccount`
- `AccountingEntry`
- `ReconciliationItem`
- `FinancialObligation`
- `BudgetLine`
- `FinancialClosing`
- `BorderoDocument`
- `SignatureRequest`
- `SignatureSigner`

Os schemas SQLite e PostgreSQL foram atualizados.

## Instalação
```bash
npm install
npm run db:setup
npm run build
npm run dev
```

Ao entrar no Financeiro, use o card **Financeiro Contábil 18.4** ou os módulos específicos do menu lateral.
