# Fase 28.15.6 — Breadcrumbs, Permissões e Contexto Produtor/Evento

## Objetivo
Implantar uma camada única de breadcrumbs, permissões e contexto Produtor/Evento sobre as fases 28.15.1 a 28.15.5, sem recriar telas nem alterar regras de negócio homologadas.

## Princípio central
O PDT deve saber sempre:

Usuário → Perfil → Permissões → Produtor → Evento → Módulo → Rota → Ação

Regra crítica: usuário PRODUTOR nunca pode consultar ou manipular dados de outro produtor.

## 1. AppContext
Criar `src/context/app-context.js` com:
- user
- role
- producerId / producerName
- eventId / eventName
- setUser()
- setProducer()
- setEvent()
- clearEvent()

Ao trocar produtor, limpar obrigatoriamente o evento atual.

## 2. Contexto por rota
Cada rota deve declarar seu requisito:

```javascript
{
  path: '/marketing/pixels',
  module: 'marketing',
  context: { producer: true, event: true }
}
```

Exemplos:
- Financeiro consolidado: produtor obrigatório, evento opcional.
- Pixels por Evento: produtor e evento obrigatórios.
- DRE por Evento: produtor e evento.
- Painel Geral: pode não exigir evento.

## 3. ContextGuard
Criar `src/security/context-guard.js`.

O guard deve impedir abertura da rota se faltar produtor/evento exigido.

Estados amigáveis em pt-BR:
- `Selecione um produtor para continuar`
- `Selecione um evento para continuar`

Nunca carregar dados aleatórios como fallback.

## 4. PermissionGuard
Criar `src/security/permission-guard.js`.

Ocultar menu não é segurança. Toda rota protegida também deve ser validada pelo Router.

Modelo:
```javascript
permissions: ['financeiro.transferencias.criar']
```

Permissões granulares recomendadas:
- financeiro.visualizar
- financeiro.saldos.visualizar
- financeiro.transferencias.criar
- financeiro.transferencias.aprovar
- financeiro.estornos.executar
- contabilidade.visualizar
- contabilidade.lancamentos.criar
- marketing.visualizar
- marketing.campanhas.criar
- marketing.pixels.gerenciar
- sac.visualizar
- sac.pedidos.consultar

Usar os nomes reais existentes no projeto sempre que já houver modelo de permissões.

## 5. Perfis
Preparar a arquitetura para perfis existentes/reais. Exemplos conceituais:
- ADMINISTRADOR
- GESTOR
- FINANCEIRO
- CONTABILIDADE
- MARKETING
- SAC
- PRODUTOR_ADMIN
- PRODUTOR_OPERADOR
- LEITURA

Não criar perfis novos em produção sem mapear primeiro a estrutura atual.

## 6. Context Selector
No topo da aplicação, quando aplicável:

Admin:
Produtor [▼] → Evento [▼]

Produtor:
Produtor fixo → Evento [▼]

Produtor nunca recebe seletor de outro produtor.

## 7. Persistência
Pode persistir contexto válido em `sessionStorage`, mas isto não substitui validação de permissão/backend.

F5 pode restaurar:
- produtor permitido;
- evento permitido;
- rota atual.

Contexto inválido deve ser descartado.

## 8. BreadcrumbManager
Criar `src/navigation/breadcrumbs.js`.

Cada rota pode declarar:
```javascript
breadcrumb: ['Financeiro', 'Tesouraria', 'Gestão de Saldos']
```

Exemplo:
Financeiro › Tesouraria › Gestão de Saldos

Em rota de evento:
Marketing › Festival XYZ 2026 › Pixels e Conversões

Último item:
`aria-current="page"` e não clicável.

## 9. Breadcrumb mobile
Em 360 px, não criar scroll horizontal.

Desktop:
Financeiro > Tesouraria > Gestão de Saldos

Mobile:
‹ Tesouraria
Gestão de Saldos

## 10. Ordem do Router
Fluxo conceitual obrigatório:

Router.resolve()
→ PermissionGuard
→ ContextGuard
→ renderView()
→ MenuStateManager
→ BreadcrumbManager

Nenhuma view protegida deve renderizar antes da autorização.

## 11. Mudança de evento
Ao trocar Evento A → Evento B:
1. validar pertencimento ao produtor atual;
2. atualizar AppContext;
3. atualizar breadcrumb;
4. atualizar filtros;
5. recarregar dados dependentes de evento;
6. invalidar cache específico;
7. impedir reutilização de dados do Evento A.

## 12. Mudança de produtor — Admin
Somente perfil autorizado.

Ao trocar Produtor A → Produtor B:
1. limpar eventId;
2. invalidar caches;
3. carregar eventos do Produtor B;
4. atualizar AppContext;
5. atualizar view;
6. atualizar breadcrumb.

