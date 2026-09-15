# Fase 29.7 — IAM Enterprise + Segurança + Matriz Real de Perfis e Permissões Disk × Disk Interno

> **Disk Core — Plataforma de Identidade, Autorização Granular (RBAC + ABAC), Segregação de Funções (SoD) e Developer Command Center**  
> **PDT DiskIngressos**: Interface do usuário 100% Português do Brasil (pt-BR). Inglês somente em código, APIs e identificadores técnicos.

---

## 29.7.1 — Arquitetura Central de Identidade

A segurança na DiskIngressos não é baseada em interface visual. O princípio orientador é:

> **O menu não define a segurança. O Disk Core define a segurança.**  
> Ocultar o botão "Estornar", "Publicar" ou "Transferir" não protege a operação. Mesmo que alguém tente chamar a API diretamente, o Core deverá negar qualquer ação fora de seu perfil, organização, produtor, evento e contexto autorizado.

```text
                    IDENTITY CORE
                          │
           ┌──────────────┼──────────────┐
           │              │              │
        USUÁRIO        SESSÃO          MFA
           │              │              │
           └──────────────┼──────────────┘
                          │
                         IAM
                          │
                  ┌───────┴───────┐
                  │               │
                 RBAC            ABAC
                  │               │
                 ROLE          CONTEXTO
                  │               │
             PERMISSION     ORGANIZATION
                            PRODUCER
                            EVENT
                            RESOURCE
                          │
                          ▼
                   POLICY ENGINE
                          │
                     ALLOW / DENY
```

---

## 29.7.2 — Uma Identidade, Múltiplos Contextos

Não há duplicação de cadastros para diferentes responsabilidades. Uma mesma pessoa física possui um único identificador canônico no Identity Core, com memberships e escopos independentes:

```text
João Silva (usr_8291)
│
├── DiskIngressos (org_disk)
│     └── Perfil: Suporte de Eventos (role_event_support)
│
└── Produtor ABC Entretenimento (org_prod_441)
      └── Perfil: Administrador do Produtor (role_producer_admin)
```

Ao alternar entre o Disk Interno e o ambiente de um produtor específico, a sessão adota o contexto selecionado, e o Policy Engine valida estritamente as ações sob esse escopo.

---

## 29.7.3 — Entidade Memberships

A relação entre usuário, organização e perfil é desacoplada através da entidade `memberships`:

```text
memberships
────────────────────────────────────────
id               UUID PK
user_id          UUID FK -> users.id
organization_id  UUID FK -> organizations.id
role_id          UUID FK -> roles.id
status           ACTIVE | SUSPENDED | INVITED | EXPIRED
valid_from       TIMESTAMP WITH TIME ZONE
valid_until      TIMESTAMP WITH TIME ZONE (NULL = Indefinido)
created_at       TIMESTAMP WITH TIME ZONE
updated_at       TIMESTAMP WITH TIME ZONE
```

Cadeia de resolução:
```text
USER ──► MEMBERSHIP ──► ORGANIZATION ──► ROLE ──► PERMISSIONS + POLICIES
```

---

## 29.7.4 — Tipos Canônicos de Usuário

| Tipo de Usuário | Descrição | Premissa de Acesso |
| :--- | :--- | :--- |
| `DISK_INTERNAL` | Colaboradores e operadores da DiskIngressos | **Não significa acesso total**. Permissões limitadas estritamente ao departamento. |
| `PRODUCER` | Produtores, equipes de eventos e contratantes | Restrito às organizações e eventos designados. |
| `PARTNER` | Afiliados, pontos de venda parceiros e integradores | Escopo delimitado por contrato e canal. |
| `SERVICE_ACCOUNT` | Aplicações backend, daemons, workers e lambdas | Autenticação mTLS/API-Key com políticas mínimas de privilégio. |
| `CUSTOMER` | Compradores finais de ingressos | Acesso exclusivo aos próprios pedidos, carteira e ingressos. |

---

## 29.7.5 a 29.7.23 — Perfis do Disk Interno

```text
DISK INTERNO
│
├── Administrador Disk       Plataforma, organizações, integrações (sujeito a auditoria e step-up)
├── Gestão / Diretoria        Dashboards executivos, BI, relatórios (somente leitura; sem estorno/edição)
├── Suporte de Eventos        Criação, Event Builder, Disk Maps, homologação de eventos
├── SAC N1                   Consulta de pedidos, histórico e reenvio de ingressos
├── SAC N2                   Operações especiais autorizadas e cancelamentos orientados
├── Supervisor SAC           Aprovação de exceções e tratativas de alto impacto
├── Financeiro Operador      Geração de borderôs, conferência e solicitações de repasse
├── Financeiro Aprovador     Aprovação de repasses e transferências dentro da alçada
├── Financeiro Gestor        Aprovações executivas, liberação de garantias e conciliações
├── Contabilidade            Plano de contas, DRE, conciliações fiscais (sem poder de movimentação bancária)
├── Conciliação              Auditoria de gateways, transações bancárias e conciliação de adquirentes
├── Operação de Campo        Monitoramento de portões, contingência e apoio in loco
├── Bilheteria / PDV         Operação de terminais com caixa aberto específico e auditoria de sangria
├── Controle de Acesso       Validação de QR codes e catracas (sem exposição de PII e financeiro)
├── Marketing                Gestão de campanhas, cupons, pixels e métricas de tráfego
├── Comercial                Credenciamento de novos produtores, taxas e condições comerciais
└── Auditor                  Somente Leitura transversal sobre o Audit Trail de toda a operação
```

