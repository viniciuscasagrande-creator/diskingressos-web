# Segurança Multi-Produtor (Multi-Tenant) — Especificação Arquitetural de Backend

A **Fase 7** estabelece o comportamento estrutural e visual de segurança no frontend. Em produção, este isolamento deve ser garantido de forma mandatória na camada de banco de dados e APIs.

---

## 🔒 Princípios e Regras Fundamentais

1. **Sessão Autenticada como Fonte da Verdade:**
   - A sessão / JWT autenticado determina com precisão o `user_id`, `role` e `producer_id`.
2. **Zero Confiança no Cliente:**
   - Usuários do tipo Produtor **nunca** informam um `producer_id` confiável na requisição HTTP; a API injeta automaticamente o `producer_id` obtido a partir da sessão validada.
3. **Escopo Global Reservado:**
   - Apenas usuários com perfil `admin-master` ou `admin` têm autorização para consultar dados globais ou alternar entre produtoras (`producer_id = null` ou `producer_id = target_id`).
4. **Isolamento de Dados Multi-Tenant Universal:**
   - Toda entidade crítica carrega o identificador `producer_id` (Eventos, Lotes, Vendas, Participantes, Ingressos, Terminais POS, Transações Financeiras, Contas Bancárias, Repasses, Antecipações e Borderôs).
5. **Trilha de Auditoria Obrigatória:**
   - Toda ação sensível (solicitação de repasse, fechamento de caixa, criação/alteração de usuário, alteração de lotes e logins) gera registro imutável na tabela `audit_logs`.

---

## 🗄️ Esquema Relacional de Dados (SQL DDL)

```sql
-- 1. Tabela de Produtoras (Tenants)
CREATE TABLE producers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  legal_name VARCHAR(200) NOT NULL,
  document VARCHAR(20) NOT NULL UNIQUE, -- CNPJ
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Usuários & RBAC
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  producer_id BIGINT NULL, -- NULL para Admin Master global
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM(
    'admin-master',
    'admin',
    'producer-admin',
    'producer-finance',
    'producer-operation',
    'producer-marketing',
    'viewer'
  ) NOT NULL DEFAULT 'producer-operation',
  status ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE RESTRICT
);

-- 3. Matriz de Permissões Granulares por Usuário
CREATE TABLE user_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  resource VARCHAR(50) NOT NULL, -- 'events', 'finance', 'participants', 'pos', 'admin'
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Eventos Multi-Tenant
CREATE TABLE events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  producer_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  code VARCHAR(50) NOT NULL,
  category VARCHAR(80) NOT NULL,
  date_start DATETIME NOT NULL,
  venue_name VARCHAR(150) NOT NULL,
  venue_city VARCHAR(100) NOT NULL,
  status ENUM('active', 'draft', 'inactive', 'cancelled') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE RESTRICT
);

-- 5. Lotes de Ingressos
CREATE TABLE ticket_batches (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  producer_id BIGINT NOT NULL,
  batch_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_quantity INT NOT NULL,
  sold_quantity INT NOT NULL DEFAULT 0,
  status ENUM('active', 'soldout', 'inactive') NOT NULL DEFAULT 'active',
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE RESTRICT
);

-- 6. Transações Financeiras & Vendas
CREATE TABLE financial_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  producer_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  order_id VARCHAR(50) NOT NULL,
  transaction_type ENUM('venda', 'repasse', 'taxa', 'estorno') NOT NULL,
  payment_method ENUM('pix', 'credito', 'debito', 'boleto', 'transferencia') NOT NULL,
  gross_value DECIMAL(10, 2) NOT NULL,
  fee_value DECIMAL(10, 2) NOT NULL,
  net_value DECIMAL(10, 2) NOT NULL,
  status ENUM('pago', 'pendente', 'processando', 'estornado') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE RESTRICT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT
);

-- 7. Solicitações de Repasse
CREATE TABLE payout_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  producer_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  gross_amount DECIMAL(10, 2) NOT NULL,
  fee_amount DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  agency VARCHAR(20) NOT NULL,
  account_number VARCHAR(30) NOT NULL,
  pix_key VARCHAR(150) NOT NULL,
  status ENUM('agendado', 'processando', 'pago', 'cancelado') NOT NULL DEFAULT 'agendado',
  scheduled_for DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE RESTRICT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT
);

-- 8. Tabela de Logs de Auditoria Imutáveis
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  producer_id BIGINT NULL,
  action VARCHAR(150) NOT NULL,
  module VARCHAR(60) NOT NULL, -- 'Eventos', 'Financeiro', 'Participantes', 'POS', 'Segurança', 'Administração'
  details TEXT NULL,
  ip_address VARCHAR(45) NOT NULL,
  status ENUM('Concluído', 'Falha', 'Alerta') NOT NULL DEFAULT 'Concluído',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (producer_id) REFERENCES producers(id) ON DELETE RESTRICT
);
```

---

## 🔎 Exemplos de Consultas Seguras com Multi-Tenant

### 1. Consulta por Produtor Autenticado:
```sql
SELECT e.*, 
       COALESCE(SUM(b.sold_quantity), 0) AS total_sold,
       COALESCE(SUM(b.sold_quantity * b.price), 0) AS total_revenue
FROM events e
LEFT JOIN ticket_batches b ON b.event_id = e.id
WHERE e.producer_id = :authenticated_user_producer_id
GROUP BY e.id;
```

### 2. Consulta por Admin Master (Visão Global):
```sql
SELECT e.*, p.name AS producer_name
FROM events e
INNER JOIN producers p ON p.id = e.producer_id
WHERE (:selected_producer_id IS NULL OR e.producer_id = :selected_producer_id);
```

---

## 🚀 Próximos Passos (Fase 8)
- Administração completa: Gestão de Produtoras, Perfis & Permissões, Matriz de Acessos e Configurações de Segurança.
