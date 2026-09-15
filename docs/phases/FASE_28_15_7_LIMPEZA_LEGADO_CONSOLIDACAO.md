# Fase 28.15.7 — Limpeza de Legado, Código Duplicado e Consolidação Técnica

## Objetivo

Executar uma consolidação técnica segura no PDT DiskIngressos após a estabilização das Fases 28.15.1 a 28.15.6.

A finalidade desta etapa é:

- remover código morto;
- eliminar duplicações;
- consolidar handlers;
- reduzir aliases desnecessários;
- organizar CSS legado;
- centralizar inicializações;
- remover listeners repetidos;
- eliminar funções órfãs;
- documentar dependências;
- preparar o projeto para testes estruturados da Fase 28.15.8.

## Regra crítica

A Fase 28.15.7 NÃO é uma fase de redesign.

Não alterar:

- aparência homologada;
- regras de negócio;
- rotas públicas;
- IDs usados por integrações;
- APIs;
- banco;
- permissões;
- contexto Produtor/Evento;
- comportamento mobile;
- dashboards;
- relatórios;
- cálculos.

Se qualquer trecho parecer "velho", mas ainda possuir referência real, NÃO remover.

---

# 1. Princípio de execução

A limpeza deve seguir esta ordem:

```text
Inventariar
  ↓
Localizar referências
  ↓
Classificar dependência
  ↓
Criar compatibilidade quando necessário
  ↓
Remover duplicação
  ↓
Executar testes
  ↓
Só então remover legado
```

Nunca começar apagando.

---

# 2. Escopo técnico

Revisar principalmente:

```text
index.html
src/app.js
src/styles.css
src/navigation/*
src/context/*
src/security/*
limitless_assets/js/app.js
demais scripts carregados no index.html
```

Também revisar:

```text
dist/
tests/
arquivos temporários
backups locais
scripts antigos
CSS não utilizado
helpers duplicados
aliases antigos
```

Não alterar `dist/` manualmente se ele for gerado pelo build.

---

# 3. Navegação

Após 28.15.1, deve existir apenas um motor efetivo de navegação.

Revisar ocorrências de:

```text
openView
navigateTo
switchActiveView
hashchange
popstate
pushState
replaceState
data-view
data-route
onclick de navegação
```

Objetivo:

```text
AppRouter = fonte única da navegação
```

Wrappers de compatibilidade podem permanecer apenas se houver chamadas reais.

---

# 4. Remoção segura de wrappers

Antes de remover qualquer wrapper:

```javascript
window.openView
window.navigateTo
window.switchActiveView
```

executar busca global.

Classificar:

```text
0 referências reais
→ remover

referências apenas em compatibilidade
→ manter temporariamente

referências externas/desconhecidas
→ manter e documentar
```

Não remover por suposição.

---

# 5. Listeners duplicados

Mapear:

```javascript
document.addEventListener(...)
window.addEventListener(...)
element.addEventListener(...)
```

Especial atenção:

- click;
- hashchange;
- popstate;
- resize;
- scroll;
- DOMContentLoaded;
- change;
- input;
- submit.

Objetivo:

- evitar registro duplicado;
- evitar listeners criados toda vez que a view abre;
- evitar memória acumulada;
- consolidar event delegation quando adequado.

---

# 6. Inicializadores duplicados

Mapear funções como:

```text
init*
render*
setup*
bind*
mount*
load*
```

Classificar:

```text
global-once
view-once
view-every-open
data-refresh
```

Criar política clara de execução.

Exemplo:

```javascript
const InitializationRegistry = {
  initialized: new Set(),

  once(key, fn) {
    if (this.initialized.has(key)) return;
    fn();
    this.initialized.add(key);
  }
};
```

Usar apenas quando compatível com comportamento real.

---

# 7. Código morto JavaScript

Identificar:

- funções nunca chamadas;
- variáveis nunca lidas;
- constantes antigas;
- módulos sem import;
- helpers duplicados;
- aliases sem referência;
- blocos comentados antigos;
- feature flags abandonadas.

Classificação obrigatória:

```text
REMOVER
MANTER
MIGRAR
DEPRECAR
INVESTIGAR
```

Não apagar itens classificados como INVESTIGAR.

---

# 8. CSS legado

Há histórico de classes antigas, por exemplo:

```text
.app-sidebar
.sidebar-nav
.menu-trigger
.submenu-panel
```

enquanto a estrutura atual pode usar:

```text
.sidebar-main
.nav-sidebar
.nav-item-submenu
.nav-group-sub
```

A Fase 28.15.7 deve:

1. buscar uso real no HTML/JS;
2. identificar seletores não utilizados;
3. verificar pseudoestados e classes injetadas por JS;
4. verificar Bootstrap/Limitless;
5. só então remover CSS morto.

Nunca remover seletor apenas porque não aparece diretamente no HTML.

Ele pode ser adicionado dinamicamente.

---

# 9. Limitless / Bootstrap

Revisar:

