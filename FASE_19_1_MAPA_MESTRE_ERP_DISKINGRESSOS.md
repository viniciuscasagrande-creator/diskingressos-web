# 🏛️ FASE 19.1 — MAPA MESTRE DO ERP DISKINGRESSOS
## Arquitetura Oficial da Plataforma Operacional Unificada de Eventos, Commerce & ERP 360°

---

### 📌 Sumário Executivo & Diretriz Arquitetural
Este documento estabelece a especificação canônica da **DiskIngressos**, consolidando todos os módulos operacionais em um único ecossistema transacional integrado.

#### ⚖️ Regra Arquitetural Mandatória:
`	ext
NÃO:
Card → tela demonstrativa → dados fictícios isolados

SIM:
Card → Módulo Real → Ação/Modal → API REST → Banco de Dados (Prisma)
                                        ↓
                                 Auditoria (Logs)
                                        ↓
                             Dashboards & Relatórios
`

---

## 🗺️ 1. Visão Geral dos 15 Domínios Operacionais

1. **Eventos & Ticketing** (Cadastro, Lotes, Setores, Ingressos, Cortesias, Taxas, Lotação)
2. **Operações & Acesso** (Núcleo de Controle, Validação Facial, Check-in, Portarias, Catracas)
3. **Commerce & Checkout** (Checkout Web/Mobile, Gateways, Maquininhas POS, PIX Dinâmico, Cartões)
4. **Split & Spread de Pagamentos** (Divisão imediata entre DiskIngressos e Produtoras parceiras)
5. **ERP Financeiro & Saldos** (Saldos, Contas a Pagar/Receber, Extrato, Fluxo de Caixa, Antecipações)
6. **Tesouraria & Bancos** (Contas bancárias cadastradas, Transferências PIX/TED, Conciliação Bancária)
7. **Contabilidade Geral** (Centros de Custo, Plano de Contas, Lançamentos Débito/Crédito, Partidas Dobradas)
8. **Fiscal & Tributário** (Emissão NFS-e, NF-e de PDV, Retenções Tributárias, Livros Fiscais)
9. **Controladoria & Orçamento** (DRE Consolidada/Evento/Produtor, Orçado x Realizado, EBITDA, Margens)
10. **Central de Borderôs** (14 tipos de relatórios versionados, snapshots imutáveis, aprovações)
11. **Documentos & Assinatura Digital** (Hub Multi-provedor: Autentique, Clicksign, DocuSign, Interno)
12. **Compras, Despesas & Fornecedores** (Cotações, Pedidos de Compra, Despesas de Produção, Reembolsos)
13. **Marketing, Growth & Central UTM** (Campanhas Prontas, Meta Ads, Google Ads, Pixel/CAPI, WhatsApp, CRM)
14. **Remarketing & Recuperação de Vendas** (Carrinhos abandonados, boletos/PIX pendentes, réguas multicanal)
15. **Auditoria, Governança & BI 360°** (Logs de auditoria, RBAC, Forecast preditivo, exportações em lote)

---

## 🧩 2. Especificação Detalhada por Módulo

---

### Módulo 1: Eventos & Ticketing
* **Telas:** Lista de Eventos, Formulário de Criação/Edição, Gestão de Lotes & Setores, Emissão de Cortesias, Painel de Ingressos.
* **Funções Operacionais:** Cadastro de eventos com datas, locais, lotação máxima, regras de visibilidade (público/privado/oculto), taxas de serviço e conveniência, precificação dinâmica e virada de lote programada.
* **Botões & Ações:** + Novo Evento, Configurar Lotes, Emitir Cortesias, Pausar Vendas, Consultar Ingresso, Reenviar E-mail de Confirmação.
* **Fluxos:** Criação do Evento → Definição de Setores → Criação de Lotes com Quantidade e Preço → Publicação no Commerce → Alimentação do Orçamento Inicial no ERP.
* **Permissões:** Admin Master, Produtor Admin, Produtor Operacional.
* **Endpoints:** GET/POST /api/events, GET/PATCH /api/events/:id, GET/POST /api/lots, GET/POST /api/tickets.
* **Tabelas do Banco:** Event, Lot, Ticket, TicketType.
* **Integrações:** Marketing (Pixel GA4, Meta CAPI), ERP Contábil (Centro de Custo automático gerado por evento).
* **Auditoria:** Registro de alteração de preço de lote, emissão de cortesia e cancelamento de ingresso.
* **Relatórios:** Vendas por lote, ocupação por setor, relação nominal de participantes.
* **Dashboard/KPIs:** Ingressos Vendidos, Receita Bruta, Ocupação (%), Cortesias emitidas.

