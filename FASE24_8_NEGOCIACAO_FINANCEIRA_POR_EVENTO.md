# Fase 24.8 — Negociação Financeira por Evento

## Regra principal
O Dashboard Financeiro homologado permanece 100% preservado. Esta fase migra para o SafeSaff a lógica crítica da tela de **Negociações Financeiro** atualmente utilizada em produção, modernizando a experiência sem eliminar a referência funcional existente.

## Fluxo de acesso
- Financeiro → Dashboard Financeiro → Negociações Financeiras;
- contexto do evento selecionado é encaminhado para a negociação;
- o Dashboard do Evento também ganhou o atalho **Negociação Financeira**;
- a tela trabalha por evento e não como configuração financeira global.

## Implementado

### 1. Central de Negociação Econômica do Evento
Mantidas as cinco áreas da operação atual:
- Receita;
- Despesas;
- Patrocínio;
- Advanced;
- Informações Financeiras / DRE.

### 2. Receita por forma de pagamento
A grade de Receita preserva os campos críticos da produção:
- Forma de pagamento;
- Taxa de pagamento %;
- responsável pela taxa de serviço: Inclusa / Produtor;
- taxa de antecipação a.m. %;
- responsável pela antecipação: Inclusa / Produtor;
- taxa de parcelamento %;
- total das taxas;
- quantidade de ingressos;
- receita bruta;
- taxa de serviço;
- receita líquida.

Modalidades iniciais:
- Dinheiro;
- PIX;
- Débito;
- Crédito à vista;
- Parcelado 2x a 6x;
- Parcelado 7x a 12x;
- Cortesia.

### 3. Recalculo em tempo real
Alterações nas taxas recalculam imediatamente:
- total de taxas financeiras;
- impacto da antecipação;
- responsabilidade pela taxa de serviço;
- receita líquida prevista.

Isso permite simular a condição antes de salvar.

### 4. KPIs econômicos da negociação
No topo da aba Receita são apresentados:
- ingressos pagos;
- receita bruta;
- taxa de serviço;
- taxas financeiras;
- receita líquida.

### 5. Contexto real do evento
`FinanceNegotiationsPage` agora recebe os eventos reais do SafeSaff, `eventId` e `producerId`. Quando a tela é aberta a partir de um evento, o contexto é preservado.

### 6. Rastreabilidade / auditoria
O salvamento exige/aceita justificativa comercial e registra:
- data/hora;
- usuário responsável;
- motivo;
- resumo econômico da alteração.

A interface deixa explícito que a edição comercial é protegida e auditável.

### 7. Demais abas preservadas
Continuam disponíveis:
- despesas e fornecedores;
- patrocínios;
- parcelas Advanced;
- divisão tarifária por setores;
- visão econômica / DRE do evento.

## Arquivos principais alterados
- `src/pages/finance/FinanceNegotiationsPage.tsx`
- `src/pages/finance/advanced/AdvancedTaxesRouter.tsx`
- `src/pages/EventContextPage.tsx`
- `scripts/verify-finance-release.mjs`

## Proteção de release
Marcador da fase:

`24.8-event-financial-negotiation-2026-09-02`

O build precisa conter:
- `Central de negociação econômica por evento`;
- `Histórico de alterações`;
- `SALVAR NEGOCIAÇÃO`;
- `Edição protegida`.

## Não alterado
- Dashboard Financeiro principal;
- KPIs/cards/gráficos do Dashboard;
- menu Financeiro de cinco pilares;
- Fases 24.1 a 24.7 já homologadas.

## Validação
```bash
npm install
npm run build:vercel
```

A homologação somente deve ocorrer quando o verificador retornar:

`Fases 24.1 a 24.8 confirmadas no build.`
