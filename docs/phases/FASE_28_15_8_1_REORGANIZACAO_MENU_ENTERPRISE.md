# Fase 28.15.8.1 — Reorganização Definitiva do Menu Enterprise

## 1. Objetivo

Corrigir definitivamente a sobrecarga visual e estrutural do menu lateral do PDT DiskIngressos observada após a expansão dos módulos Financeiro, Contabilidade, Marketing e demais áreas.

Esta fase é CORRETIVA e deve ocorrer antes da Fase 28.15.9.

O objetivo NÃO é remover funcionalidades. O objetivo é transformar a sidebar em um menu executivo, curto e previsível, deslocando funções de terceiro nível para hubs internos.

Princípio:

```text
SIDEBAR = navegação entre áreas
HUB INTERNO = navegação operacional da área
TELA = execução da função
```

Não utilizar a sidebar como inventário de todas as funções existentes.

---

# 2. Regra absoluta

NÃO APAGAR:

- telas;
- funções;
- rotas;
- APIs;
- permissões;
- relatórios;
- módulos;
- componentes;
- regras financeiras;
- regras contábeis;
- contexto Produtor/Evento;
- aliases necessários.

A fase reorganiza acesso e hierarquia.

Antes de mover qualquer item:

```text
item atual
→ rota atual
→ view atual
→ função atual
→ novo grupo
→ novo ponto de acesso
```

Se o destino não estiver comprovado, manter temporariamente e documentar.

---

# 3. Problema observado

A sidebar atual cresceu de forma incremental e passou a misturar:

- módulos;
- categorias;
- funções;
- subfunções;
- relatórios;
- operações;
- atalhos.

Exemplo conceitual do problema:

```text
FINANCEIRO
  Dashboard
  CONTA FINANCEIRA
  Conta do Produtor
  Saldo por Evento
  Extrato
  Transferências
  GESTÃO
  Contas a Receber
  Contas a Pagar
  Centro de Custos
  Orçamentos
  ...
```

Ao mesmo tempo, telas internas também possuem navegação própria.

Resultado:

- menu excessivamente longo;
- informação duplicada;
- dificuldade de encontrar funções;
- excesso de scroll;
- hierarquia visual inconsistente;
- experiência mobile pior;
- Financeiro e Contabilidade aparentam ser sistemas diferentes dentro da mesma sidebar.

---

# 4. Arquitetura definitiva

Limitar a sidebar a dois níveis visuais principais.

```text
NÍVEL 1
Módulo

NÍVEL 2
Área / Hub

NÍVEL 3+
Dentro da página do Hub
```

Evitar terceiro e quarto níveis diretamente na sidebar.

---

# 5. Nova árvore principal

```text
PAINEL GERAL

EVENTOS
  Visão Geral
  Meus Eventos
  Operação
  Participantes

MARKETING
  Visão Geral
  Campanhas
  Comunicação
  Conversões & Pixels
  Analytics

FINANCEIRO
  Visão Geral
  Conta Financeira
  Contas
  Tesouraria
  Compras & Fornecedores
  Controladoria
  Conciliação
  Relatórios

CONTABILIDADE
  Visão Geral
  Operação Contábil
  Demonstrações
  Fiscal & Compliance
  Relatórios

SAC
  Visão Geral
  Central 360°
  Atendimentos
  Operação

RELATÓRIOS

ADMINISTRAÇÃO

CONFIGURAÇÕES
```

Usar nomes já existentes quando forem melhores ou necessários por compatibilidade.

---

# 6. Financeiro — estrutura definitiva

## Sidebar

```text
FINANCEIRO
  Visão Geral
  Conta Financeira
  Contas
  Tesouraria
  Compras & Fornecedores
  Controladoria
  Conciliação
  Relatórios
```

O Dashboard Financeiro já homologado deve permanecer intacto.

---

# 7. Hub — Conta Financeira

Ao abrir:

```text
Financeiro › Conta Financeira
```

apresentar hub interno com acesso a:

```text
Conta do Produtor
Saldo por Evento
Gestão de Saldos
Transferência entre Eventos
Extrato Financeiro
Divisão de Receitas
Pagamentos & Taxas
```

Sugestão visual:

```text
┌──────────────────────┐  ┌──────────────────────┐
│ Conta do Produtor    │  │ Gestão de Saldos     │
│ Saldo consolidado    │  │ Saldos por evento    │
└──────────────────────┘  └──────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Transferências       │  │ Extrato              │
│ Entre eventos        │  │ Movimentações        │
└──────────────────────┘  └──────────────────────┘
```

Cards são atalhos para rotas existentes.

Não duplicar lógica.

---

# 8. Hub — Contas

```text
Financeiro › Contas
```

Funções internas:

```text
Contas a Receber
Contas a Pagar
Antecipações
Repasses
Agenda Financeira
Pagamentos
Taxas
```

---

# 9. Hub — Tesouraria

```text
Financeiro › Tesouraria
```

Funções:

```text
Contas Bancárias
PIX
CNAB
Pagamentos em Lote
Agenda de Repasses
Liquidação
Projeção de Caixa
```

---

# 10. Hub — Compras & Fornecedores

Unificar visualmente as entradas atualmente espalhadas.

```text
Financeiro › Compras & Fornecedores
```

Categorias internas:

## Compras
- Central de Aprovações
- Solicitações
- Cotações
- Pedidos
- Recebimentos

## Fornecedores
- Cadastro
- Fornecedor 360°
- Documentos
- CNDs

## Contratos
- Central de Contratos
- Parcelas
- Vencimentos
- Aprovações

Não remover as rotas P2P existentes.

---

# 11. Hub — Controladoria

```text
Financeiro › Controladoria
```

Funções:

```text
Centros de Custos
Orçamentos
Fluxo de Caixa
Projeção de Caixa
DRE Gerencial
Resultado Consolidado
```

---

# 12. Hub — Conciliação

```text
Financeiro › Conciliação
```

Funções:

```text
Conciliação Bancária
Conciliação de Gateways
Conciliação de Repasses
Retorno Bancário
Rastreabilidade Financeira
```

---

# 13. Hub — Relatórios Financeiros

```text
Financeiro › Relatórios
```

Funções:

```text
Extrato Financeiro
Borderô Resumido
Borderô Completo
Relatórios por Evento
Relatório Consolidado
Receitas Detalhadas
Despesas Detalhadas
```

Receitas/Despesas Detalhadas deixam de ocupar espaço de primeiro nível.

As telas permanecem.

---

# 14. Contabilidade — sidebar definitiva

Reduzir a repetição entre sidebar e navegação interna.

```text
CONTABILIDADE
  Visão Geral
  Operação Contábil
  Demonstrações
  Fiscal & Compliance
  Relatórios
```

---

# 15. Hub — Operação Contábil

```text
Contabilidade › Operação Contábil
```

Funções:

```text
Plano de Contas
Lançamentos
Centro de Conciliação
Rastreabilidade
Fechamento Mensal
```

---

# 16. Hub — Demonstrações

```text
Contabilidade › Demonstrações
```

Funções:

```text
DRE
Balanço Patrimonial
Fluxos/Indicadores contábeis existentes
```

Não recriar DRE ou Balanço.

Usar as subrotas da Fase 28.15.4.

---

# 17. Hub — Fiscal & Compliance

```text
Contabilidade › Fiscal & Compliance
```

Funções:

```text
Fiscal
Auditoria
Compliance
Documentos
Configurações contábeis relacionadas
```

Somente incluir funções realmente existentes.

---

# 18. Marketing

Aplicar a mesma filosofia.

Sidebar:

```text
MARKETING
  Visão Geral
  Campanhas
  Comunicação
  Conversões & Pixels
  Analytics
```

## Campanhas

Hub interno:

```text
Campanhas
Campanhas Multicanais
Status Real
Templates
Cupons
Links / UTMs / QR
Afiliados
```

## Comunicação

```text
WhatsApp
E-mail
Automações
Carrinho Abandonado
Remarketing
```

