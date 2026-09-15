# Fase 25.3 — Conta Gráfica e Saldo do Produtor

Release: `25.3-producer-ledger-account-2026-09-02`

## Objetivo
Transformar os lançamentos do Ledger em uma visão financeira clara para empresa e produtor, mantendo a DiskIngressos com controle administrativo e o produtor com leitura transparente do próprio universo financeiro.

## Princípio
O saldo exibido não é um número editável. Ele é derivado dos lançamentos do Ledger e separado em buckets financeiros: disponível, a liquidar, reserva, comprometido e já repassado.

## Elementos gráficos adicionados
- Donut de composição da conta financeira.
- Linha de evolução do saldo disponível.
- Waterfall visual da formação do saldo: bruto → taxas → recebíveis → reservas → disponível.
- Score gráfico de saúde financeira.
- Barras de liquidez, cobertura de reserva, regularidade de repasses e risco de estorno.
- Buckets visuais por janela de liquidação D+0, D+7, D+15 e D+30+.
- Tabela consolidada por evento/produtor com destaque visual de saldo disponível.

## Governança
- A empresa enxerga todos os produtores e eventos conforme permissão global.
- O produtor enxerga apenas seu tenant e eventos.
- Nenhum usuário altera saldo diretamente.
- Ajustes utilizam lançamentos compensatórios/reversões auditáveis.
- Solicitação de repasse continua integrada à Fase 24.7.

## Integração
A tela foi adicionada ao Dashboard Financeiro como `Conta do Produtor`, sem substituir ou redesenhar o Dashboard já homologado.

## Próxima etapa
Fase 25.4 — Recebíveis, Liquidação e Agenda conectados ao Ledger e à conta gráfica.