---

### Módulo 2: Commerce, Checkout & POS
* **Telas:** Checkout Web, Terminal POS / PDV, Fechamento de Caixa, Gestão de Terminais.
* **Funções Operacionais:** Processamento de pagamentos com split de recebíveis em tempo real, geração de QR Code PIX dinâmico (com expiração e confirmação via webhook instantâneo), cobrança de cartão com antifraude, suporte a maquininhas POS físicas em bilheteria com modo online/offline.
* **Botões & Ações:** Finalizar Compra, Gerar PIX, Abrir Caixa PDV, Fechar Caixa, Estornar Pagamento, Sincronizar Vendas POS.
* **Fluxos:** Seleção de Ingressos → Checkout → Validação Antifraude → Gateway/Adquirente → Confirmação → Split de Pagamento → Geração de Ingressos / QR Code → Lançamento Contábil e Financeiro.
* **Permissões:** Todos (Compradores no Checkout); Operadores/Produtores no PDV.
* **Endpoints:** POST /api/orders/checkout, GET /api/pos/terminals, POST /api/pos/sales, POST /api/pos/close-box.
* **Tabelas do Banco:** Order, OrderItem, Payment, PosTerminal, PosSession.
* **Integrações:** Adquirentes (Cielo, Rede, Stone, PagSeguro), PIX Banco Central, Antifraude (ClearSale).
* **Auditoria:** Log de tentativas de compra, estornos autorizados, divergências de caixa no PDV.
* **Relatórios:** Vendas por terminal POS, vendas por forma de pagamento, relatório de chargebacks.
* **Dashboard/KPIs:** GMV diário, Taxa de Aprovação (%), Tempo Médio de Checkout, Ticket Médio.

---

### Módulo 3: Split & Spread de Pagamentos
* **Telas:** Painel de Split Financeiro, Simulador de Spread e Taxas de Adquirentes.
* **Funções Operacionais:** Cálculo automatizado das regras de divisão de faturamento no ato da compra. Dedução das taxas de adquirência (MDR), aplicação do spread comercial e crédito líquido para as contas dos produtores e coprodutores.
* **Botões & Ações:** Configurar Regra de Split, Simular Spread, Ajustar MDR por Operadora.
* **Fluxos:** Venda no Gateway → Cálculo do Split → Envio da instrução de repasse imediato ao parceiro → Registro no livro contábil.
* **Permissões:** Admin Master, Produtor Financeiro.
* **Endpoints:** GET/POST /api/finance/split-rules, POST /api/finance/simulate-spread.
* **Tabelas do Banco:** SplitRule, SpreadConfig, PaymentSplitExecution.
* **Integrações:** Motor de split das adquirentes bancárias.
* **Auditoria:** Registro de alterações em percentuais de taxas e regras de repasse.
* **Relatórios:** Demonstrativo analítico de split por evento, margem de spread retida.
* **Dashboard/KPIs:** Receita de Spread, Volume Transacionado em Split, Taxa Média de Adquirência.

---

### Módulo 4: ERP Financeiro & Saldos
* **Telas:** Dashboard Financeiro, Saldos & Carteira, Contas a Pagar, Contas a Receber, Fluxo de Caixa, Extrato Transacional, Antecipações de Receita.
* **Funções Operacionais:** Visualização de saldos (Disponível, A Receber, Bloqueado, Reserva Técnica), conciliação de recebíveis D+0/D+1/D+30, simulação e contratação de antecipações financeiras, liquidação em 1 clique de obrigações com contrapartes.
* **Botões & Ações:** Solicitar Repasse, Contratar Antecipação, Liquidar Obrigação, Novo Lançamento a Pagar/Receber, Exportar Extrato CSV (UTF-8 BOM).
* **Fluxos:** Venda Realizada → Recebível Gerado → Solicitação de Antecipação → Análise e Liberação → Crédito em Conta Bancária.
* **Permissões:** Produtor Admin, Produtor Financeiro, Admin Master.
* **Endpoints:** GET /api/finance/balance, GET /api/finance/statement, GET/POST /api/finance/accounting/obligations, POST /api/finance/advance/request.
* **Tabelas do Banco:** FinancialObligation, FinancialTransaction, AdvanceRequest.
* **Integrações:** Bancos e adquirentes para quitação e antecipação.
* **Auditoria:** Histórico de solicitações de saque, aprovação de antecipações e quitação de despesas.
* **Relatórios:** Extrato financeiro oficial, posição de contas a pagar e receber, fluxo de caixa diário.
* **Dashboard/KPIs:** Saldo Disponível, Contas a Pagar Hoje, Contas a Receber no Mês, Taxa Média de Antecipação.

