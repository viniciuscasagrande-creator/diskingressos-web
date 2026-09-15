# Fase 19.1 — Mapa Mestre ERP DiskIngressos

## 1. Objetivo

A Fase 19.1 consolida a arquitetura oficial do ERP DiskIngressos e passa a ser a referência para todas as próximas implementações.

A regra principal é simples:

**Nenhum módulo novo será apenas visual.**
Cada módulo deve possuir:
- tela;
- funções operacionais;
- permissões;
- API;
- persistência em banco;
- auditoria;
- filtros;
- relatórios;
- KPIs;
- integração com produtor e evento;
- integração com os demais módulos quando aplicável.

---

# 2. Arquitetura Mestre

```text
DISKINGRESSOS
│
├── 1. Gestão de Eventos
├── 2. Ticketing & Inventário
├── 3. Checkout & Pagamentos
├── 4. ERP Financeiro
├── 5. Contabilidade
├── 6. Fiscal
├── 7. Tesouraria
├── 8. Controladoria
├── 9. Central de Borderôs
├── 10. Documentos & Assinaturas
├── 11. Compras & Fornecedores
├── 12. Contratos
├── 13. CRM
├── 14. Marketing
├── 15. UTM & Conversões
├── 16. Operações & Acesso
├── 17. SAC / ITIL
├── 18. BI & Analytics
├── 19. IA & Automação
├── 20. Auditoria & Governança
└── 21. Administração da Plataforma
```

---

# 3. Módulos Oficiais do ERP

## 3.1 Gestão de Eventos

### Telas
- Dashboard de Eventos
- Cadastro do Evento
- Configuração Comercial
- Configuração Operacional
- Configuração Financeira
- Equipe e Permissões
- Histórico
- Encerramento do Evento

### Funções
- criar/editar evento;
- duplicar evento;
- publicar/despublicar;
- configurar datas;
- vincular produtor;
- configurar local;
- associar centro de custos;
- associar contas contábeis;
- definir regras de repasse;
- definir taxas;
- abrir/fechar evento.

### KPIs
- receita;
- ingressos vendidos;
- ocupação;
- ticket médio;
- margem;
- valor a receber;
- valor repassado;
- custo;
- conversão.

---

## 3.2 Ticketing & Inventário

### Submódulos
- Tipos de ingresso
- Lotes
- Setores
- Mesas
- Assentos
- Cortesias
- Reservas
- Códigos promocionais
- Combos
- Produtos adicionais
- Controle de estoque de ingressos

### Funções operacionais
- criar lote;
- virar lote automaticamente;
- bloquear lote;
- alterar disponibilidade;
- reservar estoque;
- emitir cortesia;
- cancelar ingresso;
- transferir ingresso;
- reemitir ingresso;
- gerar QR Code;
- consultar histórico.

---

## 3.3 Checkout & Pagamentos

### Submódulos
- Checkout
- PIX
- Cartão
- Débito
- Boleto
- Pagamento customizado
- Link de pagamento
- Split
- Antifraude
- Chargeback
- Reembolso
- Estorno
- Retentativa

### Fluxo
```text
Carrinho
→ Identificação
→ Pagamento
→ Autorização
→ Captura
→ Pedido
→ Recebível
→ Split
→ Conciliação
```

---

# 4. ERP Financeiro

## 4.1 Dashboard Financeiro

### KPIs
- saldo disponível;
- saldo futuro;
- recebíveis;
- contas a pagar;
- contas a receber;
- repasses;
- antecipações;
- receita bruta;
- receita líquida;
- custos;
- despesas;
- margem;
- divergências;
- conciliação.

---

## 4.2 Saldo Consolidado

### Visões
- por produtor;
- por evento;
- por conta;
- por adquirente;
- disponível;
- bloqueado;
- futuro;
- reservado;
- em disputa.

---

## 4.3 Contas a Receber

### Funções
- lançamento manual;
- geração automática;
- baixa;
- baixa parcial;
- renegociação;
- recorrência;
- cobrança;
- parcelamento;
- anexos;
- centro de custos;
- conta contábil;
- conciliação.

---

## 4.4 Contas a Pagar

### Funções
- cadastro;
- aprovação;
- vencimento;
- pagamento;
- recorrência;
- rateio;
- fornecedor;
- centro de custo;
- anexo;
- retenção;
- impostos;
- histórico.

---

## 4.5 Recebíveis

### Funções
- agenda de recebíveis;
- venda por parcela;
- adquirente;
- MDR;
- antecipação;
- liquidação;
- divergência;
- previsão;
- conciliação.

---

## 4.6 Repasses

