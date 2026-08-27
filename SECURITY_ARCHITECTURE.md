# Segurança multi-produtor — referência para backend

A Fase 7 demonstra o comportamento no frontend. Em produção, o isolamento deve ser obrigatório no backend.

## Regras

1. A sessão autenticada define `user_id`, `role` e `producer_id`.
2. Usuários de produtor nunca enviam um `producer_id` confiável para decidir o escopo; a API usa o valor da sessão.
3. Admin Master/Admin podem informar um produtor-alvo apenas em endpoints autorizados e o backend valida o perfil.
4. Eventos, vendas, participantes, lançamentos financeiros, contas bancárias, repasses, lotes e terminais carregam `producer_id`.
5. Toda ação sensível gera `audit_log`.

## Exemplo de tabelas

```sql
CREATE TABLE producers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  document VARCHAR(20),
  status ENUM('active','inactive') NOT NULL DEFAULT 'active'
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  producer_id BIGINT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  FOREIGN KEY (producer_id) REFERENCES producers(id)
);

CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  producer_id BIGINT NULL,
  action VARCHAR(120) NOT NULL,
  resource_type VARCHAR(80),
  resource_id VARCHAR(80),
  ip_address VARCHAR(64),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (producer_id) REFERENCES producers(id)
);
```

## Exemplo de consulta segura

```sql
SELECT * FROM events
WHERE producer_id = :producer_id_from_authenticated_session;
```

Nunca use o `producer_id` recebido do navegador sem validação de autorização.