---

### Módulo 5: Contabilidade Geral
* **Telas:** Centro de Custos, Plano de Contas, Lançamentos Contábeis (Débito/Crédito), Livro Diário, Livro Razão, Fechamento Contábil Periódico.
* **Funções Operacionais:** Estruturação de contas sintéticas/analíticas (Ativo, Passivo, Patrimônio Líquido, Receitas, Custos e Despesas), escrituração por partidas dobradas com competência e documento de suporte, bloqueio contábil com auditoria e verificação de pendências.
* **Botões & Ações:** Novo Centro de Custo, Nova Conta Contábil, Novo Lançamento Débito/Crédito, Encerrar Competência Mensal, Gerar Livro Diário.
* **Fluxos:** Fato Contábil (Venda/Despesa/Repasse) → Geração automática de Lançamento Débito/Crédito → Atualização do Balancete → Apuração de DRE → Fechamento de Mês.
* **Permissões:** Produtor Financeiro, Contador, Admin Master.
* **Endpoints:** GET/POST /api/finance/accounting/cost-centers, GET/POST /api/finance/accounting/chart-accounts, GET/POST /api/finance/accounting/entries, POST /api/finance/accounting/closings.
* **Tabelas do Banco:** CostCenter, ChartAccount, AccountingEntry, FinancialClosing.
* **Integrações:** Exportações SPED Contábil, Domínio Sistemas, ContaAzul.
* **Auditoria:** Registro imutável de usuário que efetuou ou estornou lançamentos contábeis.
* **Relatórios:** Balancete de Verificação, Livro Diário Oficial, Livro Razão por Conta.
* **Dashboard/KPIs:** Total de Lançamentos do Mês, Equilíbrio Débitos x Créditos, Status da Competência.

---

### Módulo 6: Controladoria, DRE & Orçamento
* **Telas:** DRE por Evento, DRE por Produtora, DRE Consolidada da Plataforma, Painel Orçado x Realizado.
* **Funções Operacionais:** Demonstração do Resultado Econômico estruturada (Receita Bruta → Deduções e Impostos → Receita Líquida → Custos Operacionais → Margem de Contribuição → Despesas Fixas → EBITDA → Lucro Líquido). Controle de desvios orçamentários por categoria.
* **Botões & Ações:** Definir Orçamento de Linha, Comparar Orçado x Realizado, Exportar DRE Executiva.
* **Fluxos:** Definição do Budget Inicial → Apropriação de Despesas e Receitas Reais → Cálculo de Desvios → Projeção de Margem Final.
* **Permissões:** Diretor Financeiro, Produtor Admin, Controladoria.
* **Endpoints:** GET /api/finance/accounting/dre, GET/POST /api/finance/accounting/budgets.
* **Tabelas do Banco:** BudgetLine, consultas consolidadas em AccountingEntry e Order.
* **Integrações:** Módulo de BI e Exportação para Excel/BI.
* **Auditoria:** Log de revisões orçamentárias e alterações de metas financeiras.
* **Relatórios:** DRE comparativa mês a mês, DRE por evento, análise de desvios de custos.
* **Dashboard/KPIs:** Margem de Contribuição (%), EBITDA (R$), Desvio Orçamentário Global (R$).

---

### Módulo 7: Central de Borderôs & Assinatura Digital
* **Telas:** Central de Borderôs (14 formatos), Visualizador de Documentos, Painel de Assinaturas Digitais (Autentique / Clicksign / Interno).
* **Funções Operacionais:** Geração de snapshots imutáveis com versionamento automático (v1, v2, v3), aprovação oficial de fechamento pelo produtor, disparo de envelopes de assinatura digital com trilha de signatários e webhook de retorno com documento assinado.
* **Botões & Ações:** Gerar Borderô Oficial, Aprovar Borderô, Enviar para Assinatura (Autentique/Clicksign), Download PDF Assinado, Exportar Dados (CSV UTF-8 BOM).
* **Fluxos:** Fechamento de Vendas → Geração de Borderô v1 → Conferência de Cortesias e Taxas → Aprovação Financeira → Disparo para Assinatura Digital → Coleta de Assinaturas com Hash SHA-256 → Liberação de Repasse Final.
* **Permissões:** Produtor Admin, Diretor Financeiro, Jurídico.
* **Endpoints:** GET/POST /api/finance/accounting/borderos, POST /api/finance/accounting/borderos/:id/approve, GET/POST /api/finance/accounting/signatures, POST /api/finance/accounting/signatures/webhook.
* **Tabelas do Banco:** BorderoDocument, SignatureRequest, SignatureSigner.
* **Integrações:** Autentique API v2, Clicksign API, DocuSign REST API.
* **Auditoria:** Hash SHA-256 do documento, endereço IP do signatário, carimbo de data/hora oficial.
* **Relatórios:** Borderô Resumido, Borderô Completo, Borderô Detalhado, Borderô de Taxas e Adquirência.
* **Dashboard/KPIs:** Borderôs Aprovados, Documentos Assinados, Tempo Médio de Coleta de Assinatura.

