# Fase 29.9 — Núcleo de Pagamentos Enterprise + PIX + Cartões + Gateways + Antifraude + Split + Estorno + Chargeback + Conciliação

## 29.9.1 — Arquitetura do Núcleo de Pagamentos

A Fase 29.9 implementa a infraestrutura financeira que transforma pedidos gerados no **Commerce Core** em dinheiro efetivamente recebido, auditado, conciliado e distribuído na conta gráfica dos produtores.

```text
                    PEDIDO (ORD)
                         │
                         ▼
               INTENÇÃO DE PAGAMENTO
                         │
                         ▼
              ORQUESTRADOR FINANCEIRO
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
       PIX            CARTÃO          TEF / POS
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                 GATEWAYS & PSPs
                         │
                         ▼
                  MOTOR DE RISCO
                   (ANTIFRAUDE)
                         │
                         ▼
                     PAGAMENTO
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
           APROVADO              RECUSADO
              │
              ▼
         DISK LEDGER (Partida Dobrada)
              │
              ▼
          LIQUIDAÇÃO (Agenda D+0 a D+30)
              │
              ▼
         CONCILIAÇÃO (Matching 4 Vias)
              │
              ▼
        SALDO DO PRODUTOR (Não Editável)
              │
              ▼
             REPASSE
```

---

## 29.9.2 — Princípios Fundamentais e Separação de Entidades

1. **Separação de Momentos**:
   - `Pedido` $\neq$ `Pagamento` $\neq$ `Transação` $\neq$ `Liquidação` $\neq$ `Conciliação` $\neq$ `Repasse`.
2. **Garantia de Não-Edição Manual de Saldo**:
   - Saldo do produtor é consequência matemática estrita de vendas, recebimentos, taxas contratuais congeladas no snapshot e reservas de risco/chargeback.
3. **Idempotência Universal**:
   - Toda operação crítica (criar intenção, capturar, cancelar, estornar) exige `idempotencyKey` única para eliminar duplo clique ou cobrança duplicada.
4. **Proteção Contra Retry Cego em Timeout**:
   - Falha ou timeout no gateway nunca dispara retry automático. O sistema primeiro consulta o status na adquirente antes de qualquer nova tentativa.
5. **Segurança PCI DSS Nível 1**:
   - O Disk Core não armazena PAN (número completo de cartão) nem CVV. Trabalha exclusivamente com tokens, bandeiras, últimos 4 dígitos e códigos de autorização.
6. **Maker × Checker & Alçadas**:
   - Estorno e liberação manual de risco exigem motivo formal de auditoria, perfil qualificado e registro de trilha cronológica no Core.

---

## 29.9.3 — Componentes e Módulos Entregues

| Componente / Arquivo | Descrição |
| :--- | :--- |
| `src/types/payments-enterprise.types.ts` | Tipos oficiais de pagamentos, split, risco, chargebacks, reconciliações e webhooks |
| `src/services/paymentsEnterprise.service.ts` | Serviço com API live `/api/v1/payments/*` e fallback resiliente |
| `server/src/routes/paymentsEnterprise.ts` | Rotas express do backend para transações, dossiê, estorno, antifraude e conciliação |
| `src/components/payments/PaymentsHubPage.tsx` | Central de Pagamentos Enterprise com 8 abas especializadas e filtros globais |
| `src/components/payments/PaymentDossier360Modal.tsx` | Dossiê 360° do pagamento com split congelado, timeline e estorno parcial/total |
| `src/components/payments/ManualReviewModal.tsx` | Modal de auditoria manual para transações na fila de risco antifraude |
| `src/components/payments/PixPaymentModal.tsx` | Modal de simulação e geração de PIX com QR code, copia-e-cola e contador |
| `tests/regression/payments-enterprise-core.spec.ts` | Testes de regressão e homologação E2E Playwright |
