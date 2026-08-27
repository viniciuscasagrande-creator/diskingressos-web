# Build da Fase 16.8.1

O pacote não inclui `dist/` antigo para evitar publicar por engano a versão anterior do Gemini.

Execute:

```bash
npm install
npm run db:setup
npm run build
npm run dev
```

Para Netlify, use `npm run build` e diretório de publicação `dist`.
