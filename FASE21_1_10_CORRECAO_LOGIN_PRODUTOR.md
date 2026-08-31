# Fase 21.1.10 — Correção do Login do Produtor

Correção cirúrgica do fluxo de autenticação/escopo do produtor.

## Ajustes
- O app não inicia mais com um produtor seed já autenticado.
- O login não cai mais silenciosamente em `seedUsers` quando a API falha.
- Após autenticar, qualquer perfil carrega `/producers` para obter a produtora real vinculada ao token.
- Eventos e produtora são carregados da mesma API antes de concluir a inicialização do painel.
- Em falha, token e escopo são limpos em vez de abrir um dashboard vazio/falso.

## Motivo
Na produção/cloud, IDs de produtor podem não coincidir com os IDs dos dados estáticos do frontend. Além disso, o fallback de login por seed mascarava falhas reais da API.

## Aceite
1. Login com produtor válido.
2. `/auth/login` retorna `producerId`.
3. `/producers` retorna a produtora vinculada.
4. `/events?producerId=...` retorna apenas os eventos permitidos.
5. Meu Dashboard mostra nome da produtora e eventos reais.
