# Fase 25.4 — Recebíveis, Liquidação e Agenda Financeira

Release: `25.4-receivables-settlement-agenda-2026-09-02`

## Objetivo
Transformar Recebíveis em um cockpit financeiro visual integrado ao Ledger, contratos financeiros, adquirentes, conciliação e saldo do produtor.

## Interface
- KPIs de total a receber, D+30, D+60 e antecipado.
- Curva gráfica de liquidação.
- Donut de mix de meios de pagamento.
- Saúde de liquidação com SLA e divergências.
- Agenda D+0, D+7, D+15, D+30 e D+60 interativa.
- Formação do líquido previsto.
- Tabela empresarial com tipografia tabular e números à direita.
- Simulador de antecipação preservado.
- Componentes do Design System Limitless 25.3.4.

## Backend / dados
A migration `025_04_receivables_settlement_agenda.sql` cria uma agenda segregada por produtor/evento e vínculo com pedido, transação e Ledger. O saldo continua derivado da escrituração; a agenda não permite edição manual de saldo.

## Governança
DiskIngressos administra regras e conciliações. O produtor recebe leitura dos próprios recebíveis e ações explicitamente autorizadas, como solicitação de antecipação quando habilitada.