### Segregação de Funções (SoD — Segregation of Duties) & Alçadas Financeiras
1. **Regra Maker × Checker**: Para transferências, estornos e repasses, `creator_user_id !== approver_user_id`.
2. **Matriz de Alçadas de Repasse**:
   - Até R$ 10.000,00: `FINANCEIRO_ANALISTA`
   - De R$ 10.000,01 a R$ 100.000,00: `FINANCEIRO_GESTOR`
   - Acima de R$ 100.000,00: `DIRETORIA` com aprovação dupla e MFA obrigatório.

---

## 29.7.24 a 29.7.30 — Perfis do Produtor no Disk & Escopo por Evento

Os produtores operam com os seguintes perfis no portal:
- `PRODUTOR_ADMIN`: Gestão geral da produtora, equipe, eventos e relatórios.
- `PRODUTOR_FINANCEIRO`: Saldos, extratos, transferências e relatórios contábeis.
- `PRODUTOR_MARKETING`: Campanhas, pixels, links parametrizados (UTM) e cupons.
- `PRODUTOR_OPERACAO`: Gestão de participantes, listas VIP e controle de acesso.
- `PRODUTOR_RELATORIOS`: Acesso somente leitura a relatórios analíticos.
- `PRODUTOR_SUPORTE`: Consulta a pedidos e resolução de dúvidas de participantes.

### Hierarquia de Escopo Canônica
```text
PLATFORM
   ↓
ORGANIZATION
   ↓
PRODUCER
   ↓
EVENT
   ↓
RESOURCE
```
Se a colaboradora Maria pertence ao Produtor XYZ com escopo limitado aos eventos `EVT-100` e `EVT-102`, ela não acessará `EVT-101` mesmo que altere a URL ou chame os endpoints diretamente. O backend valida a relação `(actorUserId, producerId, eventId)` em cada requisição.

---

## 29.7.31 a 29.7.34 — Nomenclatura Técnica e Policy Engine

### Convenção `resource.action`
As permissões são chaves atômicas e imutáveis:
- Eventos: `event.read`, `event.create`, `event.update`, `event.publish`
- Mapas: `map.read`, `map.create`, `map.update`, `map.update_after_sales`
- Pedidos: `order.read`, `order.cancel`
- Ingressos: `ticket.read`, `ticket.issue`, `ticket.cancel`, `ticket.resend`
- Financeiro: `finance.read`, `finance.transfer.create`, `finance.transfer.approve`
- Estornos: `refund.request`, `refund.approve`, `refund.execute`
- Cortesias: `courtesy.create`, `courtesy.approve`, `courtesy.issue`

### Fluxo de Avaliação do Policy Engine
```text
REQUISIÇÃO (HTTP / RPC)
  │
  ▼
1. Autenticação (JWT / Bearer Token ativo?)
  │
  ▼
2. Sessão Válida (Não revogada no Redis?)
  │
  ▼
3. Membership Ativo (Status ACTIVE e valid_from <= NOW <= valid_until?)
  │
  ▼
4. Papel & Permissão Atômica (Possui resource.action?)
  │
  ▼
5. Escopo Organizacional (Produtor pertence à organização?)
  │
  ▼
6. Escopo de Evento (Usuário possui grant para o eventId solicitado?)
  │
  ▼
7. Regras de Negócio & SoD (Maker != Checker? Limite financeiro respeitado?)
  │
  ▼
8. Risco & Step-up MFA (Operação de alto risco exige MFA ativo?)
  │
  ▼
ALLOW / DENY (com registro em auditoria)
```

---

## 29.7.51 a 29.7.69 — Governança, Controles Críticos e Zero Trust

