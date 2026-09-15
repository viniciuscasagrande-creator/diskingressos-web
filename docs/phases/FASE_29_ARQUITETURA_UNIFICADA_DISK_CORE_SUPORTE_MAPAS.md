<!-- markdownlint-disable MD013 MD024 MD033 MD060 -->
# Especificação Arquitetural — Fase 29: Modernização e Unificação DiskIngressos

**Data:** 15 de Setembro de 2026  
**Documento:** Plano Diretor Tecnológico (PDT) DiskIngressos  
**Referência:** Modernização do Sistema Legado (SIGI 2010) → Disk Core × Disk × Disk Interno × Site  

---

## 1. Visão Executiva e Fundamentos da Fase 29

O objetivo da **Fase 29** é estabelecer a fundação definitiva da nova geração tecnológica da DiskIngressos. O sistema legado de 2010 (SIGI), construído há mais de 16 anos, acumulou riqueza de processos e regras de negócio essenciais, porém sofre com fragmentação de bases de dados, sincronizações artificiais e dependência de conhecimento tácito.

A premissa suprema da Fase 29 é:

> **Disk (Portal do Produtor)** e **Disk Interno (Backoffice Operacional)** são duas portas de entrada para a mesma plataforma.
> Dados, regras, cálculos, eventos, pedidos, inventário de ingressos, mapas, saldos e processos pertencem exclusivamente ao **Disk Core**.
> A identidade, papéis (RBAC) e atributos de escopo (ABAC) determinam o que cada usuário visualiza e pode executar.

---

## 2. Arquitetura Macro Unificada (Fase 29.1)

```text
                                DISKINGRESSOS
                                      │
        ┌─────────────────────────────┴─────────────────────────────┐
        ▼                                                           ▼
       DISK                                                    DISK INTERNO
  Portal Produtor                                               Backoffice
  (Produtor x Evento)                                     (Central de Operações)
        │                                                           │
        └─────────────────────────────┬─────────────────────────────┘
                                      │
                                 API GATEWAY
                                      │
                            ┌───────────────────┐
                            │     DISK CORE     │
                            │                   │
                            │ • Regras Negócio  │
                            │ • IAM & Segurança │
                            │ • Motor Financeiro│
                            │ • Mapas & Assentos│
                            │ • Auditoria       │
                            └─────────┬─────────┘
                                      │
                  ┌───────────────────┼───────────────────┐
                  ▼                   ▼                   ▼
             PostgreSQL             Redis             Mensageria
             Dados Core          Cache/Locks         Jobs/Eventos
                  ▲
                  │
                 SITE (newdawn.diskingressos.com.br)
            Portal Público / Comprador
```

### 2.1. Princípio da Fonte Única da Verdade (Single Source of Truth)

* **Errado:** Bancos separados (SafeSaff DB, SIGI DB, Site DB, Financeiro DB) sincronizando via jobs ou webhooks frágeis.
* **Correto:** Um único `event_id` no Disk Core. A hierarquia `Produtor → Evento → Sessão → Local → Mapa → Setor → Assento → Lote → Modalidade → Preço → Pedido → Pagamento → Ledger → Repasse` existe uma única vez.

### 2.2. Segurança e Autorização: RBAC + ABAC com DiskContext

* **RBAC (Role Based Access Control):** Define a função organizacional do usuário (`ADMIN_DISK`, `SUPORTE_DISK`, `FINANCEIRO_DISK`, `PRODUTOR_ADMIN`, `PRODUTOR_FINANCEIRO`, etc.).
* **ABAC (Attribute Based Access Control):** Define sobre quais dados e entidades o usuário tem direito de atuar (`producer_id`, `event_ids`, `venue_ids`, `tenants`).
* **Segurança no Backend:** O frontend nunca é proprietário da regra de negócio. O backend valida obrigatoriamente:
  `Request → Authentication → Tenant → Role → Permission → Producer Scope → Event Scope → Business Rule → Allow / Deny`.

---

## 3. Os Três Ecossistemas e suas Funções

