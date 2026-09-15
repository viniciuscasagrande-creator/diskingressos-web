# MAPA DE MENU ANTES × DEPOIS — FASE 28.15.8.1
**PDT DiskIngressos — Reorganização Definitiva do Menu Enterprise**
*Data de Execução: 15/09/2026*

---

## 1. Princípio Arquitetural
- **SIDEBAR**: Módulos e Áreas Estratégicas de 1º e 2º nível (limite de 5 a 9 entradas por módulo).
- **HUB INTERNO**: Funções operacionais e ferramentas consolidadas em cards visuais responsivos.
- **TELA / VIEW**: Execução da função especializada.
- **REGRA ABSOLUTA**: 100% das rotas, views, controllers, permissões e deep-links legados foram preservados.

---

## 2. Inventário Completo: Financeiro

| # | Item Anterior | Grupo Anterior | Rota / PageKey Original | Novo Ponto de Acesso (Hub) | Status |
|---|---|---|---|---|---|
| 01 | Dashboard Financeiro | Raiz Financeiro | `/app/finance-dashboard` (`finance-dashboard`) | Sidebar Nível 2 (Protegido CI) | Preservado |
| 02 | Estornos | Independente | `/app/finance-refunds` (`finance-refunds`) | Sidebar Nível 1 Independente (Protegido CI) | Preservado |
| 03 | Conta do Produtor | CONTA FINANCEIRA | `/app/finance-producer-account` | Hub Conta Financeira › Conta do Produtor | Preservado |
| 04 | Saldo por Evento | CONTA FINANCEIRA | `/app/finance-hub` | Hub Conta Financeira › Saldo por Evento | Preservado |
| 05 | Extrato | CONTA FINANCEIRA | `/app/finance-statement` | Hub Conta Financeira › Extrato | Preservado |
| 06 | Transferências entre Eventos | CONTA FINANCEIRA | `/app/finance-producer-account` | Hub Conta Financeira › Transferências | Preservado |
| 07 | Contas a Receber | GESTÃO | `/app/finance-receivables` | Hub Contas › Contas a Receber | Preservado |
| 08 | Contas a Pagar | GESTÃO | `/app/finance-payables` | Hub Contas › Contas a Pagar | Preservado |
| 09 | Plano de Contas | GESTÃO | `/app/finance-chart-accounts` | Hub Controladoria › Plano de Contas | Preservado |
| 10 | Centro de Custos | GESTÃO | `/app/finance-cost-centers` | Hub Controladoria › Centro de Custos | Preservado |
| 11 | Orçamentos | GESTÃO | `/app/finance-dre` | Hub Controladoria › Orçamentos | Preservado |
| 12 | Fornecedores | GESTÃO | `/app/finance-expenses` | Hub Compras & Fornecedores › Fornecedores | Preservado |
| 13 | Recebíveis | RECEBIMENTOS | `/app/finance-receivables` | Hub Contas › Recebíveis | Preservado |
| 14 | Agenda Financeira | RECEBIMENTOS | `/app/finance-cashflow` | Hub Contas › Agenda Financeira | Preservado |
| 15 | Repasses | RECEBIMENTOS | `/app/finance-payouts` | Hub Contas / Tesouraria › Repasses | Preservado |
| 16 | Antecipações | RECEBIMENTOS | `/app/finance-advance` | Hub Contas › Antecipações | Preservado |
| 17 | Conciliação | RECEBIMENTOS | `/app/finance-reconciliation` | Hub Conciliação › Conciliação Bancária | Preservado |
| 18 | Fluxo de Caixa | ANÁLISE | `/app/finance-cashflow` | Hub Controladoria › Fluxo de Caixa | Preservado |
| 19 | Resultado por Evento | ANÁLISE | `/app/finance-cost-centers` | Hub Controladoria › Resultado por Evento | Preservado |
| 20 | Divisão de Receitas | ANÁLISE | `/app/finance-split` | Hub Conta Financeira › Divisão de Receitas | Preservado |
| 21 | Pagamentos & Taxas | ANÁLISE | `/app/finance-methods` | Hub Conta Financeira / Tesouraria › Pagamentos & Taxas | Preservado |
| 22 | Relatórios Financeiros | ANÁLISE | `/app/finance-reports` | Hub Relatórios Financeiros | Preservado |
| 23 | Borderô Financeiro | Avulso | `/app/finance-bordero` | Hub Relatórios › Borderô Financeiro | Preservado |
| 24 | Consolidado Financeiro | Avulso | `/app/finance-consolidated` | Hub Controladoria / Relatórios › Consolidado | Preservado |
| 25 | Contas Bancárias | Avulso | `/app/finance-bank-accounts` | Hub Tesouraria › Contas Bancárias | Preservado |

---

## 3. Inventário Completo: Contabilidade