## Conversões & Pixels

```text
Central de Pixels por Evento
Meta
Google
TikTok
Spotify
Health Check
Diagnóstico
Alertas
```

Preservar integralmente as Fases 28.13 e 28.14.

---

# 19. SAC

Sidebar resumida:

```text
SAC
  Visão Geral
  Central 360°
  Atendimentos
  Operação
```

A Central de Consulta 360° deve continuar com destaque por ser função operacional crítica.

Não esconder a Central 360° em vários níveis.

---

# 20. Critério de quantidade

Objetivo visual:

```text
5–9 entradas de segundo nível por módulo
```

Evitar módulos com:

```text
20
30
40
```

entradas diretamente na sidebar.

---

# 21. Hubs internos

Criar componente reutilizável conceitual:

```text
ModuleHub
```

Estrutura:

```javascript
{
  title: 'Tesouraria',
  description: 'Gestão bancária, pagamentos e liquidação',
  items: [
    {
      title: 'Contas Bancárias',
      route: '/financeiro/tesouraria/contas'
    }
  ]
}
```

Pode ser implementado no stack atual sem obrigar migração para React.

---

# 22. Visual dos hubs

Seguir padrão Premium Enterprise já adotado:

- cards compactos;
- títulos claros;
- ícone;
- descrição curta;
- indicador opcional;
- hover discreto;
- bordas arredondadas;
- sem excesso de cores;
- responsivo.

Desktop:

```text
3 ou 4 cards por linha
```

Tablet:

```text
2 cards
```

Mobile:

```text
1 card
```

---

# 23. Estado ativo

MenuStateManager continua sendo fonte do estado.

Exemplo:

```text
/financeiro/tesouraria/pix
```

Sidebar:

```text
FINANCEIRO
  Tesouraria ← ativo
```

Hub interno:

```text
PIX ← ativo
```

Não tentar exibir PIX como terceiro nível permanente da sidebar.

---

# 24. Breadcrumb

Exemplo:

```text
Financeiro › Tesouraria › PIX
```

Sidebar não precisa reproduzir toda a cadeia.

---

# 25. Rotas

Rotas existentes devem continuar funcionando.

Exemplo:

```text
/financeiro/tesouraria/pix
```

continua válida.

A mudança principal é o ponto de entrada visual.

Bookmarks e deep-links não podem quebrar.

---

# 26. Deep-link

Se usuário abrir diretamente:

```text
#/financeiro/tesouraria/pix
```

o sistema deve:

1. abrir Financeiro;
2. marcar Tesouraria na sidebar;
3. abrir PIX;
4. atualizar breadcrumb;
5. preservar contexto/permissão.

---

# 27. Mobile

Em 360 px:

Sidebar deve mostrar apenas a arquitetura resumida.

Exemplo:

```text
Financeiro
  Visão Geral
  Conta Financeira
  Contas
  Tesouraria
  Compras & Fornecedores
  Controladoria
  Conciliação
  Relatórios
```

Isso reduz drasticamente o scroll atual.

---

# 28. Busca rápida

Preparar, se já houver infraestrutura adequada, um campo:

```text
Buscar no sistema...
```

que possa localizar funções profundas como:

```text
PIX
CNAB
Borderô
Rastreabilidade
Meta Pixel
```

A busca deve navegar para a rota existente.

Se ainda não existir infraestrutura segura, deixar como melhoria posterior e não bloquear esta fase.

---

# 29. Favoritos/Recentes

Não implementar obrigatoriamente nesta fase.

A arquitetura dos hubs deve permitir futuramente:

```text
Favoritos
Acessados recentemente
```

sem voltar a inflar a sidebar.

---

# 30. Separadores

Evitar cabeçalhos excessivos dentro de um módulo.

Não repetir:

```text
CONTA FINANCEIRA
GESTÃO
OPERAÇÃO
RELATÓRIOS
...
```

em uma lista gigantesca.

Esses conceitos passam a ser hubs.

---

# 31. Compatibilidade com 28.15.1–28.15.8

Preservar:

- AppRouter;
- MenuStateManager;
- AccountingController;
- BreadcrumbManager;
- AppContext;
- PermissionGuard;
- ContextGuard;
- responsividade 360;
- testes existentes.

Atualizar testes que dependam da árvore visual antiga, sem reduzir a cobertura das rotas.

---

# 32. Permissões

Um hub só mostra funções autorizadas.

Exemplo:

```text
Tesouraria
```

Usuário sem permissão para CNAB:

```text
CNAB não aparece no hub
```

Mas URL direta também deve continuar bloqueada pelo PermissionGuard/backend.

---

# 33. Contexto Produtor/Evento

Hubs devem respeitar AppContext.

Exemplo:

```text
Financeiro › Conta Financeira
```

pode mostrar contexto do produtor.

```text
Transferência entre Eventos
```

exige eventos autorizados.

Nenhuma reorganização pode enfraquecer isolamento de dados.

---

# 34. Migração segura

Executar em etapas:

## Etapa A — Inventário

Gerar mapa de TODOS os itens atuais:

```text
nome
grupo atual
data-view/data-route
onclick
view
permissão
novo hub
```

## Etapa B — Hubs

Criar hubs apontando para rotas existentes.

## Etapa C — Sidebar

Somente depois dos hubs funcionarem, reduzir a sidebar.

## Etapa D — Deep-links

Validar rotas diretas.

## Etapa E — Mobile

Validar 360.

## Etapa F — Regressão

Executar suíte 28.15.8.

---

# 35. Proibição de remoção prematura

Não remover item antigo da sidebar até existir:

```text
novo acesso funcionando
+
rota funcionando
+
teste aprovado
```

Durante migração, pode existir compatibilidade temporária.

---

# 36. Testes obrigatórios

## Sidebar

- apenas um grupo principal ativo;
- quantidade reduzida de itens;
- sem scroll horizontal;
- sem menu duplicado;
- sem submenu preso.

## Financeiro

Testar todos os 8 hubs.

## Contabilidade

Testar todos os 5 hubs.

## Marketing

Testar todos os 5 hubs.

## SAC

Testar Central 360°.

## Deep-link

Abrir diretamente funções profundas.

## Permissões

Hub e rota devem concordar.

## Contexto

Produtor/Evento preservados.

## Mobile

360 / 390 / 430.

## Desktop

1280 / 1440 / 1920.

---

# 37. Critérios de aceite

- nenhuma funcionalidade removida;
- sidebar significativamente menor;
- Financeiro com no máximo 8 entradas principais;
- Contabilidade com no máximo 5 entradas principais;
- Marketing com no máximo 5 entradas principais;
- funções profundas acessíveis por hubs;
- deep-links preservados;
- aliases preservados quando necessários;
- breadcrumbs corretos;
- permissões corretas;
- contexto correto;
- zero tela branca;
- zero erro JS crítico;
- zero P0;
- zero P1;
- mobile 360 aprovado.

---

# 38. Entregáveis

Gerar:

```text
MAPA_MENU_ANTES_DEPOIS_FASE_28_15_8_1.md
RELATORIO_MIGRACAO_MENU_FASE_28_15_8_1.md
RELATORIO_HOMOLOGACAO_FASE_28_15_8_1.md
```

O mapa deve registrar cada item antigo e seu novo destino.

---

# 39. Resultado esperado

ANTES:

```text
Sidebar
 ├ função
 ├ função
 ├ função
 ├ função
 ├ função
 ├ função
 ├ função
 ├ ...
```

DEPOIS:

```text
Sidebar
 └ Área
    └ Hub
       └ Funções
```

Exemplo:

```text
Financeiro
 └ Tesouraria
    ├ Contas Bancárias
    ├ PIX
    ├ CNAB
    └ Pagamentos em Lote
```

---

# 40. Próximo passo

Após a implantação desta fase:

1. executar novamente a regressão da Fase 28.15.8;
2. corrigir qualquer regressão;
3. somente então avançar para:

**Fase 28.15.9 — Homologação Final, Go-Live, Monitoramento e Rollback.**
