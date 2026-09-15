<!-- markdownlint-disable MD013 MD024 MD033 MD060 -->
# Fase 29.6 — Arquitetura de APIs + Contratos + Event Bus + Integrações do Disk Core

**Data:** 15 de Setembro de 2026  
**Documento:** Plano Diretor Tecnológico (PDT) DiskIngressos  
**Regra Suprema de Comunicação:** Nenhum frontend acessa diretamente o PostgreSQL. Nenhuma integração externa altera dados críticos diretamente. Toda operação passa pelos contratos, validações e regras de negócio do **Disk Core**.

---

## 1. Topologia Geral de Comunicação

```text
                                INTERNET
                                    │
                              CDN / WAF
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
             SITE                 DISK               DISK INTERNO
          Comprador             Produtor             Equipe Disk
          (Público)       (Produtor x Evento)       (Backoffice)
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                               API GATEWAY
                                    │
                             IDENTITY / IAM
                                    │
                               DISK CONTEXT
                                    │
                             ┌──────▼──────┐
                             │  DISK CORE  │
                             └──────┬──────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
        REST                    EVENT BUS                  REALTIME
     (Comandos &              (Assíncrono /              (WebSocket /
      Consultas)                RabbitMQ)                    SSE)
          │                         │                         │
          │                   ┌─────┴─────┐                   │
          │                   │           │                   │
          │                WORKERS     WEBHOOKS               │
          │                                                   │
          ▼                                                   ▼
     PostgreSQL                                        Command Center /
          │                                            Check-in ao Vivo
        Outbox
```

---

## 2. Os Quatro Canais de Comunicação do Disk Core

| Canal | Protocolo / Mecanismo | Aplicação Principal |
| :--- | :--- | :--- |
| **REST APIs** | HTTPS / JSON / OpenAPI v1 | Comandos síncronos e consultas de telas (Disk, Disk Interno, Site) |
| **Event Bus** | RabbitMQ / Transactional Outbox | Comunicação assíncrona desacoplada entre os 24 domínios internos |
| **Realtime** | WebSocket / Server-Sent Events (SSE) | Telas operacionais ao vivo, catracas de acesso e Disk Command Center |
| **Webhooks** | HTTPS com Inbox Pattern e HMAC | Recepção e disparo para terceiros (Gateways, Adquirentes, Meta, Google) |

---

## 3. Envelope Oficial do Evento de Domínio

Todo evento gerado na plataforma segue uma estrutura canônica imutável que carrega contexto e rastreabilidade ponta a ponta:

```json
{
  "eventId": "evt_msg_01K5E9X71A",
  "eventType": "PaymentApproved",
  "eventVersion": 1,
  "aggregateType": "Payment",
  "aggregateId": "pay_01K5E89B2C",
  "occurredAt": "2026-09-15T16:20:00.000Z",
  "organizationId": "org_01K5C1AA",
  "producerId": "prd_01K5C2BB",
  "correlationId": "cor_9281_flow_checkout",
  "causationId": "evt_msg_01K5E9X001",
  "payload": {
    "orderId": "ord_01K5D8CC",
    "amount": 280.00,
    "currency": "BRL",
    "paymentMethod": "PIX",
    "installments": 1
  }
}
```

- **`correlationId`:** Identificador único de ponta a ponta que agrupa todas as ações de uma mesma jornada (do clique no checkout até o envio do WhatsApp e lançamento contábil no ledger).
- **`causationId`:** Identifica o evento exato que originou o evento atual (`PaymentApproved → TicketIssued → NotificationSent`).

---

## 4. Padrão Transactional Outbox e Consistência Eventual

Para impedir o problema clássico de inconsistência transacional (ex: banco aprova pagamento, mas a fila cai e o ingresso nunca é emitido), utilizamos o padrão **Transactional Outbox**:

```text
TRANSAÇÃO ACID NO POSTGRESQL:
┌──────────────────────────────────────────────────────────┐
│  1. UPDATE payments SET status = 'APPROVED'              │
│  2. INSERT INTO ledger_entries (...)                     │
│  3. INSERT INTO outbox_events (eventType, payload, ...)  │
│  COMMIT                                                  │
└──────────────────────────────────────────────────────────┘
                            │
                     OUTBOX WORKER
                            │
                            ▼
                        RABBITMQ
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   TicketConsumer     FinanceConsumer    AuditConsumer
   (Emite Ingresso)   (Liquida Conta)    (Gera Registro)
```

- **Consumers Idempotentes:** Todo consumidor registra a chave `(eventId, consumerId)` no banco para descartar processamentos repetidos em caso de retentativa de rede.
- **Dead Letter Queue (DLQ):** Falhas persistentes são direcionadas à DLQ após política de retry com backoff exponencial (30s, 2min, 10min, 1h), sendo monitoradas na tela de *Integrações* do Disk Interno.

---

## 5. Catálogo Mestre de APIs REST v1 do Disk Core

```text
/api/v1/
├── auth/                       → Sessão, MFA, Step-up e DiskContext
├── producers/                  → Gestão cadastral, financeira e templates de produtores
├── events/                     → Catálogo, sessões, setores e configuração de eventos
│   ├── {id}/builder/validate   → Validação de prontidão do Event Builder
│   ├── {id}/publish            → Operação atômica de publicação (Domain Action)
│   ├── {id}/inventory          → Disponibilidade em tempo real
│   └── {id}/pricing            → Regras de preço por lote e modalidade
├── venues/                     → Locais físicos, plantas base e portões
├── maps/                       → Disk Maps (versões, assentos, setores e bulk grid)
├── inventory/
│   ├── holds                   → Lock temporário de assento (TTL 10 min com Redis)
│   └── availability            → Consulta rápida de mapa e ocupação
├── orders/                     → Criação de pedidos, snapshots de preço e expiração
├── payments/                   → Payment Intents, PIX, Cartão (tokenizado sem CVV)
├── tickets/                    → Emissão, credenciais dinâmicas, transferência e cancelamento
├── access/                     → Validação de catracas, check-in e sincronização offline
├── finance/                    → Ledger imutável, extrato, conciliação e transferências
├── settlements/                → Lotes de repasse e aprovação com duplo fator
├── support/                    → Central de implantação, filas de SLA e dossiê 360°
├── cases/                      → Case Core compartilhado (SAC, Operação, Financeiro)
└── search/                     → Busca Global 360° (CPF, Telefone, Pedido, Ingresso, QR)
```

---

## 6. As Quatro Perguntas Mandatórias de Arquitetura

A partir da Fase 29.6, qualquer novo requisito de software deve responder formalmente:

1. **Qual domínio é o dono soberano do dado?**
2. **Qual endpoint ou comando de domínio executa a ação?**
3. **Quais eventos de domínio são publicados no Event Bus?**
4. **Quem são os consumidores e quais os impactos secundários?**

---

## 7. Próxima Etapa do Roadmap

### ➔ Fase 29.7 — IAM Enterprise + Segurança + Matriz Real de Perfis e Permissões Disk × Disk Interno
Formalização da matriz estrita de autorização RBAC + ABAC para todos os perfis operacionais e executivos (*Administrador Disk, Suporte de Eventos, Operação de Bilheteria, Financeiro, SAC, Marketing, Produtor Admin e Equipes do Produtor*), definindo o controle de acesso granular no backend antes da codificação final das rotas administrativas.
