# Correção imediata de contraste — referência em vídeo

## Objetivo

Aplicar ao projeto real o padrão visual demonstrado no vídeo de 21/09/2026, preservando integralmente navegação, permissões, rotas, dados e regras de negócio.

## Correções realizadas

- Recalibração dos tokens oficiais do modo escuro em `src/design-system/tokens/colors.css`.
- Separação real entre fundo, superfície, superfície elevada, hover, borda e borda forte.
- Laranja Disk `#FF8047` consolidado como cor principal no modo escuro.
- Atualização da cor do navegador móvel no `ThemeProvider`.
- Atualização do shell global para a paleta azul-preto do vídeo.
- Compatibilidade controlada para Financeiro e Estornos ainda baseados em componentes legados.
- Neutralização de fundos brancos fixos somente quando o modo escuro estiver ativo.
- Padronização de tabelas, campos, abas, cartões e indicadores financeiros.
- Números financeiros configurados com algarismos tabulares.

## Preservações

- Nenhum menu, submenu, nome, ordem ou rota foi modificado.
- Nenhuma permissão foi modificada.
- Nenhum endpoint ou regra financeira foi modificado.
- Dashboard Financeiro e Centro de Controle de Estornos foram preservados.
- Os temas Claro, Escuro e Sistema continuam disponíveis e persistentes.

## Validações aprovadas

- `npm run quality:gate`
- `npm run build`
- `npm run verify:disk-master-visual`
- Cinco módulos protegidos preservados: Eventos, Financeiro, Estornos, Marketing e Atendimento/SAC.

## Observação técnica

O Vite continua emitindo aviso de bundle principal acima de 500 KB. Esse aviso não impede o build e deve ser tratado em uma futura fase de divisão de código por módulo.
