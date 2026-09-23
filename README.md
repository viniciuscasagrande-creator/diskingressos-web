# DiskIngressos Enterprise — SafeSaff (PDT)

Plataforma corporativa de alta performance para **Gestão de Eventos, Ticketing, Operação de Portaria, Núcleo Financeiro, Motor de Estornos, Marketing Multicanal e Atendimento / SAC (ITIL)**.

---

## 🛡️ Contrato de Módulos Protegidos (CORE_PROTECTED_MODULES)

Por governança do produto e estabilidade operacional, os 5 módulos principais são **protegidos por travas de CI/Build automatizadas**. Nenhuma rota, PageKey ou tela pode ser removida ou alterada sem aprovação prévia:

| Módulo | Rota Canônica | PageKey | Tela / Componente Oficial |
| :--- | :--- | :--- | :--- |
| **Eventos** | `/app/events` | `events` | `EventsPage.tsx` |
| **Financeiro** | `/app/finance-dashboard` | `finance-dashboard` | `FinanceDashboardPage.tsx` |
| **Estornos** | `/app/finance-refunds` | `finance-refunds` | `FinanceDisputesHubPage.tsx` *(Independente no menu)* |
| **Marketing** | `/app/marketing-dashboard` | `marketing-dashboard` | `MarketingDashboardPage.tsx` |
| **Atendimento / SAC** | `/app/sac-hub` | `sac-hub` | `SACHubPage.tsx` |

---

## 🎨 Identidade Visual & Design System

A plataforma implementa um Design System corporativo homologado com transição de temas fluida:

- **Modo Escuro (Padrão Corporativo)**:
  - Fundo ultra escuro executivo (`#0B0E14`), superfícies em grafite ardósia (`#151C27`) e contornos sutis de 1px (`#283548`).
  - Destaque principal no **Laranja Disk** (`#FF8047`) e Azul Disk, eliminando excessos ou bordas neon.
- **Modo Claro (Harmonizado & Acolhedor)**:
  - Fundo em tom suave (`#F4F1ED`), superfícies claras acolhedoras (`#FFFAF2`) e bordas suaves (`#E6DED4`).
  - Classes de cartões temáticos com gradientes suaves: `.stat-blue`, `.stat-green`, `.stat-orange`, `.surface-card`, `.surface-panel` e `.subtle-card`.
- **Barra Lateral Executiva (350px)**:
  - Largura confortável de **350px** para leitura integral de rótulos longos, sem quebra de linha ou corte de texto.
  - Modo recolhido (76px) com preservação de ícones e tooltips.
- **Localização pt-BR & Tipografia Financeira**:
  - Interface do usuário 100% em Português do Brasil.
  - Valores e indicadores com algarismos tabulares (`tabular-nums`) para alinhamento contábil.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js 18+ (recomendado 20 LTS)
- npm 9+

### Instalação e Execução Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o banco de dados e dados de demonstração:
   ```bash
   npm run db:setup
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   - **Frontend**: `http://localhost:5173` (ou porta indicada pelo Vite)
   - **API Backend**: `http://localhost:3333/api`

---

## 🚦 Gates de Qualidade & CI

O projeto possui validação multinível contra regressões:

```bash
# 1. Verifica integridade dos 5 módulos protegidos (trava de CI)
npm run verify:protected-modules

# 2. Executa gate de qualidade completo (Módulos protegidos + Lucide Icons + Typecheck TypeScript)
npm run quality:gate

# 3. Compilação de produção com Vite
npm run build

# 4. Homologação completa com Deploy Guard HTTP + Testes Playwright
npm run homologate:vercel
```

---

## 🔑 Perfis de Acesso & Demonstração

Para ambiente de desenvolvimento local, utilize as credenciais pré-configuradas no seed:

| Perfil | E-mail | Senha | Escopo de Acesso |
| :--- | :--- | :--- | :--- |
| **Admin Master** | `admin@diskingressos.com.br` | `Admin@123` | Acesso global a todas as produtoras e módulos |
| **Produtor Admin** | `vinicius@diskingressos.com.br` | `Produtor@123` | Gestão completa da produtora vinculada |
| **Produtor Financeiro** | `financeiro@fep.com.br` | `Financeiro@123` | Foco em repasses, conciliação e fluxo financeiro |
| **Operação** | `operacao@diskingressos.com.br` | `Operacao@123` | Check-in, lotes, participantes e terminais POS |
| **Visualizador** | `consulta@diskingressos.com.br` | `Consulta@123` | Acesso seguro somente-leitura |

---

## 📂 Estrutura do Repositório

Consulte o índice completo em [**docs/README.md**](docs/README.md).

```text
safesaff/
├── docs/                        # Central de documentação, arquitetura, fases e relatórios
│   ├── architecture/            # Decisões de backend, segurança e Design System
│   ├── phases/                  # Especificação das fases de desenvolvimento e manifestos
│   └── reports/                 # Evidências, ajustes visuais e matrizes de homologação
├── prisma/                      # Modelagem de dados (SQLite local / PostgreSQL produção)
├── scripts/                     # Scripts de verificação, gates de CI e deploy guard
├── server/                      # API backend Node/Express estruturada (rotas, domínios, serviços)
├── src/
│   ├── app/                     # AppShell, navegação e layout mestre
│   ├── auth/                    # Contexto de autenticação, JWT e RBAC multi-tenant
│   ├── components/              # Componentes de interface e barras de navegação
│   ├── data/                    # Mocks, seeds e repositórios locais
│   ├── design-system/           # Tokens, temas e componentes universais Komposo/Disk
│   ├── pages/                   # Telas e módulos da plataforma
│   └── styles/                  # Folhas de estilo, temas e classes utilitárias
└── tests/                       # Suíte de testes E2E e visuais com Playwright
```

---

## 🌐 Produção & Deploy

- **Ambiente de Homologação / Produção**: [https://safesaff.vercel.app](https://safesaff.vercel.app)
- **Deploy Guard**: Validação HTTP automática das rotas protegidas a cada deploy.
- **Sincronização Multi-Remote**:
  - GitHub Principal: `diskingressos-web`
  - GitHub Secundário: `safesaff`
  - GitLab Mirror: `diskingressos/safesaff`
