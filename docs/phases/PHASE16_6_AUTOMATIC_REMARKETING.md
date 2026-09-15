# Fase 16.6 — Remarketing Automático e Receita Recuperada

Esta fase fecha o ciclo iniciado na Central UTM: **origem UTM → jornada → abandono → recuperação → venda → receita atribuída**.

## Fluxo operacional

1. O visitante chega por um `TrackingLink` e recebe uma `TrackingAttribution`.
2. A jornada registra carrinho e checkout.
3. O sweep de abandono cria `RecoveryOpportunity` já vinculada a `trackingLinkId` e `attributionId`.
4. A operação de recuperação seleciona um fluxo ativo (`AutomationFlow`) e um template de remarketing.
5. O sistema valida contato e opt-out por canal.
6. A mensagem entra em `RecoveryAttempt` e também no histórico de `AutomationExecution`.
7. A fila pode ser processada em lote pelo endpoint administrativo.
8. Quando a venda é recuperada, a oportunidade, o fluxo, a atribuição e o link UTM recebem a atualização de conversão/receita.

## Estados da oportunidade

- `aberto`: detectada, ainda sem contato.
- `em_recuperacao`: ao menos uma tentativa foi agendada/enviada.
- `recuperado`: venda recuperada e receita atribuída.

## APIs

- `POST /api/automation/recoveries/:id/start`
- `POST /api/automation/recoveries/process-queue`
- `PATCH /api/automation/recoveries/:id/recover`
- `GET /api/automation/recovery-dashboard`
- `GET /api/automation/recoveries`

## LGPD / consentimento

Antes de colocar uma comunicação na fila, o backend consulta `ContactConsent`. Um contato com `optout` para o canal não é utilizado. Para produção, recomenda-se política explícita de consentimento por finalidade, retenção, trilha de auditoria e integração com a central de preferências.

## Produção

A fila desta fase é uma implementação funcional local. Em produção, substitua o processamento manual por worker/queue (por exemplo Redis + BullMQ/SQS), conecte os providers reais de WhatsApp/e-mail e use webhooks de envio, entrega, leitura, erro e opt-out.
