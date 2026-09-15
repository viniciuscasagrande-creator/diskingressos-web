<!-- markdownlint-disable MD013 MD024 MD033 MD060 -->
# Fase 29.3 — Engenharia Reversa SIGI → Inventário Funcional do Disk Interno

**Data:** 15 de Setembro de 2026  
**Documento:** Plano Diretor Tecnológico (PDT) DiskIngressos  
**Metodologia:** SIGI 2010 → Função Operacional → Regra de Negócio → Domínio do Disk Core → Experiência Disk / Disk Interno  

---

## 1. Objetivo e Metodologia

O objetivo não é copiar visualmente o antigo SIGI de 2010, mas realizar o resgate funcional de mais de 16 anos de regras de negócio, processos de bilheteria e particularidades de eventos da DiskIngressos.

Classificação de cada funcionalidade:
- **MANTER:** Função continua necessária na íntegra.
- **MODERNIZAR:** Conceito continua, implementação será reconstruída com tecnologia contemporânea.
- **UNIFICAR:** Processo que hoje existe espalhado por múltiplos silos.
- **SUBSTITUIR:** Necessidade contínua atendida por uma solução arquitetural superior.
- **ELIMINAR:** Processo legado sem aderência operacional atual.

---

## 2. Matriz de Tratamento SIGI (2010) × Novo Ecossistema

| Módulo Legado (SIGI) | Destino Principal no Ecossistema | Tratamento Oficial |
| :--- | :--- | :---: |
| **Clientes** | Disk Core (Customer Domain) + Disk Interno | **MODERNIZAR** |
| **Caixa** | Bilheteria & PDV (POS Module) | **MODERNIZAR** |
| **Vendas** | Sales Core (Motor Central de Vendas) | **UNIFICAR** |
| **Ticket** | Ticket Core (Emissão, QR Seguro, Titularidade) | **RECONSTRUIR** |
| **Eventos** | Event Core + Event Builder + Disk Maps | **UNIFICAR** |
| **Ecommerce** | Commerce Core (Consumido pelo Site) | **SUBSTITUIR** |
| **Estoque** | Inventory Core (Controle atômico de assentos/capacidade) | **RECONSTRUIR** |
| **Entregas** | Fulfillment (Digital, Impressão, Retirada, Correios) | **MODERNIZAR** |
| **Cartão** | Payments Core (PIX, TEF, Gateways, Adquirentes, Split) | **RECONSTRUIR** |
| **Financeiro** | Financial Core + Ledger Imutável + SafeSaff Hubs | **UNIFICAR** |
| **Ocorrências** | Case Core Compartilhado (SAC, Operação, Financeiro) | **UNIFICAR** |
| **Mensagens** | Notification Core (E-mail, WhatsApp, SMS, Push) | **SUBSTITUIR** |
| **Banco de Imagens** | Media Library (Object Storage + Metadados) | **MODERNIZAR** |
| **Configurações** | Administration & Governance | **RECONSTRUIR** |
| **Relatórios** | Analytics & BI (Operacional, Gerencial, Executivo) | **RECONSTRUIR** |
| **Controle de Acesso** | Access Control Core (Catracas, Offline, Command Center) | **RECONSTRUIR** |

---

## 3. Domínios Principais do Disk Interno

### 3.1. Cliente 360°
- Unificação do histórico: Pedidos, Ingressos, Eventos, Pagamentos, Cancelamentos, Estornos, Check-ins, Atendimentos e Comunicações.
- Busca global instantânea por CPF, Nome, E-mail, Telefone, Pedido, Ingresso, QR Code ou Transação.

### 3.2. Bilheteria & PDV
- Rastreabilidade total de cada movimentação de caixa: `event_id`, `pos_id`, `terminal_id`, `cashier_id`, `user_id`, `payment_method`, `timestamp`.
- Suporte a abertura, sangria, suprimento, cortesias e conferência de fechamento auditada.

### 3.3. Sales Core & Ticket Core
- Vendas originadas de qualquer canal (Site, Disk, Disk Interno, Bilheteria, PDV, Call Center, API) geram o mesmo objeto `Order` no Core.
- Ciclo de vida do ingresso: `CRIADO → EMITIDO → VÁLIDO → UTILIZADO` (com estados alternativos `CANCELADO`, `ESTORNADO`, `TRANSFERIDO`, `BLOQUEADO`, `EXPIRADO`).
- Credencial de segurança: o QR Code não é o `ticket_id` (prevenção contra fraude e clonagem).

### 3.4. Inventory Core
- Matemática atômica de ingressos:
  $$\text{Capacidade Total} = \text{Bloqueio Técnico} + \text{Cortesias} + \text{Venda Disponível}$$
  $$\text{Venda Disponível} = \text{Vendidos} + \text{Reservas Temporárias (HELD)} + \text{Disponíveis}$$

### 3.5. Case Core & Command Center
- Ocorrências tratadas por um motor central (`Case Core`) que transita entre SAC, Financeiro, Operação e Produtor sem perder histórico.
- **Disk Command Center:** Monitoramento operacional em tempo real de grandes eventos (Vendas/minuto, Check-ins/minuto, Catracas online, PIX pendentes, falhas de gateway e tickets SAC).
