# DiskIngressos Enterprise — Plataforma de Gestão de Eventos & Financeiro

Sistema completo multi-produtor (multi-tenant) construído com **React, TypeScript, Tailwind CSS, Node.js Express e Prisma ORM (SQLite / PostgreSQL)**, utilizando a arquitetura visual oficial baseada no template **Limitless Admin**.

---

## 🎨 Template Oficial do Sistema (Padrão Limitless Admin)

1. **Header Superior (`#222831`, 68px de altura):**
   - Logotipo corporativo DiskIngressos Enterprise.
   - Indicador de status online (`status-indicator bg-success`) no avatar do usuário.
   - Campo de busca global com feedback icon.
   - Seletor multi-tenant para Admin Master e produtoras vinculadas.

2. **Barra de Título Oficial com Breadcrumbs (`ModuleTitleBar`):**
   - Trilha de navegação em breadcrumb: `Home > [Módulo] > [Página Atual]`.
   - Título principal em tipografia corporativa (`text-[22px] font-black text-[#0E1726]`).
   - Badge de segurança e conformidade multi-tenant.

3. **Sidebar Retrátil (`#222A36`):**
   - Menus retráteis iniciam **fechados por padrão** e expandem sob demanda.
   - Isolamento de permissões RBAC por perfil de usuário.

4. **Área de Conteúdo (`#F4F6F9`):**
   - Cards brancos com bordas `#E2E8F0` e sombra suave `shadow-xs`.
   - Widgets estatísticos com porcentagem de variação e ícone em squircle.
   - Tabelas de dados com paginação, filtros e pílulas de status.

---

## 📂 Estrutura de Módulos

```text
SISTEMA DISKINGRESSOS
│
├── 📊 Dashboard Executivo
├── 🏢 Dados da Produtora
│
├── 📅 EVENTOS
│   ├── Todos os Eventos
│   ├── Núcleo Operacional (Persistente via API)
│   ├── Novo Evento
│   ├── Configurar Lotes
│   └── Participantes & Check-in
│
├── 💵 FINANCEIRO
│   ├── Hub Financeiro
│   ├── Saldo Consolidado
│   ├── Solicitações de Repasse
│   ├── Antecipações
│   ├── Extrato Detalhado
│   ├── Contas Bancárias
│   ├── Borderô & Assinaturas Digitais
│   └── OPERAÇÕES AVANÇADAS (Advanced, Split, Inteligência IA, Conciliação)
│
├── 💳 TERMINAIS POS
│   ├── Visão Geral
│   ├── Terminais
│   ├── Vendas Presenciais
│   └── Fechamento de Caixa
│
├── 📢 MARKETING (Fase 11)
│   ├── Hub Marketing
│   ├── Dashboard (KPIs, Funil de 5 Etapas, Conversões por Canal)
│   ├── Campanhas & Criar Campanha
│   ├── Automações, WhatsApp & E-mail
│   ├── Cupons & Promoções
│   ├── Links, UTMs & QR Codes
│   ├── Afiliados & Parceiros
│   └── Pixel & Analytics (Herança Global → Produtora → Evento)
│
├── 🔁 REMARKETING (Fase 11)
│   ├── Hub Remarketing
│   ├── Dashboard (Receita recuperada, Taxa de recuperação, Canais)
│   ├── Carrinhos Abandonados (Recuperação direta via WhatsApp/E-mail)
│   ├── Públicos & Segmentações
│   ├── Fluxos de Recuperação & Remarketing Automático
│   └── Relatórios
│
├── 🎧 Atendimento & SAC
│
└── ⚙️ ADMINISTRAÇÃO & GOVERNANÇA (Fase 8)
    ├── Central Administrativa
    ├── Usuários e Acessos
    ├── Produtoras
    ├── Perfis e Permissões (RBAC)
    ├── Logs de Auditoria
    └── Configurações de Segurança
```

---

## 👥 Contas de Demonstração para Testes

| Perfil | E-mail | Senha | Escopo |
| :--- | :--- | :--- | :--- |
| **Admin Master** | `admin@diskingressos.com.br` | `Admin@123` | Acesso global a todas as produtoras e auditoria |
| **Produtor Admin** | `vinicius@diskingressos.com.br` | `Produtor@123` | Produtora DiskIngressos Produções (#1) |
| **Produtor Marketing** | `juliana@seven.com.br` | `Produtor@123` | Abre direto no Marketing / Remarketing |
| **Produtor Financeiro** | `financeiro@fep.com.br` | `Financeiro@123` | Financeiro exclusivo da FEP Eventos (#2) |

---

## 🚀 Execução

```bash
# Frontend
npm run dev

# Backend API
npx tsx server/src/index.ts
```