1. **Alteração de Mapa Pós-Vendas (`map.update_after_sales`)**: Se o evento já vendeu ingressos, a alteração de mapa é bloqueada por padrão. Mudanças estruturais exigem perfil de supervisão técnica com cálculo de impacto atômico.
2. **Alteração de Preço Pós-Vendas (`pricing.update_after_sales`)**: Não altera o histórico contábil de pedidos emitidos. Pedidos passados mantêm o snapshot financeiro do momento da compra.
3. **Permissões Temporárias com Auto Expire**: Credenciais de equipes de apoio, brigadistas e portaria possuem carimbo `valid_until` que expira automaticamente sem intervenção humana.
4. **Zero Compartilhamento de Senhas**: Inclusão de membros exclusivamente por convites individuais por e-mail com token temporário e MFA.
5. **SecurityContext Canônico**:
```ts
export interface SecurityContext {
  actorUserId: string
  effectiveUserId: string
  organizationId: string
  producerId?: string
  eventId?: string
  roles: string[]
  permissions: string[]
  sessionId: string
  authenticationLevel: 'STANDARD' | 'MFA_VERIFIED' | 'STEP_UP'
  impersonation: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  correlationId: string
}
```

---

# 29.7.70 a 29.7.97 — Developer Disk + Observabilidade + Rastreamento Total

## 29.7.70 — Perfil Especial DEVELOPER_DISK

O perfil `DEVELOPER_DISK` é destinado à sustentação técnica, diagnóstico, investigação e observabilidade global da plataforma inteira (Disk Core, Disk Interno, Disk e Site).

### Premissa Central
```text
VER TUDO  ≠  ALTERAR TUDO SEM CONTROLE
```
O Developer possui visibilidade irrestrita para investigação e correlação de eventos, mas qualquer alteração em dados de produção (write/override) exige justificativa técnica, validação de MFA e registro auditado inalterável.

### Três Níveis de Perfil Developer (29.7.96)
```text
DEVELOPER
│
├── Developer Observer  Leitura de logs, traces, auditoria e métricas
├── Developer Engineer  Diagnóstico, sessões, reprocessamento de DLQ e jobs
└── Developer Lead      Ações emergenciais, feature flags, incidentes e quebra de vidro (Break-Glass)
```

---

## 29.7.71 a 29.7.85 — Módulos da Central Developer

1. **Central de Logs Estruturados (29.7.71)**:
   - Filtros por: `correlationId`, `traceId`, `requestId`, `userId`, `eventId`, `severity` (INFO, WARN, ERROR, FATAL) e intervalo de tempo.
   - Sanitização de Logs (29.7.91): Nenhum segredo, hash de senha, token JWT completo ou dados de cartão (PAN/CVV) são logados.

2. **Rastreamento de Usuário & Timeline (29.7.72 - 29.7.74)**:
   - Reconstrução completa da sessão do usuário: logins, páginas navegadas, buscas, ações operacionais e exportações com comparador Antes × Depois (`beforeState` vs `afterState`).

3. **Jornada de Ponta a Ponta via Correlation ID (29.7.75)**:
   - Rastreamento unificado de incidentes. Exemplo: um pedido problemático `ORD-982736`:
```text
SITE ──► CheckoutStarted ──► OrderCreated ──► PaymentCreated ──► Gateway PIX ──► WebhookReceived ──► LedgerPosted ──► TicketIssued ──► NotificationQueued (Falha no WhatsApp)
```

4. **Trace Técnico de Latência / APM (29.7.76)**:
   - Medição de tempo por subetapa da requisição: autenticação, lock de inventário no Redis, cálculo de regras comerciais, transação no banco relacional e chamadas a gateways externos.

5. **Event Bus Inspector & DLQ (29.7.80 - 29.7.81)**:
   - Monitoramento de tópicos do RabbitMQ/EventBus e filas de mensagens.
   - Diagnóstico de Dead-Letter Queues (DLQ) com reprocessamento manual auditado.

6. **Error Center com Fingerprint & Impacto Financeiro (29.7.84 - 29.7.85)**:
   - Agrupamento de exceções por hash da stack trace.
   - Cálculo automático do raio de impacto: quantidade de usuários afetados, eventos impactados e volume financeiro em risco.

7. **Health Center da Infraestrutura & Gateways (29.7.83)**:
   - Status em tempo real do Disk Core, PostgreSQL, Redis, RabbitMQ, Provedores PIX, Gateways de Cartão, WhatsApp e E-mail.

8. **Session Inspector & Revogação de Sessão (29.7.86 - 29.7.87)**:
   - Listagem de sessões ativas com dispositivo, IP e localização aproximada.
   - Revogação imediata de sessão por suspeita de comprometimento com justificativa registrada.

9. **Developer Impersonation Transparente (29.7.88)**:
   - Visualização técnica sob a perspectiva do produtor para reprodução de chamados, obrigatoriamente sinalizada com **banner visual ostensivo** no topo da tela e gravação da identidade real do desenvolvedor no `SecurityContext.actorUserId`.

10. **Logs Imutáveis e Zero Tampering (29.7.90 - 29.7.93)**:
    - Registro de auditoria append-only. Nem mesmo o Developer Lead possui autorização para remover ou truncar logs de auditoria.

11. **Developer Command Center (29.7.97)**:
    - Painel mestre de indicadores em tempo real: uptime da plataforma, P95 de resposta das APIs, taxa de erro global, pedidos/minuto, ingressos/minuto e incidentes ativos.
