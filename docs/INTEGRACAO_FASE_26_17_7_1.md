# Integração Técnica — Fase 26.17.7.1: Painel Comercial Moderno PT-BR

## Arquitetura de Componentes

```text
src/
├── pages/
│   └── EventCommercialDashboardPage.tsx       # Página oficial do Painel Comercial
├── components/
│   ├── EventCommercialDashboard.tsx           # Wrapper modular de exportação
│   ├── EventCommercialDashboard.css           # Estilos e temas do painel
│   ├── EvolutionSalesChart.tsx                # Gráfico dual-axis de evolução (receita x ingressos)
│   ├── PaymentDonutChart.tsx                  # Donut chart SVG com legenda interativa
│   ├── OccupancyGauge.tsx                     # Gauge semicircular de ocupação
│   ├── RhythmSalesChart.tsx                   # Ritmo e projeção de vendas
│   ├── WeekSalesBars.tsx                      # Distribuição por dia da semana
│   └── event-commercial/
│       ├── EventCommercialCharts.tsx          # Coleção SVG nativa
│       └── EventComparatorModal.tsx           # Comparador comercial lado a lado
├── services/
│   └── eventCommercialApi.ts                  # Cliente de requisições à API
├── hooks/
│   └── useCommercialDashboard.ts              # Hook de consumo de dados e filtros
└── types/
    └── event-commercial.ts                    # Interfaces de dados e contratos TypeScript
```

## Contrato de Endpoint

* **Rota**: `GET /api/events/:eventId/commercial-dashboard`
* **Autenticação**: Bearer JWT (`req.auth`)
* **Isolamento de Tenant**: Restrito estritamente a `event.producerId === req.auth.producerId` (exceto `globalAdmin`).
* **Parâmetros Suportados**:
  * `period`: `today` | `7d` | `30d` | `all`
  * `paymentMethod`: `PIX` | `CREDITO` | `DEBITO` | `DINHEIRO` | `OUTROS`

### Estrutura do Payload JSON
```json
{
  "release": "26.17.7.1-painel-comercial-moderno-ptbr-2026-09-04",
  "evento": { "id": 4112, "title": "Arena Gamer Curitiba", "status": "ativo" },
  "indicadores": {
    "grossRevenueCents": 675000,
    "grossRevenueFormatted": "R$ 6.750,00",
    "ticketsSold": 108,
    "availableTickets": 3882,
    "courtesyTickets": 10,
    "occupancyPercent": 2.9
  },
  "ritmo": {
    "averageTicketCents": 6250,
    "projectedFinalCents": 1215286,
    "realizedHistory": [],
    "projectedHistory": []
  },
  "evolucao": [],
  "pagamentos": [],
  "ocupacao": {},
  "tiposIngresso": [],
  "transacoes": []
}
```

## Compatibilidade com Módulos Protegidos

* **Central de Eventos**: Mantém filtros Ativos/Inativos/Todos, modo Horizontal/Vertical, 2-6 colunas e motor de comparação.
* **Estornos**: Mantém tela oficial independente `/app/finance-refunds`.
* **Investigação 360° do Pedido**: Drill-down nativo ao clicar em qualquer transação recente.
* **Event OS (Cockpit 360)**: Botão de destaque azul `[Acessar Event OS →]` conecta a gestão comercial ao centro de operações ao vivo.