### Funções
- cálculo;
- solicitação;
- aprovação;
- retenção;
- agendamento;
- pagamento;
- estorno;
- comprovante;
- assinatura;
- histórico;
- auditoria.

---

## 4.7 Antecipações

### Funções
- simulador;
- cálculo de taxa;
- elegibilidade;
- solicitação;
- aprovação;
- pagamento;
- histórico;
- impacto no fluxo de caixa.

---

## 4.8 Spread Financeiro

### Funções
- regra por evento;
- regra por produtor;
- regra por adquirente;
- regra por meio de pagamento;
- simulador;
- histórico;
- margem gerada;
- auditoria.

---

# 5. Contabilidade

## 5.1 Centro de Custos
- estrutura hierárquica;
- por evento;
- por departamento;
- por projeto;
- por operação;
- por produtor;
- rateio percentual;
- rateio por valor;
- orçado x realizado.

## 5.2 Plano de Contas
- sintético;
- analítico;
- natureza da conta;
- ativo;
- passivo;
- receita;
- despesa;
- custo;
- patrimônio.

## 5.3 Lançamentos Contábeis
- débito/crédito;
- automático;
- manual;
- recorrente;
- provisão;
- competência;
- estorno;
- fechamento.

## 5.4 DRE
- por evento;
- por produtor;
- consolidada;
- comparativa;
- mensal;
- anual;
- gerencial.

## 5.5 Balancete
- período;
- saldo anterior;
- débitos;
- créditos;
- saldo final.

## 5.6 Razão
- conta;
- período;
- lançamentos;
- histórico;
- origem.

## 5.7 Diário
- lançamentos por data;
- lote;
- documento;
- origem;
- usuário.

---

# 6. Conciliação

## Tipos
- bancária;
- cartão;
- PIX;
- POS;
- split;
- repasse;
- recebível;
- contábil;
- taxas;
- chargeback.

## Status
- pendente;
- conciliado automático;
- conciliado manual;
- parcial;
- divergente;
- ignorado.

## Motor de Conciliação
Critérios:
- valor;
- data;
- NSU;
- pedido;
- transactionId;
- adquirente;
- produtor;
- evento;
- conta bancária.

---

# 7. Central de Borderôs

## Tipos de Borderô
- resumido;
- completo;
- detalhado;
- por lote;
- por setor;
- por canal;
- por PDV;
- por forma de pagamento;
- por vendedor;
- por cortesia;
- por cancelamento;
- por taxa;
- por comissão;
- por repasse;
- por conciliação;
- comparativo entre eventos.

## Funções
- gerar;
- versionar;
- aprovar;
- rejeitar;
- comentar;
- assinar;
- exportar;
- fechar;
- reabrir com permissão;
- auditar.

## Exportações
- PDF executivo;
- PDF detalhado;
- XLSX;
- CSV;
- impressão.

---

# 8. Documentos & Assinaturas

## Tipos
- borderô;
- contrato;
- repasse;
- DRE;
- prestação de contas;
- termo;
- fechamento.

## Provedores
- Autentique;
- assinatura interna;
- arquitetura pronta para Clicksign;
- arquitetura pronta para DocuSign.

## Status
- rascunho;
- aguardando;
- parcialmente assinado;
- assinado;
- recusado;
- cancelado;
- expirado.

## Dados persistidos
- provider;
- providerDocumentId;
- signatários;
- ordem;
- status;
- signedAt;
- hash;
- arquivo final;
- eventos de webhook;
- auditoria.

---

# 9. Fiscal

## Submódulos
- NF-e;
- NFS-e;
- notas de entrada;
- notas de saída;
- retenções;
- ISS;
- IRRF;
- INSS;
- PIS;
- COFINS;
- CSLL;
- documentos fiscais;
- integração contábil.

---

# 10. Tesouraria

- contas bancárias;
- saldos;
- transferências;
- PIX;
- TED;
- aplicações;
- liquidação;
- conciliação;
- disponibilidade;
- previsão de caixa.

---

# 11. Controladoria

- orçamento;
- budget;
- forecast;
- orçado x realizado;
- margem;
- EBITDA;
- resultado por evento;
- resultado por produtor;
- análise de variação;
- cenários;
- metas;
- indicadores executivos.

---

# 12. Compras

## Fluxo
```text
Solicitação
→ Cotação
→ Aprovação
→ Pedido de Compra
→ Recebimento
→ Documento Fiscal
→ Conta a Pagar
→ Pagamento
→ Centro de Custos
→ Contabilidade
```

## Submódulos
- requisição;
- cotações;
- fornecedores;
- pedidos;
- aprovações;
- recebimento;
- reembolso;
- prestação de contas.

