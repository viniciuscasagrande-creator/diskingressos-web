# Fase 24.6 — Recebíveis e Agenda Financeira

## Regra principal
O Dashboard Financeiro aprovado continua preservado. Esta fase evolui somente a experiência operacional de **Recebíveis**, conectada ao HUB Financeiro.

## Implementado

### 1. Agenda Financeira de Recebíveis
A tela `FinanceReceivablesPage.tsx` agora exibe uma agenda de liquidação por janelas:

- Hoje (D+0)
- Próximos 7 dias (D+7)
- Próximos 15 dias (D+15)
- Próximos 30 dias (D+30)
- 31 a 60 dias (D+60)

Cada janela apresenta valor previsto, quantidade de liquidações e status operacional.

### 2. Projeção de liquidação
Foi incluída uma leitura visual da distribuição dos recebíveis por período para facilitar decisões de caixa e antecipação.

### 3. Resumo de caixa projetado
A Central calcula:

- bruto previsto para 60 dias;
- taxas estimadas;
- valor líquido projetado;
- aviso de variação por estornos, chargebacks e regras da adquirente.

### 4. Integração com Fluxo de Caixa
A Agenda Financeira possui acesso direto ao módulo de Fluxo de Caixa sem criar novo item na sidebar principal.

### 5. Recebíveis detalhados preservados
Foram mantidos:

- busca;
- filtros por status;
- filtros por método de pagamento;
- tabela detalhada;
- exportação CSV;
- simulador de antecipação;
- drill-down iniciado no Dashboard Financeiro.

### 6. Proteção de release
O marcador financeiro ativo passa a ser:

`24.6-receivables-agenda-2026-09-02`

O script `verify:finance-release` exige os marcadores da Fase 24.6 no `src` e no `dist`.

## Não alterado

- Dashboard Financeiro principal;
- cards/KPIs/gráficos do Dashboard;
- menu Financeiro de 5 pilares;
- Central de Saldo e Extrato da Fase 24.5;
- regras de Split, Spread, Pagamentos ou Relatórios.

## Validação

```bash
npm install
npm run build:vercel
```

O release só deve ser considerado válido quando o verificador informar que as **Fases 24.1 a 24.6** estão presentes no build.
