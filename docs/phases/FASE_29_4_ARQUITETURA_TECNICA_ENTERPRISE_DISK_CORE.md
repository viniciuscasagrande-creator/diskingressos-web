<!-- markdownlint-disable MD013 MD024 MD033 MD060 -->
# Fase 29.4 — Arquitetura Técnica Enterprise do Disk Core

**Data:** 15 de Setembro de 2026  
**Documento:** Plano Diretor Tecnológico (PDT) DiskIngressos  
**Princípio Central:** Disk, Disk Interno e Site não possuem backends independentes de negócio; os três são canais diferentes sobre o mesmo **Disk Core**.

---

## 1. Arquitetura-Alvo e Tecnologias

```text
                           USUÁRIOS
                              │
          ┌───────────────────┼────────────────────┐
          ▼                   ▼                    ▼
         SITE                DISK             DISK INTERNO
       Comprador           Produtor          Equipe Disk
          │                   │                    │
          └───────────────────┼────────────────────┘
                              │
                     CDN / WAF / SECURITY
                              │
                         API GATEWAY
                              │
                    ┌──────────────────┐
                    │    DISK CORE     │
                    │ Modular Monolith │
                    └────────┬─────────┘
                             │
 ┌───────────────────────────┼───────────────────────────┐
 │                           │                           │
 ▼                           ▼                           ▼
DOMÍNIOS                  EVENT BUS                   WORKERS
(24 Domínios Modulares) (RabbitMQ / Outbox)      (Jobs Assíncronos)
                             │
                    CAMADA DE DADOS
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         PostgreSQL        Redis       Object Storage
```

### 1.1. Decisões Tecnológicas do Baseline
- **Linguagem & Framework:** TypeScript + Node.js + NestJS como padrão estruturado para módulos, controllers, services, guards, DTOs e OpenAPI.
- **Padrão Arquitetural:** Monólito Modular (Modular Monolith) com fronteiras de domínio estritas, facilitando a extração gradual de microsserviços (ex: Payments, Access Control) caso necessário.
- **Identificadores Globais:** UUIDv7 com prefixos de domínio (`evt_...`, `ord_...`, `tkt_...`, `pay_...`).
- **Concorrência Segura:** Locks temporários no Redis (`TTL 10 min` para assentos HELD) combinados com transações ACID no PostgreSQL e idempotência estrita via `idempotency_key`.
- **Transactional Outbox Pattern:** Garante que eventos de domínio (`OrderCreated`, `PaymentApproved`, `TicketIssued`) sejam persistidos atomicamente com o pagamento no banco e distribuídos confiavelmente ao Event Bus.
- **Financeiro por Ledger Imutável:** Lançamentos contábeis de partidas dobradas (`DÉBITOS = CRÉDITOS`). Saldo de evento é resultado do somatório do ledger e nunca um campo editável.
- **Observabilidade OpenTelemetry:** Logs técnicos separados de logs de auditoria de negócio, métricas e tracing distribuído (`trace_id`, `span_id`).
- **Controle de Acesso Offline:** Validação local de ingressos criptografados com cache seguro e reconciliação automática pós-reconexão.