---

# 13. Fornecedores

- cadastro;
- CNPJ/CPF;
- dados bancários;
- documentos;
- certidões;
- contratos;
- serviços;
- histórico;
- pagamentos;
- avaliação;
- bloqueio;
- compliance.

---

# 14. Contratos

- produtores;
- fornecedores;
- prestadores;
- artistas;
- patrocinadores;
- parceiros;
- aditivos;
- vigência;
- valores;
- reajustes;
- anexos;
- assinatura digital;
- alertas de vencimento.

---

# 15. CRM

- clientes;
- leads;
- compradores;
- participantes;
- produtores;
- empresas;
- tags;
- segmentos;
- histórico;
- origem;
- atendimento;
- tarefas;
- oportunidades;
- funil.

---

# 16. Marketing

## Módulos
- Dashboard;
- Campanhas;
- Campanhas Prontas;
- Meta Ads;
- Google Ads;
- TikTok Ads;
- WhatsApp;
- E-mail;
- Cupons;
- Cashback;
- Coins;
- Afiliados;
- Influenciadores;
- Gamificação;
- Indique e Ganhe;
- Públicos;
- Remarketing;
- Recuperação de Vendas.

---

# 17. UTM & Conversões

## Fluxo
```text
Campanha
→ UTM
→ Visita
→ Sessão
→ Carrinho
→ Checkout
→ Compra
→ Pedido
→ Receita
→ Remarketing
```

## KPIs
- visitas;
- carrinhos;
- checkouts;
- compras;
- conversão;
- receita;
- ticket médio;
- CPA;
- ROAS;
- abandono;
- recuperações.

---

# 18. Operações

- check-in;
- controle de acesso;
- QR Code;
- catracas;
- credenciamento;
- bilheteria;
- PDV;
- equipes;
- ocorrências;
- mapa de assentos;
- ocupação;
- monitoramento.

---

# 19. SAC / ITIL

- tickets;
- prioridades;
- categorias;
- SLA;
- filas;
- responsáveis;
- histórico;
- base de conhecimento;
- incidentes;
- problemas;
- mudanças;
- solicitações.

---

# 20. BI & Analytics

## Dashboards
- executivo;
- eventos;
- vendas;
- financeiro;
- contábil;
- marketing;
- operações;
- CRM;
- produtores;
- fornecedores.

## Recursos
- filtros;
- drill-down;
- comparativos;
- exportação;
- metas;
- alertas;
- snapshots;
- histórico.

---

# 21. IA & Automação

## Casos de Uso
- previsão de vendas;
- previsão de caixa;
- risco de abandono;
- risco de chargeback;
- recomendação de campanhas;
- alerta de divergência;
- previsão de público;
- sugestão de preço;
- recomendação de lote;
- insights financeiros;
- classificação automática de despesas;
- conciliação assistida.

---

# 22. Auditoria & Governança

## Registro obrigatório
- usuário;
- tenant/produtor;
- evento;
- data/hora;
- IP quando aplicável;
- módulo;
- ação;
- registro;
- valor anterior;
- valor novo;
- justificativa;
- origem.

## Governança
- RBAC;
- segregação de funções;
- MFA-ready;
- trilha de auditoria;
- aprovações;
- bloqueios;
- fechamento de competência;
- logs de integração.

---

# 23. Administração

- usuários;
- perfis;
- permissões;
- produtores;
- empresas;
- eventos;
- integrações;
- tokens;
- webhooks;
- parâmetros;
- feature flags;
- logs;
- segurança;
- planos comerciais;
- faturamento da plataforma.

---

# 24. Matriz de Perfis

Perfis-base:
- Super Admin
- Admin
- Financeiro
- Contabilidade
- Tesouraria
- Controladoria
- Produtor
- Operação
- Marketing
- SAC
- Auditor
- Consulta

Cada tela deve declarar:
- visualizar;
- criar;
- editar;
- excluir;
- aprovar;
- cancelar;
- exportar;
- assinar;
- fechar;
- reabrir.

---

# 25. Padrão de API

## Estrutura
```text
/api/events
/api/tickets
/api/orders
/api/payments
/api/finance
/api/accounting
/api/reconciliation
/api/borderos
/api/signatures
/api/fiscal
/api/treasury
/api/controllership
/api/purchases
/api/vendors
/api/contracts
/api/crm
/api/marketing
/api/tracking
/api/operations
/api/support
/api/analytics
/api/automation
/api/audit
/api/admin
```

