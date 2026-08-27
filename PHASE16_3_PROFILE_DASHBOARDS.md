# Fase 16.3 — Dashboard inicial por perfil

## Objetivo
Após o login, cada usuário entra em uma página inicial adequada ao seu papel e sempre dentro do escopo da produtora vinculada. Admin Master/Admin continuam entrando na Visão Geral Administrativa global.

## Redirecionamento após login
- Admin Master / Admin → Visão Geral Administrativa
- Produtor Admin → Meu Dashboard (produtora)
- Produtor Financeiro → Meu Dashboard com navegação financeira
- Produtor Marketing → Meu Dashboard com navegação de Marketing
- Produtor Operacional → Meu Dashboard operacional
- Somente leitura → Meu Dashboard em modo de consulta

## Escopo
O dashboard utiliza somente os eventos retornados pela API para a produtora autenticada. O producerId não é escolhido pelo navegador para perfis de produtor; ele é obtido da sessão/JWT no backend.

## Menus e atalhos
Atalhos de módulos são exibidos apenas quando `canAccess()` permite o acesso. Perfis sem permissão não recebem atalhos para Financeiro, POS, Marketing, Remarketing, SAC ou Administração.

## Dashboard por perfil
O novo `ProfileDashboardPage` apresenta:
- produtora e perfil atual;
- quantidade de eventos visíveis;
- eventos ativos;
- vendas agregadas do escopo;
- check-ins;
- atalhos permitidos;
- últimos eventos acessíveis.

## Regra de segurança
A personalização de UI não substitui a autorização de backend. Toda API protegida deve continuar validando usuário, role, producerId, eventId e permissões.

## Usuários de demonstração
- Admin Master: admin@diskingressos.com.br / Admin@123
- Produtor Admin: vinicius@diskingressos.com.br / Produtor@123
- Financeiro: financeiro@fep.com.br / Financeiro@123
- Marketing: marketing@diskingressos.com.br / Marketing@123
- Operação: operacao@diskingressos.com.br / Operacao@123
- Somente leitura: consulta@diskingressos.com.br / Consulta@123