### 3.1. DISK — Portal do Produtor
Opera estritamente nos dois escopos consolidados na **Fase 28.15.8.1**:
- **Contexto Produtor (`PRODUCER`):** Dashboard consolidado, todos os eventos, financeiro multi-evento, CRM, relatórios corporativos.
- **Contexto Evento (`EVENT`):** Visão isolada do evento ativo com vendas, participantes, financeiro do evento, marketing/pixels, cupons, lotes e configurações.

### 3.2. DISK INTERNO — Backoffice da Operação DiskIngressos
Substitui integralmente o antigo SIGI, concentrando:
- Operações globais, cadastro e gestão de produtoras, controle de acesso, bilheterias físicas, PDVs e caixas, conciliação bancária, contabilidade, repasses, auditoria geral e a **Central de Suporte a Eventos**.

### 3.3. SITE — Portal Público do Comprador
Consome os dados publicados pelo Disk Core sem duplicar regras de negócio. Exibe o mesmo mapa aprovado pelo produtor e homologado pelo suporte técnico.

---

## 4. Central de Suporte a Eventos e Event Builder (Fase 29.2)

O Suporte a Eventos nasce como um domínio próprio no Disk Interno (distinto do SAC/atendimento ao comprador), gerenciando todo o ciclo de vida de implantação dos eventos.

```text
PRODUTOR (Disk)                    SUPORTE A EVENTOS (Disk Interno)                  SITE (Público)
      │                                           │                                         │
 Solicita Evento ──────────► DISK CORE ────────► Fila de Implantação                       │
 (Formulário Inteligente)                         │                                         │
                                             Triagem & Análise                              │
                                                  │                                         │
                                            Event Builder                                   │
                                       (Local, Sessões, Lotes)                              │
                                                  │                                         │
                                             Disk Maps                                      │
                                      (Montagem/Ajuste de Mapa)                             │
                                                  │                                         │
                                         Score de Prontidão                                 │
                                                  │                                         │
                                             Homologação                                    │
                                                  │                                         │
 Conferência & ◄──────────────────────────────────┘                                         │
 Aprovação                                                                                  │
      │                                                                                     │
 Aprovado ─────────────────► DISK CORE ────────► Publicação ──────────────────────────────► Ativo p/ Vendas
```

### 4.1. Workflow Oficial de Implantação
`RASCUNHO → SOLICITADO → EM TRIAGEM → EM MONTAGEM → MAPA EM CRIAÇÃO → CONFIGURAÇÃO COMERCIAL → HOMOLOGAÇÃO → AGUARDANDO APROVAÇÃO DO PRODUTOR → APROVADO → PUBLICADO → EM VENDAS → REALIZADO → ENCERRADO`.

### 4.2. Dossiê Operacional do Evento (`EVENTO #EVT-...`)
Visualização consolidada 360° no Disk Interno contendo: Visão Geral, Cadastro, Sessões, Mapa, Setores, Lotes, Inventário, Financeiro, Marketing/Pixels, Operação, Arquivos/Documentos, Checklist de Implantação e Histórico de Alterações com auditoria.

---

## 5. Subsistema Disk Maps (Motor Profissional de Mapas e Assentos)

### 5.1. Separação Mandatória em 4 Camadas
1. **Local (Venue Core):** O espaço físico (`Teatro Positivo`, `Live Curitiba`, `Ligga Arena`). Possui plantas, capacidade física máxima, portões e acessibilidade.
2. **Mapa Físico (Disk Maps):** A disposição geométrica dos setores, fileiras, assentos, mesas e camarotes.
3. **Inventário (Inventory Engine):** A unidade vendável ou bloqueável. Estados oficiais em pt-BR:
   - `Disponível` (`AVAILABLE`)
   - `Em reserva temporária` (`HELD` - TTL 10 minutos)
   - `Reservado` (`RESERVED`)
   - `Vendido` (`SOLD`)
   - `Bloqueado` (`BLOCKED`)
   - `Cortesia` (`COURTESY`)
   - `Bloqueio técnico` (`TECHNICAL_HOLD`)
   - `Cancelado` (`CANCELLED`)