```text
limitless_assets/js/app.js
```

e verificar funções de:

- collapse;
- sidebar;
- nav-item-open;
- accordion;
- mobile sidebar.

Após 28.15.2 e 28.15.5, deve existir apenas um controlador efetivo por responsabilidade.

Se Limitless ainda for necessário para componentes gerais, não remover o arquivo inteiro.

Remover ou neutralizar somente o trecho que realmente conflitar.

---

# 10. Inline JavaScript

Buscar:

```html
onclick=
onchange=
onsubmit=
oninput=
```

Classificar:

```text
navegação
ação de negócio
modal
filtro
controle visual
legado
```

Migrar gradualmente para listeners centralizados quando isso não alterar comportamento.

Prioridade:

1. navegação;
2. menu;
3. tabs;
4. ações repetitivas.

Ações críticas de negócio podem permanecer temporariamente se a migração representar risco.

---

# 11. HTML duplicado

Mapear:

- menus duplicados;
- IDs conceitualmente repetidos;
- views antigas escondidas;
- modais duplicados;
- cards copiados;
- versões antigas de dashboards.

Não remover uma tela escondida até confirmar que nenhuma rota, botão, modal ou inicializador a utiliza.

---

# 12. Aliases de rota

Após estabilização, gerar tabela:

| Alias legado | Rota canônica | Referências | Ação |
|---|---|---:|---|
| financial-dashboard | /financeiro/dashboard | X | manter/remover |
| accounting-disk | /contabilidade/dashboard | X | manter |
| ... | ... | ... | ... |

Remover somente aliases sem referência real e sem necessidade de compatibilidade externa.

---

# 13. Consolidação de estados

Garantir que:

```text
Router
→ MenuStateManager
→ AppContext
→ PermissionGuard
→ BreadcrumbManager
```

não possuam cópias paralelas da mesma responsabilidade.

Exemplos a eliminar:

- múltiplas funções que adicionam `active`;
- dois controladores de sidebar;
- dois sistemas de breadcrumb;
- dois caches de contexto;
- dois validadores de permissão frontend.

---

# 14. Variáveis globais

Buscar:

```text
window.*
globalThis.*
```

Classificar:

```text
API pública intencional
compatibilidade
debug
legado
```

Reduzir globais quando seguro.

Não encapsular funções exigidas por HTML inline antes de migrar os handlers.

---

# 15. Console

Revisar:

```javascript
console.log
console.warn
console.error
```

Manter:

- erros reais;
- warnings úteis;
- auditoria de falhas.

Remover:

- debug temporário;
- logs repetitivos;
- dumps grandes de objetos;
- dados potencialmente sensíveis.

Nunca logar:

- token;
- senha;
- CPF completo desnecessariamente;
- dados bancários;
- segredos;
- credenciais.

---

# 16. Segurança

Buscar:

```text
API keys
tokens
secrets
senhas
chaves Firebase administrativas
URLs privadas
```

Não expor segredos no frontend.

Se encontrar segredo real:

- registrar no relatório;
- remover do frontend;
- mover para configuração segura apropriada;
- não imprimir o segredo no relatório.

---

# 17. Dependências

Revisar `package.json`.

Classificar dependências:

```text
usada
transitiva
dev
não utilizada
```

Não remover pacote sem confirmar imports, scripts e uso em build/test.

Também verificar scripts:

```text
dev
build
preview
deploy
test
```

Preparar a base para 28.15.8.

---

# 18. Estrutura de arquivos

Objetivo conceitual:

```text
src/
├── app.js
├── navigation/
│   ├── router.js
│   ├── routes.js
│   ├── menu-state-manager.js
│   └── breadcrumbs.js
├── context/
│   └── app-context.js
├── security/
│   ├── permission-guard.js
│   └── context-guard.js
├── modules/
│   ├── financeiro/
│   ├── contabilidade/
│   ├── marketing/
│   └── sac/
└── styles/
```

Não é obrigatório refatorar todo o monólito nesta fase.

Separar somente o que reduzir risco e duplicação.

---

# 19. Política de depreciação

Para funções antigas ainda utilizadas:

```javascript
/**
 * @deprecated Usar AppRouter.navigate()
 */
window.navigateTo = function legacyNavigateTo(view) {
  return AppRouter.navigateLegacy(view);
};
```

Isso é preferível a apagar abruptamente.

---

# 20. Compatibilidade

Preservar:

- bookmarks antigos;
- deep-links;
- integrações externas;
- chamadas de botões existentes;
- hashes antigos relevantes.

Se uma URL antiga for substituída:

```text
antiga
→ alias
→ rota canônica
```

---

# 21. Código comentado

Remover blocos antigos extensos somente se:

- já estiverem versionados no Git;
- não forem documentação útil;
- não forem feature temporariamente desligada.

Código morto comentado não deve virar "backup permanente".

---

# 22. CSS inline

Revisar:

```html
style=""
```

Não migrar tudo indiscriminadamente.

Mover apenas:

- estilos repetidos;
- padrões recorrentes;
- estados que já possuem classe equivalente.

Manter estilos realmente dinâmicos quando apropriado.

---

# 23. Nomenclatura

Padronizar gradualmente:

```text
camelCase → JS
kebab-case → rotas / data attributes
PascalCase → classes/controladores quando aplicável
```

Não renomear IDs usados externamente sem compatibilidade.

---

# 24. Tratamento de erros

Consolidar padrões:

```javascript
try {
  ...
} catch (error) {
  ...
}
```

Evitar:

```text
catch vazio
```

e:

```text
falha silenciosa sem feedback
```

Erros de negócio visíveis ao usuário devem permanecer em pt-BR.

---

# 25. Fetch / API

Buscar chamadas duplicadas para o mesmo endpoint.

Avaliar:

- helpers HTTP;
- tratamento 401/403;
- tratamento timeout;
- parsing JSON;
- mensagens de erro.

Não criar uma nova camada HTTP completa se isso aumentar o risco.

---

# 26. Caches

Revisar:

```text
localStorage
sessionStorage
variáveis globais
Maps/Sets
cache em memória
```

Garantir limpeza correta quando:

- logout;
- troca produtor;
- troca evento;
- alteração de permissão.

---

# 27. Eventos customizados

Mapear:

```javascript
new CustomEvent(...)
dispatchEvent(...)
```

Documentar eventos ativos.

Remover eventos órfãos somente após busca de listeners.

---

# 28. Performance

A limpeza deve reduzir:

- listeners duplicados;
- renderizações repetidas;
- gráficos recriados;
- manipulações DOM excessivas;
- loops de busca repetidos.

Não fazer otimização prematura que altere resultado.

---

# 29. Ferramentas de análise

Executar, quando disponíveis:

```text
grep/search global
node --check
npm run build
testes existentes
análise de imports
browser console
```

Não adicionar ferramenta pesada sem necessidade nesta fase.

---

# 30. Saída obrigatória: inventário técnico

Gerar:

```text
INVENTARIO_LEGADO_FASE_28_15_7.md
```

Com tabela:

| Item | Arquivo | Tipo | Referências | Decisão | Observação |
|---|---|---|---:|---|---|

Tipos:

```text
JS
CSS
HTML
ROTA
ALIAS
LISTENER
GLOBAL
DEPENDÊNCIA
STORAGE
```

---

# 31. Saída obrigatória: relatório de remoções

Gerar:

```text
RELATORIO_REMOCOES_FASE_28_15_7.md
```

Separar:

```text
Removido com segurança
Deprecado
Mantido por compatibilidade
Mantido por risco
Investigar posteriormente
```

---

# 32. Homologação

Gerar:

```text
RELATORIO_HOMOLOGACAO_FASE_28_15_7.md
```

Incluir:

- quantidade de duplicações encontradas;
- listeners consolidados;
- funções removidas;
- aliases removidos;
- aliases mantidos;
- CSS removido;
- globais reduzidas;
- dependências revisadas;
- arquivos alterados;
- build;
- testes;
- erros de console;
- regressões encontradas/corrigidas.

---

# 33. Teste de regressão mínimo

Após limpeza, validar:

## Navegação
- Dashboard
- Eventos
- Marketing
- Financeiro
- Contabilidade
- SAC
- Relatórios
- Configurações

## Financeiro
- Dashboard
- Gestão de Saldos
- Transferência entre Eventos
- Tesouraria
- Contas
- Compras
- Controladoria
- Conciliação
- Estornos
- Borderôs

## Contabilidade
- Dashboard
- Conciliação
- Rastreabilidade
- DRE
- Balanço
- Fiscal
- Relatórios

## Contexto
- Admin
- Produtor
- troca produtor
- troca evento
- bloqueio de evento terceiro

## Navegação do browser
- F5
- Voltar
- Avançar
- deep-link

## Responsividade
- 360 px
- 768 px
- desktop

---

# 34. Critério de aceite

A fase só pode ser homologada se:

- nenhuma funcionalidade for perdida;
- nenhuma rota importante quebrar;
- nenhuma tela branca surgir;
- build concluir;
- console não possuir erro crítico;
- contexto/permissões continuarem seguros;
- menu continuar sincronizado;
- mobile continuar funcional;
- código duplicado efetivamente reduzir.

---

# 35. O que NÃO remover nesta fase

Preservar qualquer item que ainda tenha dependência comprovada.

Em caso de dúvida:

```text
MANTER + DOCUMENTAR
```

é melhor do que remover.

---

# Resultado esperado

Ao final da Fase 28.15.7, o PDT deve ter:

- navegação consolidada;
- menos código morto;
- menos listeners;
- menos duplicação;
- menos globais;
- CSS mais limpo;
- aliases documentados;
- compatibilidade preservada;
- base preparada para testes automatizados.

Próxima fase oficial:

**28.15.8 — Testes Automatizados, Regressão e Homologação Técnica.**