## 13. Financeiro
Gestão de Saldos pode trabalhar no consolidado do produtor e exibir saldos por evento.

Transferência entre Eventos deve validar:
- producerId;
- eventoOrigem;
- eventoDestino;
- ambos pertencentes ao produtor autorizado, salvo regra administrativa explícita.

## 14. Marketing
Campanhas devem respeitar produtor e, quando aplicável, evento.

Pixels:
Produtor → Evento obrigatório → Múltiplos pixels daquele evento.

Nunca mostrar pixel de evento terceiro.

## 15. Contabilidade
Permitir contexto consolidado do produtor ou contexto de evento conforme a subrota.

Exemplos:
- Balanço consolidado → produtor.
- DRE por evento → evento.
- Rastreabilidade → conforme filtro permitido.

## 16. SAC
A Consulta 360 pode possuir escopo mais amplo para equipe interna conforme permissão.

Produtor, se possuir acesso ao SAC, não deve obter automaticamente escopo global.

## 17. Estado sem permissão
URL direta sem autorização:
`Acesso não autorizado`
`Você não possui permissão para acessar esta funcionalidade.`

Não exibir erro técnico.

## 18. Segurança contra IDOR
Obrigatório revisar endpoints sensíveis.

Nunca confiar apenas em:
`?producerId=999`
ou `eventId` vindo do frontend.

Backend precisa validar recurso contra usuário autenticado.

Exemplo:
```javascript
if (
  req.user.role !== 'ADMIN' &&
  resource.producerId !== req.user.producerId
) {
  return res.status(403).json({ error: 'FORBIDDEN' });
}
```

## 19. Auditoria preparada
Preparar eventos:
- CONTEXT_PRODUCER_CHANGED
- CONTEXT_EVENT_CHANGED
- PERMISSION_DENIED
- CONTEXT_ACCESS_DENIED

Campos:
timestamp, userId, role, producerId, eventId, route, action, result.

## 20. Integração com MenuStateManager
Menu deve considerar:
rota + permissão + contexto.

Itens sem permissão podem não ser renderizados/exibidos, mas isso é UX, não segurança.

## 21. Não fazer nesta fase
Não:
- apagar telas;
- recriar dashboards;
- alterar cálculos financeiros/contábeis;
- quebrar aliases;
- reescrever autenticação sem necessidade;
- fazer limpeza geral da 28.15.7;
- antecipar suíte final da 28.15.8.

## 22. Testes obrigatórios

### Admin
- selecionar produtor;
- selecionar evento;
- trocar produtor;
- confirmar limpeza do evento;
- navegar entre módulos;
- validar breadcrumbs;
- F5;
- Voltar/Avançar.

### Produtor
- produtor fixo;
- somente eventos próprios;
- URL de outro produtor bloqueada;
- eventId terceiro bloqueado;
- Financeiro restrito;
- Marketing restrito;
- Pixels restritos;
- Contabilidade restrita;
- Relatórios restritos.

### Permissões
- somente leitura;
- Financeiro;
- Marketing;
- Contabilidade;
- sem acesso.

### Layout
- desktop;
- tablet;
- mobile 360 px;
- sem overflow horizontal.

## 23. Critérios de aceite
- Breadcrumb reflete rota real.
- Breadcrumb reflete evento quando aplicável.
- Produtor não acessa outro produtor.
- Só eventos autorizados aparecem.
- Admin autorizado troca de produtor.
- Troca de produtor limpa evento.
- Router verifica permissões.
- URL direta respeita permissão.
- Backend valida produtor/evento.
- Nenhum dado de terceiro é exibido.
- F5 restaura somente contexto válido.
- Zero telas brancas.
- Zero erro JS crítico.
- UI visível 100% pt-BR.

## 24. Relatório
Gerar:
`RELATORIO_HOMOLOGACAO_FASE_28_15_6.md`

Incluir:
- arquitetura encontrada;
- perfis existentes;
- permissões existentes;
- matriz rota/permissão;
- rotas com produtor;
- rotas com evento;
- breadcrumbs implementados;
- validações backend;
- testes Admin;
- testes Produtor;
- tentativas de acesso indevido;
- arquivos alterados;
- problemas e correções;
- pendências;
- resultado final.

## Condição de homologação
NÃO aprovar se:
- produtor visualizar evento terceiro;
- rota puder ser aberta sem permissão;
- producerId/eventId do frontend for aceito sem validação;
- troca de produtor mantiver evento anterior;
- breadcrumb mostrar contexto incorreto;
- F5 restaurar contexto indevido;
- dados de produtores se misturarem;
- houver tela branca ou erro crítico.

## Próxima fase
Após homologação:
**Fase 28.15.7 — Limpeza de Legado, Código Duplicado e Consolidação Técnica.**