Todas as APIs devem aplicar:
- autenticação;
- RBAC;
- producerId;
- eventId quando aplicável;
- validação;
- auditoria;
- paginação;
- filtros;
- idempotência em ações financeiras críticas.

---

# 26. Padrão de Banco

Entidades principais:
- User
- Role
- Permission
- Producer
- Event
- TicketType
- TicketLot
- Order
- OrderItem
- Payment
- Receivable
- Payout
- BankAccount
- CostCenter
- ChartAccount
- AccountingEntry
- ReconciliationItem
- FinancialObligation
- BudgetLine
- BorderoDocument
- SignatureRequest
- SignatureSigner
- Vendor
- PurchaseRequest
- PurchaseOrder
- Contract
- Customer
- Lead
- MarketingCampaign
- TrackingLink
- AttributionSession
- RecoveryAttempt
- SupportTicket
- AuditLog

---

# 27. Regras Técnicas Obrigatórias

1. Nenhum dado financeiro sem producerId.
2. EventId obrigatório quando o dado pertence a evento.
3. Nenhuma operação crítica sem auditoria.
4. Nenhum fechamento com divergência bloqueadora.
5. Nenhuma assinatura sem versionamento do documento.
6. Nenhum repasse sem cálculo rastreável.
7. Nenhuma conciliação automática sem registrar o critério.
8. Nenhum dashboard com número fictício em produção.
9. Nenhum botão sem ação real.
10. Nenhuma tela de erro pode derrubar toda a aplicação.

---

# 28. Próximas Fases

## Fase 19.2 — Hub ERP Unificado
Criar a home do ERP com:
- módulos;
- atalhos;
- indicadores;
- pendências;
- aprovações;
- alertas.

## Fase 19.3 — Contas a Pagar & Receber Avançado
- títulos;
- recorrência;
- parcelamento;
- cobrança;
- aprovação;
- baixa;
- conciliação.

## Fase 19.4 — Tesouraria & Fluxo de Caixa
- bancos;
- transferências;
- disponibilidade;
- previsão;
- conciliação;
- cenário futuro.

## Fase 19.5 — Controladoria
- budget;
- forecast;
- DRE gerencial;
- margem;
- EBITDA;
- análise de variações.

## Fase 19.6 — Compras & Fornecedores
- requisição;
- cotação;
- pedido;
- aprovação;
- fornecedor;
- contas a pagar.

## Fase 19.7 — Fiscal
- documentos fiscais;
- retenções;
- impostos;
- integração contábil.

## Fase 19.8 — Contratos & Assinaturas
- contratos;
- aditivos;
- aprovações;
- assinatura digital;
- Autentique.

## Fase 19.9 — Auditoria, Compliance & Governança
- trilhas;
- aprovações;
- segregação de funções;
- fechamento.

## Fase 19.10 — BI Executivo ERP
- dashboards;
- drill-down;
- indicadores;
- comparativos;
- exportações.

## Fase 19.11 — IA Financeira & Operacional
- previsões;
- alertas;
- recomendações;
- anomalias;
- classificação automática.

## Fase 19.12 — Integrações Corporativas
- bancos;
- adquirentes;
- contabilidade;
- fiscal;
- assinatura;
- comunicação;
- webhooks.

## Fase 19.13 — ERP Mobile Completo
- fluxos mobile;
- aprovações;
- consultas;
- borderôs;
- assinaturas;
- dashboards.

## Fase 19.14 — Hardening & Escala
- segurança;
- performance;
- observabilidade;
- filas;
- cache;
- disaster recovery;
- alta disponibilidade.

---

# 29. Fluxo Mestre da Plataforma

```text
MARKETING
   ↓
UTM
   ↓
VENDA
   ↓
PEDIDO
   ↓
PAGAMENTO
   ↓
RECEBÍVEL
   ↓
TESOURARIA
   ↓
CONCILIAÇÃO
   ↓
CONTABILIDADE
   ↓
CENTRO DE CUSTOS
   ↓
DRE / CONTROLADORIA
   ↓
BORDERÔ
   ↓
APROVAÇÃO
   ↓
ASSINATURA
   ↓
REPASSE
   ↓
FECHAMENTO
   ↓
AUDITORIA
   ↓
BI / IA
```

---

# 30. Resultado Esperado

A Fase 19.1 passa a ser o documento mestre do ERP DiskIngressos.

Todas as próximas fases deverão apontar para esta arquitetura e não criar módulos paralelos ou funcionalidades desconectadas.

O objetivo final é que produtor, financeiro, contabilidade, marketing, operação e administração utilizem uma única plataforma e uma única base de dados, com rastreabilidade completa desde a aquisição do cliente até o fechamento financeiro e contábil do evento.
