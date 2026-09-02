# Fase 25.7 — Integrações de Marketing 360°

Release: `25.7-marketing-integrations-360-2026-09-02`

## Objetivo
Transformar **Marketing > Pixel & Analytics** em uma central multicanal de integrações, mantendo o modelo multi-tenant e o escopo por produtora/evento.

## Provedores incluídos
- Meta Ads / Meta Pixel + Conversions API
- TikTok Ads / TikTok Pixel + Events API
- Google Ads + Enhanced Conversions
- Google Analytics 4 + Measurement Protocol
- Google Tag Manager web/server-side
- LinkedIn Insight Tag / Conversions
- Pinterest Tag / Conversions API
- Snapchat Pixel / Conversions API
- Microsoft Advertising / UET
- Microsoft Clarity

## Implementação
- Catálogo oficial em `src/domain/marketing/integrations.ts`.
- `TrackingIntegrationsManager.tsx` convertido para multi-provider.
- Configuração por produtora ou por evento.
- Credencial/token criptografado no backend pelo mecanismo já existente AES-256-GCM.
- Eventos/conversões configuráveis por provedor.
- Status, teste local, logs e contadores preservados.
- TikTok Ads adicionado ao menu lateral.
- `Pixel & Analytics` evoluído visualmente para `Pixels & Integrações 360°`.
- Backend de tracking ampliado para Meta CAPI, TikTok, LinkedIn, Pinterest, Snapchat, Microsoft Ads e Clarity.

## Segurança
Tokens nunca são retornados em texto aberto. O frontend recebe apenas a máscara da credencial. O mecanismo existente de tenant/producer ownership e auditoria foi preservado.

## Importante
A fase entrega a infraestrutura/configuração e os contratos internos para os conectores. Chamadas externas reais de OAuth/Marketing APIs dependem das credenciais e aplicações aprovadas de cada provedor; nenhuma chave foi embutida no frontend.

## Eventos de referência
A matriz contempla `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `AddPaymentInfo`, `Purchase`, `Lead`, `CompleteRegistration` e equivalentes específicos de cada plataforma.
