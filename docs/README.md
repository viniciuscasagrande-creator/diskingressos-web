# Central de Documentação — DiskIngressos Enterprise (SafeSaff)

Bem-vindo à central de documentação e engenharia da plataforma **DiskIngressos Enterprise**. Este diretório consolida especificações de arquitetura, contratos de dados, relatórios de homologação e histórico de evolução do sistema.

---

## 📁 Estrutura de Diretórios

```text
docs/
├── architecture/          # Decisões de arquitetura, Design System e segurança
├── phases/                # Especificações detalhadas de fases de engenharia
│   └── manifests/         # Manifestos JSON das fases de release
├── prompts/               # Prompts e diretrizes operacionais de execução
├── reports/               # Relatórios executivos, matrizes de teste e homologação
├── API_CONTRACT.json      # Contrato canônico de APIs da plataforma
└── README_IMPLANTACAO.md  # Instruções de implantação e setup de ambiente
```

---

## 🏛️ 1. Arquitetura & Design System (`docs/architecture/`)

Documentos que definem os alicerces técnicos, padrões visuais e políticas estruturais:

- [**DESIGN_SYSTEM_MIGRATION_MAP.md**](./architecture/DESIGN_SYSTEM_MIGRATION_MAP.md): Mapa canônico de migração do Design System (Komposo/Limitless/Disk), inventário de componentes migrados e regras de compatibilidade visual.
- [**BACKEND_ARCHITECTURE.md**](./architecture/BACKEND_ARCHITECTURE.md): Arquitetura de microsserviços/API RESTful, integração Prisma ORM e modelagem do banco de dados (SQLite local e PostgreSQL em produção).
- [**SECURITY_ARCHITECTURE.md**](./architecture/SECURITY_ARCHITECTURE.md): Matriz de segurança, controle de acesso baseado em papéis (RBAC), multi-tenant e proteção de endpoints.
- [**DEPLOY_CHECKLIST.md**](./architecture/DEPLOY_CHECKLIST.md): Procedimentos operacionais para deploy em homologação e produção (Vercel, Railway, Render).
- [**BUILD_REQUIRED.md**](./architecture/BUILD_REQUIRED.md): Requisitos de compilação e validação do pipeline.

---

## 📋 2. Fases de Engenharia (`docs/phases/`)

Histórico e especificações técnicas de cada ciclo evolutivo da plataforma:

- **Fases Iniciais (10 a 16)**: Operações (`PHASE10`), Marketing & Tracking (`PHASE11` a `PHASE14`), Navegação e Contexto (`PHASE15`), Multi-Pixel, Autenticação e UTMs (`PHASE16`).
- **Fases de Consolidação (18 a 26)**: ERP Financeiro Contábil (`PHASE18_4`), Mapa Mestre (`FASE_19_1`), Estabilização e Governança (`FASE_26`).
- **Fases de Modernização e Homologação (28 e 29)**: Limpeza de legado (`FASE_28_15_7`), Reorganização do menu Enterprise (`FASE_28_15_8_1`), Arquitetura unificada Disk Core (`FASE_29`).
- **Manifestos (`docs/phases/manifests/`)**: Arquivos de manifesto com hashes e assinaturas de integridade das fases aprovadas.

---

## 📊 3. Relatórios & Evidências (`docs/reports/`)

Registros comprobatórios de validação, qualidade e correções operacionais:

- **Ajustes Visuais e de Tema**:
  - [**AJUSTE_LIMITLESS_OPERACIONAL_V5_20260917.md**](./reports/AJUSTE_LIMITLESS_OPERACIONAL_V5_20260917.md): Correções do bridge visual, AppShell e barra lateral executiva.
  - [**FASE_CORRECAO_CONTRASTE_VIDEO_2026_09_21.md**](./reports/FASE_CORRECAO_CONTRASTE_VIDEO_2026_09_21.md): Recalibração de tokens do modo escuro com paleta oficial e Laranja Disk.
  - [**CORRECAO_GLOBAL_MASTER_VISUAL_20260917.md**](./reports/CORRECAO_GLOBAL_MASTER_VISUAL_20260917.md): Validação de layout mestre e harmonia visual.
- **Relatórios de Homologação e Matrizes de Testes**:
  - Relatórios de homologação das fases 28 e 29 (`RELATORIO_HOMOLOGACAO_FASE_28_*.md`, `RELATORIO_FASE_29_*.md`).
  - Matrizes de regressão de qualidade e testes Playwright (`MATRIZ_REGRESSAO_*.md`, `PLAYWRIGHT_TESTES_*.md`).

---

## 🛡️ 4. Governança e Contratos Protegidos (Raiz)

Para manter a conformidade com as regras de CI/CD automatizadas, os arquivos de contrato canônico permanecem na raiz do projeto:

- `CORE_PROTECTED_MODULES.json` & `CORE_PROTECTED_MODULES.md`: Contrato de proteção dos 5 módulos homologados (Eventos, Financeiro, Estornos, Marketing e SAC).
- `playwright-*.policy.json`: Políticas automatizadas de autotratamento, impacto e diagnóstico dos testes de homologação.
- `AGENTS.md` / `GEMINI.md`: Diretrizes e regras supremas de desenvolvimento assistido por IA.