| # | Item Anterior | Rota / PageKey Original | Novo Ponto de Acesso (Hub) | Status |
|---|---|---|---|---|
| 01 | Visão Geral Contábil | `/contabilidade/dashboard` (`accounting-dashboard`) | Sidebar Nível 2 (Entrada Oficial) | Preservado |
| 02 | Inteligência Contábil | `/contabilidade/inteligencia` (`accounting-inteligencia`) | Hub Demonstrações › Inteligência Contábil | Preservado |
| 03 | Centro de Conciliação | `/contabilidade/conciliacao` (`accounting-conciliacao`) | Hub Operação Contábil › Centro de Conciliação | Preservado |
| 04 | Rastreabilidade | `/contabilidade/rastreabilidade` (`accounting-rastreabilidade`) | Hub Operação Contábil › Rastreabilidade | Preservado |
| 05 | DRE Gerencial | `/contabilidade/dre` (`accounting-dre`) | Hub Demonstrações › DRE Gerencial | Preservado |
| 06 | Balanço Patrimonial | `/contabilidade/balanco` (`accounting-balanco`) | Hub Demonstrações › Balanço Patrimonial | Preservado |
| 07 | Fechamento Mensal | `/contabilidade/fechamento` (`accounting-fechamento`) | Hub Operação Contábil › Fechamento Mensal | Preservado |
| 08 | Plano de Contas | `/contabilidade/plano-de-contas` (`accounting-plano-de-contas`) | Hub Operação Contábil › Plano de Contas | Preservado |
| 09 | Lançamentos | `/contabilidade/lancamentos` (`accounting-lancamentos`) | Hub Operação Contábil › Lançamentos | Preservado |
| 10 | Documentos | `/contabilidade/documentos` (`accounting-documentos`) | Hub Fiscal & Compliance › Documentos | Preservado |
| 11 | Fiscal & SPED | `/contabilidade/fiscal` (`accounting-fiscal`) | Hub Fiscal & Compliance › Fiscal & SPED | Preservado |
| 12 | Relatórios Contábeis | `/contabilidade/relatorios` (`accounting-relatorios`) | Sidebar Nível 2 / Hub Relatórios | Preservado |

---

## 4. Inventário Completo: Marketing & Growth

| # | Item Anterior | Rota / PageKey Original | Novo Ponto de Acesso (Hub) | Status |
|---|---|---|---|---|
| 01 | Dashboard Marketing | `/app/marketing-dashboard` (`marketing-dashboard`) | Sidebar Nível 2 (Protegido CI) | Preservado |
| 02 | Status Real | `/app/marketing-status-real` (`marketing-status-real`) | Hub Campanhas › Status Real | Preservado |
| 03 | Campanhas Prontas | `/app/marketing-ready-campaigns` | Hub Campanhas › Campanhas Prontas | Preservado |
| 04 | Campanhas Multicanais | `/app/marketing-campaigns` | Hub Campanhas › Campanhas Multicanais | Preservado |
| 05 | Meta Ads | `/app/marketing-meta-ads` | Hub Conversões & Pixels › Meta Ads | Preservado |
| 06 | Google Ads | `/app/marketing-google-ads` | Hub Conversões & Pixels › Google Ads | Preservado |
| 07 | TikTok Ads | `/app/marketing-tiktok-ads` | Hub Conversões & Pixels › TikTok Ads | Preservado |
| 08 | Spotify Ads | `/app/marketing-spotify` | Hub Conversões & Pixels › Spotify Ads | Preservado |
| 09 | Pixels e Conversões | `/app/marketing-tracking` | Hub Conversões & Pixels › Rastreamento | Preservado |
| 10 | Atribuição Multicanal | `/app/marketing-attribution` | Hub Conversões & Pixels › Atribuição Multicanal | Preservado |
| 11 | Influenciadores | `/app/marketing-influencers` | Hub Campanhas › Influenciadores | Preservado |
| 12 | Central UTM & Conversões | `/app/marketing-utm-central` | Hub Campanhas › Central UTM & Links | Preservado |
| 13 | WhatsApp | `/app/marketing-whatsapp` | Hub Comunicação › WhatsApp | Preservado |
| 14 | E-mail Marketing | `/app/marketing-email` | Hub Comunicação › E-mail Marketing | Preservado |
| 15 | Cupons & Descontos | `/app/marketing-coupons` | Hub Campanhas › Cupons & Descontos | Preservado |
| 16 | Cashback Promocional | `/app/marketing-cashback` | Hub Campanhas › Cashback | Preservado |
| 17 | Relatórios de Marketing | `/app/marketing-reports` | Hub Analytics › Relatórios | Preservado |
| 18 | Performance por Canal | `/app/marketing-channel-performance` | Hub Analytics › Performance por Canal | Preservado |
| 19 | Ranking de Campanhas | `/app/marketing-campaign-ranking` | Hub Analytics › Ranking de Campanhas | Preservado |

---

## 5. Resumo da Redução Estrutural da Sidebar

| Módulo | Itens na Sidebar Anterior | Itens na Nova Sidebar | Redução |
|---|:---:|:---:|:---:|
| **Financeiro** | 22 itens + 4 cabeçalhos | **8 hubs + Estornos** | **-65%** |
| **Contabilidade** | 12 itens | **5 hubs** | **-58%** |
| **Marketing** | 17 itens | **5 hubs** | **-70%** |
| **Total Eliminado da Sidebar Direta** | **55 itens soltos** | **19 hubs organizados** | **-65% de poluição visual** |

*Nota: Nenhuma função, rota ou tela foi apagada. Todas permanecem acessíveis diretamente através de seus hubs internos ou por deep-link direto.*
