# Fase 29.8 — Motor Enterprise de Pedidos, Vendas, Ingressos, Inventário e Checkout Omnichannel

> **Disk Core — Plataforma Comercial Unificada, Reserva Atômica de Inventário, Motor de Preços, Checkout Omnichannel e Pedido 360°**  
> **PDT DiskIngressos**: Interface do usuário 100% Português do Brasil (pt-BR). Inglês restrito à camada técnica interna e código-fonte.

---

## 29.8.1 — Arquitetura Comercial Unificada (Commerce Core)

A decisão fundamental da nova arquitetura DiskIngressos é:

> **Site, Disk, Disk Interno, Bilheteria, PDV e futuras integrações parceiras não possuem motores de venda separados. Todos utilizam rigorosamente o mesmo Commerce Core.**

```text
                         CANAIS DE VENDA (OMNICHANNEL)
                               │
       ┌───────────┬───────────┼───────────┬───────────┐
       ▼           ▼           ▼           ▼           ▼
      SITE        DISK     DISK INTERNO   PDV      PARCEIROS
                               │
                               ▼
                         COMMERCE CORE
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          INVENTÁRIO         PREÇOS          CARRINHO
       (Inventory Core)  (Pricing Engine)  (Cart Engine)
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                       SESSÃO DE CHECKOUT
                               │
                               ▼
                         PEDIDO (ORDER)
                               │
                               ▼
                       PAGAMENTO (PAYMENT)
                               │
                        PaymentApproved
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
           INGRESSO         LEDGER         NOTIFICAÇÕES
        (Ticket Core)  (Partida Dobrada)  (WhatsApp/Email)
              │
              ▼
      CONTROLE DE ACESSO
```

---

## 29.8.2 a 29.8.3 — Canais de Venda & Sales Channels

Toda venda possui obrigatoriamente um canal rastreável (`channel_id`):

| Canal Técnico | Nome na Interface | Tipo de Operação |
| :--- | :--- | :--- |
| `SITE` | Site Oficial / Ecommerce | Compra pública B2C online |
| `DISK` | Portal do Produtor | Vendas corporativas e cortesias emitidas pelo produtor |
| `DISK_INTERNO` | Disk Interno • Mesa Operacional | Venda assistida pelo time de atendimento e suporte |
| `BOX_OFFICE` | Bilheteria Física Oficial | Terminais locais conectados em venues |
| `PDV` | Pontos de Venda Credenciados | Terminais comerciais com gestão de sangria e caixa |
| `PARTNER` | Parceiros & Afiliados | Venda externa via API canônica do Disk Core |

---

## 29.8.4 a 29.8.11 — Inventário Centralizado & Hold Engine Atômico

1. **Disponibilidade Centralizada**: Nenhum frontend calcula assentos ou vagas disponíveis. Todas as consultas são respondidas pelo Inventory Core com leitura atômica.
2. **Tipos de Inventário**:
   - **Lugar Livre / Pista**: Controle por capacidade numérica agregada.
   - **Setorizado**: Capacidade particionada por áreas (Pista, VIP, Camarote).
   - **Assento Marcado**: Integração atômica direta com o **Disk Maps** (Setor, Fileira, Cadeira).
   - **Mesas e Camarotes**: Agrupamentos de assentos com venda fechada ou individual.
3. **Estados do Inventário (pt-BR)**:
   - `AVAILABLE` ➔ **Disponível**
   - `HELD` ➔ **Em Reserva Temporária** (Hold com TTL configurável por evento/canal)
   - `SOLD` ➔ **Vendido** (Trava imutável contra overbooking e IDOR)
   - `BLOCKED` ➔ **Bloqueado**
   - `COURTESY` ➔ **Cortesia Emitida**
   - `TECHNICAL_HOLD` ➔ **Bloqueio Técnico da Produção**
4. **Regra Inviolável contra Dupla Venda**:
   > **Um InventoryUnit não pode pertencer simultaneamente a dois holds válidos ou duas vendas confirmadas.**
   A reserva temporária opera com locks transacionais no Redis e constraints únicas no banco de dados relacional. Expirado o TTL sem confirmação de pagamento, o evento `InventoryHoldExpired` devolve o assento para venda sem intervenção manual.

---

## 29.8.14 a 29.8.19 — Pricing Engine & Mudança Transacional de Lotes

1. **Cálculo Canônico de Preço**:
   `Evento + Sessão + Setor + Lote + Modalidade + Regra de Negócio = Preço Final`
2. **Modalidades Oficiais**: Inteira, Meia-Entrada Legal, Social (Alimento), Promocional, ClubeDisk, Convênios e Cortesia.
3. **Virada de Lote Segura**: A transição entre lotes por quantidade de ingressos é tratada via transação ACID no banco. Se restar 1 ingresso no 1º lote e 2 pessoas clicarem no mesmo milissegundo, apenas 1 recebe a cotação do 1º lote; a outra é informada da virada antes do pagamento.
4. **Cotação Garantida (Pricing Quote)**: Toda intenção de compra gera um `quote_id` com data de expiração, congelando o valor do ingresso e taxas durante o checkout.

---

## 29.8.29 a 29.8.40 — Pedidos, Pagamentos & Evento Canônico PaymentApproved

1. **Ciclo de Vida do Pedido**:
   - `DRAFT` ➔ **Rascunho**
   - `AWAITING_PAYMENT` ➔ **Aguardando Pagamento**
   - `PAID` ➔ **Pago**
   - `FULFILLED` ➔ **Concluído**
   - `PARTIALLY_REFUNDED` ➔ **Parcialmente Estornado**
   - `REFUNDED` ➔ **Estornado**
   - `CANCELLED` ➔ **Cancelado**
2. **Desacoplamento Pedido × Pagamento**: Um pedido pode conter múltiplas tentativas de pagamento (ex: cartão recusado 2x seguido de PIX aprovado).
3. **Efeito Cascata do Evento PaymentApproved**:
   - Pedido é marcado como **Pago**.
   - Assentos no inventário passam de **Em Reserva** para **Vendido**.
   - Ingressos são emitidos individualmente com chave de credencial criptográfica e QR Code seguro.
   - Partida dobrada imutável é gravada no Ledger financeiro.
   - Disparo assíncrono de notificações de WhatsApp e E-mail.
   - Conversão atribuída aos pixels de Marketing e UTM correspondente.

---

## 29.8.65 — Central de Integridade Comercial (Commerce Integrity Center)

No Disk Interno, a Central de Integridade Comercial monitora ativamente anomalias operacionais:
- **Pedidos Inconsistentes**
- **Pagamentos Aprovados sem Emissão de Ingressos** (disparo automático do Recovery Engine)
- **Ingressos Emitidos sem Registro no Ledger**
- **Holds Expirados Retidos no Redis**
- **Webhooks de Adquirentes Pendentes ou Falhos**

---

## 29.8.79 a 29.8.82 — Pedido 360° (Três Visões do Mesmo Pedido)

```text
                                PEDIDO #ORD-928371
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
   VISÃO CLIENTE                   VISÃO PRODUTOR                VISÃO OPERACIONAL
(Comprovante no Site)           (Portal do Produtor)           (Disk Interno & Desenvolvedor)
  • Ingressos comprados           • Resumo de vendas            • Itens & Taxas detalhadas
  • QR Code para acesso           • Titulares autorizados       • Gateway & Adquirente
  • Recibo financeiro             • Canais de origem            • Ledger & Partidas Dobradas
                                                                • Timeline de Execução
                                                                • Rastreamento Correlation ID
                                                                • Debug Técnico JSON
```
