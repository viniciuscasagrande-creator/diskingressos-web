<!-- markdownlint-disable MD013 MD024 MD033 MD060 -->
# Fase 29.5 — Modelo de Dados Enterprise + Dicionário de Entidades do Disk Core

**Data:** 15 de Setembro de 2026  
**Documento:** Plano Diretor Tecnológico (PDT) DiskIngressos  
**Princípio Central:** Um evento, pedido, ingresso, pagamento, cliente ou lançamento financeiro existe uma única vez no Disk Core. Disk, Disk Interno e Site apenas possuem perspectivas e permissões diferentes sobre esse mesmo registro.

---

## 1. Cadeia Relacional Mestre do Disk Core

```text
ORGANIZATION
     │
     ├──────── USER (com RBAC + ABAC Scopes)
     │
     └──────── PRODUCER
                  │
                  └──── EVENT
                         │
              ┌──────────┼──────────┐
              │          │          │
            VENUE     SESSION      MAP
                                     │
                                   SECTOR
                                     │
                                    SEAT (Físico)
                                     │
                                 INVENTORY UNIT (Comercial)
                                     │
                           LOT / PRICE RULE
                                     │
                                  ORDER (Snapshot Histórico)
                                     │
                    ┌────────────────┼──────────────┐
                    │                │              │
                 CUSTOMER         PAYMENT        TICKET
                                                   │
                                                CHECK-IN

EVENT
  │
  └──────── FINANCIAL ACCOUNT
                  │
                LEDGER (Partidas Dobradas)
                  │
          AVAILABLE BALANCE (Derivado)
                  │
              SETTLEMENT (Repasse ao Produtor)
```

---

## 2. As Quatro Regras Fundamentais do Modelo de Dados

1. **Snapshot Comercial no Pedido (`Order Snapshot`):**
   `order_items` registra o valor facial, taxas e lote no momento exato da compra. Alterações posteriores de preço ou taxa jamais distorcem vendas passadas.
2. **Saldo é Derivado do Ledger (`Ledger Imutável`):**
   Nenhum saldo é editado diretamente (`UPDATE balance`). O saldo é a soma aritmética reconciliada das entradas do ledger.
3. **Desacoplamento Assento Físico × Inventário Vendável (`Seat ≠ InventoryUnit`):**
   A cadeira física A15 existe no mapa do local. A unidade de inventário para a sessão X do dia Y é a entidade comercial vendável.
4. **Fonte Única da Verdade (`Single Source of Truth`):**
   Zero replicação de tabelas entre portal do produtor, painel da equipe interna e e-commerce público.
