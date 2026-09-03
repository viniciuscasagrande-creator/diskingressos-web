# Fase 25.8.3 — Motor Automático de Recuperação de Vendas

Release: `25.8.3-auto-recovery-engine-2026-09-03`

## Objetivo
Automatizar a recuperação de carrinhos e pagamentos pendentes sem quebrar o isolamento por produtora/evento implantado nas fases 25.8.1 e 25.8.2.

## Régua padrão
1. 30 min — WhatsApp
2. 2 h — E-mail
3. 24 h — WhatsApp
4. 48 h — E-mail

A régua usa o fluxo ativo do evento/produtora, consentimento do canal e templates de remarketing. Em fluxo multicanal alterna WhatsApp/E-mail. Em fluxo de canal único respeita o canal configurado.

## Regras críticas
- `producerId` vem do contexto autenticado; `eventId` é validado contra a produtora.
- Primeiro disparo é agendado a partir da última atividade + delay do fluxo, nunca imediatamente por simples processamento da fila.
- Compra recuperada encerra a régua porque apenas `em_recuperacao` pode receber nova tentativa.
- Máximo padrão de 4 tentativas.
- Sem telefone/e-mail ou sem consentimento: canal não é disparado.
- Todos os disparos permanecem registrados em `RecoveryAttempt`.

## Operação
`POST /api/automation/recoveries/process-queue` funciona como worker idempotente por estado e pode ser chamado por scheduler/cron autorizado. Ele matricula novas oportunidades, agenda retries vencidos e processa mensagens já vencidas.

## Próximo passo de produção
Conectar o worker aos provedores reais de WhatsApp/E-mail e executar o endpoint por scheduler seguro. O projeto não contém credenciais externas fictícias.
