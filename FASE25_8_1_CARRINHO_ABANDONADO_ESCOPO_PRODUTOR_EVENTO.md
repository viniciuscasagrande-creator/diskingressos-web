# Fase 25.8.1 — Carrinho Abandonado com Escopo por Produtora e Evento

Release: `25.8.1-abandoned-cart-tenant-event-scope-2026-09-02`

## Regra de negócio

O módulo de Carrinho Abandonado é multi-tenant e não pode exibir eventos ou oportunidades de outra produtora. O produtor autenticado só enxerga eventos pertencentes ao seu `producerId`.

Além do isolamento por produtora, a tela de carrinhos abandonados exige seleção explícita de um evento antes de carregar clientes, valores, KPIs ou ações de recuperação. Não existe opção "Todos os eventos" nesse modo.

## Regras implementadas

1. Novo endpoint `GET /api/automation/recovery-events` retorna somente eventos dentro do tenant autenticado e somente eventos que possuem oportunidades do tipo `carrinho`.
2. Produtores comuns têm o `producerId` derivado do token/sessão no backend. Parâmetros enviados pelo frontend não conseguem ampliar o escopo.
3. A tela Carrinhos Abandonados inicia sem dados e solicita: `Selecione um evento com abandono`.
4. Após selecionar o evento, `recoveries`, `summary` e `recovery-dashboard` são consultados com `eventId`.
5. O processamento da fila recebe `eventId` e o backend valida se o evento pertence ao escopo da produtora antes de processar.
6. Dados mock foram desativados no modo `carts`, evitando qualquer possibilidade de exibir nomes/eventos fictícios fora do tenant quando a API falhar.
7. Outros modos de recuperação continuam compatíveis com o comportamento anterior.

## Segurança

A proteção principal está no backend. O filtro visual no React é apenas uma segunda camada. Mesmo alterando manualmente a URL, query string ou DevTools, um produtor não recebe eventos de outra produtora.

## Fluxo

```text
Produtor autenticado
  -> producerId do token
  -> eventos do próprio producerId com abandono
  -> produtor seleciona 1 evento
  -> API valida tenant + eventId
  -> carrega somente carrinhos daquele evento
  -> recuperação/WhatsApp/e-mail/fila somente naquele escopo
```
