# DiskIngressos — Fase 10

## Núcleo operacional persistente

A Fase 10 amplia o backend multi-produtor da Fase 9 para os dados operacionais que antes existiam apenas como demonstração no React.

### Novas entidades

- `Lot`: lotes e setores de cada evento.
- `Order`: vendas/pedidos online ou presenciais.
- `Ticket`: ingressos emitidos por venda e lote.
- `Participant`: participantes vinculados a evento/produtora.
- `CheckIn`: registros de acesso por QR, facial ou operação manual.
- `PosTerminal`: terminais físicos vinculados à produtora e, opcionalmente, evento.
- `PosTransaction`: transações realizadas em POS/PDV.
- `FinancialTransaction`: razão financeiro de entradas e saídas.
- `Payout`: solicitações de repasse.

Todas as entidades operacionais relevantes carregam `producerId`. O backend ignora tentativas de um usuário produtor de ampliar seu escopo para outra produtora.

## Rotas novas

| Método | Rota | Função |
| --- | --- | --- |
| GET/POST | `/api/lots` | listar/criar lotes |
| PUT | `/api/lots/:id` | alterar lote dentro do escopo |
| GET/POST | `/api/orders` | listar/criar vendas |
| PATCH | `/api/orders/:id/status` | alterar status da venda |
| GET | `/api/tickets` | listar ingressos |
| PATCH | `/api/tickets/:id/status` | alterar status do ingresso |
| GET/POST | `/api/participants` | participantes |
| PUT | `/api/participants/:id` | alterar participante |
| GET/POST | `/api/checkins` | check-ins e validação de ingresso reutilizado |
| GET/POST | `/api/pos/terminals` | terminais POS |
| PATCH | `/api/pos/terminals/:id/status` | status/sincronização do terminal |
| GET/POST | `/api/pos/transactions` | transações presenciais |
| GET | `/api/finance/transactions` | extrato persistente |
| GET | `/api/finance/balance` | saldo calculado no backend |
| GET/POST | `/api/finance/payouts` | consultar/solicitar repasses |
| GET | `/api/operations/summary` | resumo operacional seguro |

## Regra de criação de venda

Ao criar uma venda por `/api/orders`, a API executa uma transação de banco que:

1. cria o pedido;
2. emite os ingressos;
3. incrementa o lote quando informado;
4. atualiza os indicadores básicos do evento;
5. registra a entrada financeira líquida.

Se qualquer etapa falhar, a transação inteira é revertida.

## Segurança multi-produtor

Para perfis de produtor, o `producerId` efetivo vem do JWT autenticado. Um `producerId` diferente enviado por query/body não concede acesso.

`Admin Master` e `Admin` podem trabalhar com visão global ou passar `producerId` para consultar uma produtora específica.

## Interface

Foi adicionada a opção **Núcleo Operacional** no módulo Eventos. Ela consulta `/api/operations/summary` e apresenta contadores reais de eventos, lotes, vendas, ingressos, participantes, check-ins, terminais, repasses e saldo operacional.
