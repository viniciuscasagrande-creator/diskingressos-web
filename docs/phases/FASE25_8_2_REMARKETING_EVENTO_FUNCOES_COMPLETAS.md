# Fase 25.8.2 — Remarketing do Evento com Funções Completas

## Objetivo
Transformar a tela `Remarketing do Evento` que antes funcionava apenas como um hub visual em uma central operacional real, preservando o contexto do evento e o isolamento por produtora.

## Correções aplicadas
- KPIs carregados pela API de recuperação para `producerId + eventId`.
- Botão **Atualizar** recarrega resumo e dashboard.
- Abas funcionais: Visão Geral, Carrinhos Abandonados, Pagamento Pendente, Fluxos, WhatsApp e E-mail.
- Cards do hub agora abrem módulos reais, em vez de apenas exibir notificações.
- Campanhas abrem `event-meta-ads` mantendo o evento ativo.
- `RecoveryCenterPage` ganhou `fixedEventId` e `embedded` para operar dentro do contexto do evento.
- Quando `fixedEventId` existe, o seletor vira um selo **ESCOPO FIXO** e o usuário não pode trocar para outro evento.
- Dados mock são desabilitados em contexto fixo de evento; falha de API resulta em estado vazio, nunca em dados de outra produtora.
- A fila de recuperação é processada com o `eventId` fixo.

## Segurança multi-tenant
Toda consulta usa o `producerId` do evento e o `eventId` selecionado. O backend já valida ownership com `ownsProducer`, impedindo acesso por alteração manual de query/body.

## Arquivos alterados
- `src/pages/EventContextPage.tsx`
- `src/pages/RecoveryCenterPage.tsx`
- `src/styles.css`

## Release
`25.8.2-event-remarketing-functional-2026-09-02`