---

### Módulo 8: Marketing, Central UTM & Campanhas
* **Telas:** Hub Marketing, Campanhas Prontas, Central UTM & Conversões, Meta Ads Manager, Google Ads, TikTok Ads, WhatsApp Marketing, CRM de Públicos.
* **Funções Operacionais:** Ativação em 1 clique de estratégias prontas com geração automática de links rastreáveis com parâmetros UTM individuais por canal. Sincronização em tempo real via Meta Conversions API (CAPI) de Purchase, InitiateCheckout e AddToCart.
* **Botões & Ações:** Ativar Campanha Pronta, Criar Link UTM / QR Code, Criar Anúncio Meta, Adicionar Palavra-Chave Google, Disparar WhatsApp em Massa.
* **Fluxos:** Escolha de Campanha Pronta → Seleção de Canais → Geração de UTMs → Rastreamento de Tráfego → Atribuição de Vendas → Cálculo de CPA e ROAS Real.
* **Permissões:** Produtor Admin, Produtor Marketing, Agência de Tráfego.
* **Endpoints:** GET/POST /api/marketing/campaigns, GET/POST /api/marketing/ready-campaigns/activate, GET/POST /api/marketing/links, GET /api/marketing/utm/dashboard.
* **Tabelas do Banco:** MarketingCampaign, TrackingLink, ReadyCampaignActivation, UtmJourneyAction.
* **Integrações:** Meta Graph API & CAPI, Google Ads API, TikTok Marketing API, Z-API (WhatsApp).
* **Auditoria:** Registro de investimento alocado, alterações de criativos e disparos de mensagens.
* **Relatórios:** Relatório de Atribuição UTM, Performance por Canal, Ranking de Campanhas por ROAS.
* **Dashboard/KPIs:** ROAS Consolidado, CPA Médio, Conversões Atribuídas, Receita por Canal.

---

## 🏛️ 3. Diagrama de Entidades do Banco de Dados (Prisma)

`	ext
+-------------------+       +-------------------+       +--------------------+
|     Producer      | 1---N |       Event       | 1---N |        Lot         |
| id, name, doc     |       | id, title, date   |       | id, name, price    |
+-------------------+       +-------------------+       +--------------------+
         | 1                         | 1                          | 1
         |                           |                            |
         | N                         | N                          | N
+-------------------+       +-------------------+       +--------------------+
|    CostCenter     |       |       Order       | 1---N |       Ticket       |
| id, code, name    |       | id, code, gross   |       | id, code, status   |
+-------------------+       +-------------------+       +--------------------+
         | 1                         | 1
         |                           |
         | N                         | N
+-------------------+       +-------------------+
|  AccountingEntry  |       | ReconciliationItem|
| id, deb, cred     |       | id, exp, rec, diff|
+-------------------+       +-------------------+
         |                           |
         +-------------+-------------+
                       |
                       V
+-----------------------------------------------+
|                BorderoDocument                |
| id, code, reportType, version, status, hash   |
+-----------------------------------------------+
                       | 1
                       |
                       | N
+-----------------------------------------------+
|               SignatureRequest                |
| id, provider, status, signedFileUrl, signers  |
+-----------------------------------------------+
`

---

## 🚀 4. Roadmap das Próximas Entregas Estratégicas

* **Fase 19.2 — Motor de Tesouraria, Contas Bancárias & Conciliação Automática**
* **Fase 19.3 — Módulo de Compras, Fornecedores & Ordens de Pagamento**
* **Fase 19.4 — Gestão de Contratos, Prazos & Aditivos com Assinatura**
* **Fase 19.5 — Painel Executivo de Controladoria, EBITDA & BI 360°**

---
*DiskIngressos Pro Platform • Arquitetura Master Fase 19.1*
