# Fase 16.2 — Autenticação Obrigatória, Redirecionamento por Perfil & Isolamento Multi-Tenant Estrito

## 📌 Visão Geral

A **Fase 16.2** consolida as diretrizes centrais de **segurança, login e isolamento de escopo por perfil** da plataforma DiskIngressos.

---

## 🔐 1. Login como Primeira Tela Obrigatória

- **Rota Pública Única:** A tela de login (`/login`) é a primeira tela obrigatória. Nenhuma rota ou informação protegida (Dashboard, Eventos, Financeiro, Marketing, Admin) é acessível sem uma sessão autenticada válida.
- **Formulário Completo:**
  - E-mail e Senha com toggle de visualização (👁️ *Mostrar / Ocultar*).
  - Checkbox *Lembrar acesso*.
  - Modal de *Recuperação de Senha*.
  - Botões de **Acesso Rápido de Demonstração** para alternar rapidamente entre perfis (*Admin Master*, *Produtor DiskIngressos*, *Produtor FEP*, *Operador*).

---

## 🎯 2. Redirecionamento Pós-Login por Perfil

```text
                    LOGIN
                      │
                      ▼
               AUTENTICAÇÃO
                      │
            ┌─────────┴─────────┐
            │                   │
         PRODUTOR             ADMIN MASTER
            │                   │
            ▼                   ▼
       producerId          VISÃO GLOBAL
            │                   │
            ▼                   ▼
     TODOS OS EVENTOS    DASHBOARD ADMINISTRATIVO
       (Ex.: 15 eventos)        │
            │                   ├── Total Produtoras: 184
            ▼                   ├── Total Eventos: 427
     Painel Isolado             ├── Vendas Hoje: R$ 485.200
                                └── Cards de Produtoras
                                        │
                                        ▼ [Acessar Produtora]
                                    Visão do Produtor X
                                    + Banner de Aviso Topo
```

### Regras por Perfil:
1. **Produtor (`produtor-admin`, `produtor-financeiro`, `produtor-marketing`):**
   - **Landing:** Redireciona diretamente para **Todos os Eventos** (`eventos`).
   - **Escopo:** Exibe **somente os eventos pertencentes à sua produtora** (ex: 15 eventos).
   - **Header:** Exibe o nome fixo da sua produtora (`XYZ Eventos • João Silva`). **Não exibe seletor de produtoras**.
   - **Busca:** Filtrada exclusivamente nos dados da sua própria produtora.
2. **Admin Master (`admin-master`, `admin`):**
   - **Landing:** Redireciona para o **Dashboard Administrativo Global** (`dashboard`), consolidando métricas de todas as produtoras (*Produtoras Ativas, Eventos Ativos, Vendas Hoje, Usuários*).
   - **Seletor de Produtora:** Dropdown no Header (*Todas as Produtoras (Global)* ou seleção individual).
   - **Banner de Contexto:** Ao acessar uma produtora específica, exibe aviso no topo:
     `Você está visualizando: XYZ Eventos  [ ← Voltar para visão global ]`

---

## 🛡️ 3. Isolamento no Backend (Enforcement em Todas as Entidades)

O backend valida a sessão em todas as rotas:

```text
REQUEST -> JWT/SESSION -> USER (role, producerId) -> AUTHORIZATION MIDDLEWARE
```

- Se `role === 'admin-master'`: Pode consultar globalmente ou filtrar por `?producerId=X`.
- Se `role !== 'admin-master'`: Todas as consultas SQL/Prisma são forçadas a:
  ```sql
  WHERE producerId = USER.producerId
  ```
- Nenhuma rota financeira, de pedidos, cortesias, ingressos, participantes ou pixels pode ser acessada de outra produtora.

---

## 🚪 4. Logout Seguro

- `logout()` remove os tokens da sessão (`sessionStorage.removeItem('safesaff_session')`), reseta os estados e redireciona imediatamente para o formulário de login.
- O histórico do navegador não permite reabrir dados confidenciais após o logout.
