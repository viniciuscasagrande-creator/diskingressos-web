# DiskIngressos — Fase 16.1 — Multi-Pixel & Multi-Token API

## Objetivo

Permitir que cada produtora possua múltiplas integrações Meta Pixel + Conversion API, cada uma com Pixel ID, Token API, eventos de conversão habilitados e vínculo com todos ou apenas eventos selecionados.

## Funcionalidades implementadas

- Botão **Adicionar Pixel / Token** no módulo Pixel & Analytics.
- Múltiplas integrações por produtora.
- Nome amigável para cada integração.
- Pixel ID independente por integração.
- Token API independente por integração.
- Token armazenado criptografado no backend com AES-256-GCM.
- Interface retorna apenas token mascarado e os últimos 4 caracteres.
- Substituição do token sem revelar o valor anterior.
- Aplicação em todos os eventos ou somente eventos selecionados.
- No contexto de um evento, a tela lista somente integrações aplicáveis ao evento.
- Seleção dos eventos Meta: PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, Lead e CompleteRegistration.
- Ativar/inativar integração.
- Teste de configuração e registro em log.
- Exclusão com auditoria.
- Isolamento multi-produtor aplicado no backend.

## Novas entidades

- `TrackingIntegration`
- `TrackingIntegrationEvent`
- `TrackingDeliveryLog`

## Endpoints

- `GET /api/marketing/integrations`
- `POST /api/marketing/integrations`
- `PATCH /api/marketing/integrations/:id`
- `DELETE /api/marketing/integrations/:id`
- `POST /api/marketing/integrations/:id/test`
- `GET /api/marketing/integrations/:id/logs`

## Segurança dos Tokens

O token nunca é retornado pela API. O backend salva `ciphertext`, `iv` e `authTag` usando AES-256-GCM. Defina `TRACKING_TOKEN_SECRET` no `.env` com uma chave longa e exclusiva para produção.

A interface apresenta apenas algo semelhante a:

`••••••••••••4F8A`

## Regra de acesso

Usuários de uma produtora só conseguem consultar ou editar integrações cujo `producerId` corresponde ao tenant autenticado. Admin/Admin Master mantêm as regras globais já existentes.

## Teste de conexão

Nesta fase, **Testar conexão** valida localmente se Pixel, token criptografado e status estão prontos e grava o resultado no log. A chamada real à Graph API/Conversions API da Meta deve ser habilitada apenas quando as credenciais de produção e o endpoint externo estiverem configurados.
