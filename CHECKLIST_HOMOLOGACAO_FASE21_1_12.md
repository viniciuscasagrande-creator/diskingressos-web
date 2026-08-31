# CHECKLIST — FASE 21.1.12

- [x] API Express adaptada para Serverless Vercel
- [x] Desenvolvimento local preservado
- [x] PostgreSQL Cloud ativado
- [x] Schema completo sincronizado
- [x] Carga inicial não destrutiva informada
- [x] Produtora DiskIngressos Produções vinculada
- [x] Usuário produtor vinculado
- [x] 5 eventos disponíveis
- [x] 15 campanhas de Marketing disponíveis
- [x] `/api/health` retornando HTTP 200
- [x] Banco retornando `databaseConnected: true`
- [x] `/api/auth/login` retornando HTTP 200
- [x] JWT emitido
- [x] `/api/events` retornando eventos
- [x] `/api/marketing/campaigns` retornando campanhas

## Próximo teste funcional
Validar visualmente no painel:
1. login do produtor;
2. seletor de eventos;
3. Dashboard Marketing;
4. persistência de evento/período na navegação;
5. demais módulos que dependem do mesmo `producerId`.
