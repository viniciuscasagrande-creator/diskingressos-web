# Arquitetura de Backend e Isolamento Multi-Produtor (Fase 9)

Este documento detalha a implementação do backend em **Node.js + Express + TypeScript + Prisma ORM + SQLite / PostgreSQL** da plataforma **DiskIngressos**.

---

## 🏛️ 1. Camada de Segurança & Multi-Tenant Server-Side

```text
CLIENT REQUEST
      │ (Bearer JWT Token no Header Authorization)
      ▼
[ Auth Middleware: requireAuth ]
      │ 1. Decodifica e valida o JWT
      │ 2. Busca o usuário ativo no banco de dados
      │ 3. Injeta req.user = { id, email, name, role, producerId }
      │
      ▼
[ Multi-Tenant Scope Engine: enforceProducerScope ]
      │
      ├─► Se Admin Master / Admin:
      │   Permite consultar globalmente (:scopedProducerId = req.query.producerId || null)
      │
      └─► Se Produtor Comum (Admin, Financeiro, Operacional, Marketing):
          TRAVAMENTO OBRIGATÓRIO: :scopedProducerId = req.user.producerId
          (Ignora e sobrescreve qualquer valor enviado no payload do cliente)
      │
      ▼
[ Database Query (Prisma ORM) ]
      SELECT * FROM events WHERE producerId = :scopedProducerId;
```

---

## 🗄️ 2. Estrutura do Banco de Dados Relacional (Prisma)

### Modelos Principais:
- **`Producer`**: Entidade Tenant que isola eventos, usuários e logs.
- **`User`**: Contas autenticadas com senha criptografada via **bcrypt** (cost 10) e perfis RBAC.
- **`Event`**: Eventos vinculados estritamente ao `producerId`.
- **`AuditLog`**: Registro persistente de operações sensíveis, IP, operador, ação e data/hora.

---

## 📡 3. Endpoints da API REST (`http://localhost:3333/api`)

| Método | Endpoint | Proteção | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Público | Autenticação com e-mail e senha -> retorna JWT e dados do perfil. |
| `GET` | `/api/auth/me` | JWT | Retorna os dados do usuário autenticado e organização vinculada. |
| `GET` | `/api/users` | JWT + Admin | Lista usuários (filtrados pelo `producerId` do produtor ou todos para Master). |
| `POST` | `/api/users` | JWT + Admin | Cria novo usuário com senha criptografada via bcrypt. |
| `PUT` | `/api/users/:id` | JWT + Admin | Atualiza perfil, status ou produtora do usuário. |
| `GET` | `/api/producers` | JWT | Lista produtoras (somente a própria para produtores comuns). |
| `POST` | `/api/producers` | JWT + Master | Cadastra nova organização/produtora. |
| `GET` | `/api/events` | JWT | Lista eventos escopados obrigatoriamente por `producerId`. |
| `POST` | `/api/events` | JWT + Produtor | Cria evento vinculado ao tenant autenticado. |
| `GET` | `/api/audit` | JWT + Admin | Trilha de auditoria e conformidade. |
| `GET` | `/api/health` | Público | Verificação de status e versão do serviço. |

---

## 🚀 4. Como Executar o Backend e o Banco de Dados

```bash
# 1. Gerar os schemas e popular o banco de dados (Seed com senhas Bcrypt):
npm run db:setup

# 2. Iniciar o servidor Node.js/Express na porta 3333:
npm run server
```

---

## 🔑 5. Acessos de Demonstração

- **Admin Master:** `admin@diskingressos.com.br` / `Admin@123`
- **Vinicius (DiskIngressos Produções):** `vinicius@diskingressos.com.br` / `Produtor@123`
- **Financeiro FEP:** `financeiro@fep.com.br` / `Financeiro@123`
- **Carlos Silva (Live Entretenimento):** `carlos@liveentretenimento.com.br` / `Produtor@123`
