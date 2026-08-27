# Fase 16.1 — Multi-Pixel, Multi-Token API & Sistema de Herança por Integração

## 📌 Visão Geral

A **Fase 16.1** reformula a arquitetura de **Pixel, Analytics & Conversions API (CAPI)** do DiskIngressos para suportar múltiplos Pixels, múltiplos Tokens de API, isolamento de credenciais e herança granular por evento.

---

## 🗄️ 1. Modelagem do Banco de Dados (Prisma SQLite)

```prisma
model TrackingIntegration {
  id                  Int                        @id @default(autoincrement())
  name                String
  provider            String                     @default("meta") // meta, google, tiktok, gtm, custom
  type                String                     @default("meta-capi") // meta-capi, ga4, gtm, tiktok
  pixelId             String
  encryptedApiToken   String?
  testEventCode       String?
  status              String                     @default("ativo") // ativo, pausado, atencao, erro
  inheritanceMode     String                     @default("all_events") // all_events, selected_events, current_event
  lastEventName       String?
  lastFiredAt         DateTime?
  lastResponseStatus  String?                    @default("200 OK")
  lastErrorMessage    String?
  eventsSentToday     Int                        @default(0)
  producerId          Int
  producer            Producer                   @relation(fields: [producerId], references: [id])
  events              TrackingIntegrationEvent[]
  eventConfigs        TrackingEventConfig[]
  logs                TrackingEventLog[]
  createdAt           DateTime                   @default(now())
  updatedAt           DateTime                   @updatedAt

  @@index([producerId, status])
  @@index([producerId, provider])
}

model TrackingIntegrationEvent {
  id            Int                 @id @default(autoincrement())
  integrationId Int
  eventId       Int
  integration   TrackingIntegration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  event         Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([integrationId, eventId])
  @@index([eventId])
}

model TrackingEventConfig {
  id            Int                 @id @default(autoincrement())
  integrationId Int
  eventName     String              // PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, Lead, CompleteRegistration
  enabled       Boolean             @default(true)
  integration   TrackingIntegration @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@unique([integrationId, eventName])
}

model TrackingEventLog {
  id            Int                 @id @default(autoincrement())
  integrationId Int
  eventId       Int?
  eventName     String
  status        String              @default("success") // success, error
  responseCode  Int                 @default(200)
  responseBody  String?
  payloadSample String?
  createdAt     DateTime            @default(now())
  integration   TrackingIntegration @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@index([integrationId, createdAt])
}
```

---

## 🌐 2. Endpoints da API (`/api/tracking`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/tracking/summary` | Resumo de métricas (total, ativos, disparos hoje, qualidade de match) |
| `GET` | `/api/tracking/integrations` | Listagem das integrações da produtora com tokens mascarados (`••••••••4F8A`) |
| `GET` | `/api/tracking/integrations/:id` | Detalhes da integração com eventos vinculados e configs |
| `POST` | `/api/tracking/integrations` | Cadastro de nova integração com Pixel ID e Token CAPI |
| `PUT` | `/api/tracking/integrations/:id` | Edição de nome, tipo, Pixel ID, substituição de token e escopo |
| `PATCH` | `/api/tracking/integrations/:id/toggle` | Alterna status entre **Ativo** e **Pausado** |
| `POST` | `/api/tracking/integrations/:id/duplicate` | Duplica uma integração para rápida reutilização |
| `DELETE` | `/api/tracking/integrations/:id` | Exclusão segura com logs de auditoria |
| `POST` | `/api/tracking/integrations/:id/test` | Dispara evento de teste CAPI Purchase/PageView e salva log |
| `GET` | `/api/tracking/integrations/:id/logs` | Histórico dos últimos 50 disparos com payload e retorno HTTP |

---

## 🔒 3. Segurança & Proteção de Tokens

- **Tokens Mascarados:** Tokens de API nunca são expostos em texto puro no frontend (`••••••••••••••••4F8A`).
- **Substituição Segura:** Ações de edição permitem manter o token existente ou "Substituir token".
- **Multi-Tenant:** Acesso restrito e validado pelo `producerId` do usuário autenticado.
