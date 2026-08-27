# Fase 16.2 — Login primeiro, escopo do produtor e visão Admin global

## Regra central

A tela de login é o primeiro ponto de entrada do sistema. Sem autenticação válida, o painel não é renderizado.

Após autenticar, o backend identifica `user.id`, `role`, `producerId` e o escopo de acesso. O `producerId` usado para limitar dados do produtor vem da identidade autenticada, e não de um valor livre enviado pelo navegador.

## Produtor

O usuário `vinicius@diskingressos.com.br` está associado à produtora DiskIngressos Produções. O seed desta fase cria **15 eventos** para essa produtora. Depois do login, `GET /api/events` retorna somente esses eventos porque o backend aplica o `producerId` do JWT.

Um produtor não recebe seletor de produtoras e não pode acessar por URL/API eventos de outro produtor.

## Admin Master / Admin

Admin Master e Admin trabalham em escopo global. O login administrativo abre a nova tela **Visão Geral Administrativa**, que exibe produtoras, quantidade de eventos e usuários.

O administrador pode:
- visualizar todos os eventos;
- selecionar uma produtora e entrar temporariamente no contexto dela;
- trocar o contexto no header;
- retornar para `Todas as produtoras`;
- acessar módulos administrativos conforme permissões.

A API mantém a distinção: apenas perfis globais podem usar `producerId` como filtro administrativo.

## Sessão

- Sem token: Login.
- Sessão normal: token em `sessionStorage` e restauração apenas enquanto a sessão do navegador existir.
- `Lembrar acesso`: token em `localStorage`.
- Logout: remove ambos os tokens e retorna a `/login`.
- Token inválido/expirado durante restauração: é apagado e o usuário volta ao Login.

## Fluxo

```text
LOGIN
  ↓
AUTENTICAÇÃO BACKEND
  ↓
PERFIL + producerId
  ├─ PRODUTOR → /api/events limitado pelo producerId → seus 15 eventos
  └─ ADMIN → Visão Geral → todas produtoras / todos eventos
```

## Segurança multi-tenant

Ocultar cards no React não é considerado segurança. As rotas de eventos validam o tenant no servidor. A mesma regra deve permanecer em vendas, ingressos, participantes, financeiro, marketing, Pixels, SAC, POS e demais recursos.