4. **Preço (Pricing Engine):** Regra comercial vinculada ao lote e modalidade (Inteira, Meia, Social, ClubeDisk, VIP).

### 5.2. Regras Críticas de Negócio do Disk Maps
* **Concorrência e Prevenção de Overbooking:** Locks atômicos via Redis garantem que nenhum assento seja reservado ou vendido para duas pessoas simultaneamente.
* **Versionamento de Mapas (v1, v2, v3...):** Nenhuma alteração sobrescreve dados brutos. Mantém-se o histórico completo de quem alterou, quando e por qual motivo.
* **Proteção contra Alterações Destrutivas:** Se uma fileira ou setor já possuir ingressos vendidos (`SOLD`), o sistema bloqueia edição direta e exige análise de impacto com workflow de remanejamento assistido.
* **Templates por Produtor:** Capacidade de clonar a parametrização de eventos anteriores do mesmo produtor sem duplicar pedidos ou IDs de assentos.

---

## 6. Próximo Passo: Fase 29.3 — Engenharia Reversa do SIGI (2010)

Para consolidar a transição sem perda de valor histórico nem regressões, a próxima etapa consiste no mapeamento minucioso dos módulos legados do SIGI:

| Módulo SIGI (2010) | O que faz no legado? | Destino no Novo Ecossistema | Classificação |
| :--- | :--- | :--- | :---: |
| **Clientes** | Cadastro de compradores e histórico | Disk Core (Customer Domain) + Disk Interno | **MODERNIZAR** |
| **Caixa / PDV** | Abertura, suprimento, sangria, fechamento | Disk Interno (Módulo Bilheteria/PDV) | **MODERNIZAR** |
| **Vendas / Pedidos** | Fluxo de emissão e pagamentos | Disk Core (Order/Payment Engines) | **UNIFICAR** |
| **Ticket / Ingressos** | Impressão térmica e voucher digital | Disk Core (Ticket Engine) + Disk Interno | **MODERNIZAR** |
| **Eventos / Lotes** | Cadastro de eventos e precificação | Suporte a Eventos + Event Builder + Disk Maps | **MODERNIZAR** |
| **Estoque / Lotes** | Controle de disponibilidade | Disk Core (Inventory Engine atômico) | **UNIFICAR** |
| **Entregas / Retiradas** | Rastreio de envio e retirada em bilheteria | Disk Interno (Operação de Entrega) | **MODERNIZAR** |
| **Cartão / Gateways** | Transações e adquirentes | Disk Core (Payment Gateway Router) | **UNIFICAR** |
| **Financeiro / Borderô** | Fechamento de eventos e repasses | Disk Core Ledger + Hub Financeiro SafeSaff | **MANTER / EXPANDIR** |
| **Ocorrências / SAC** | Chamados de clientes e estornos | SAC Hub SafeSaff + Centro de Controle de Estornos | **MANTER (PROTEGIDO)** |
| **Controle de Acesso** | Catracas, scanners e validação offline | Disk Core (Access Control Domain) | **MODERNIZAR** |
| **Relatórios / Auditoria**| Emissão de relatórios fiscais e operacionais | Disk Core (Audit & Reporting Service) | **UNIFICAR** |

---

## 7. Conformidade com as Diretrizes do Projeto SafeSaff

1. **Módulos Protegidos Intactos:** Os módulos homologados (`events`, `finance-dashboard`, `finance-refunds`, `marketing-dashboard`, `sac-hub`) mantêm 100% dos seus contratos de navegação e CI/CD.
2. **Interface 100% em Português do Brasil (pt-BR):** Nenhum termo em inglês será exposto ao usuário final em nenhuma tela do Disk ou do Disk Interno.
3. **Qualidade Garantida por Gates:** Toda implementação continua obrigatoriamente submetida aos gates de CI (`verify:protected-modules`, `check:lucide`, `typecheck`, `build` e suítes E2E Playwright).
