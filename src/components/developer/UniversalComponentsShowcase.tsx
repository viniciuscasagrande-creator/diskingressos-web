// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// Vitrine Oficial dos Componentes Universais do Design System Disk
// ==============================================================================

import React, { useState } from 'react'
import {
  Sparkles,
  Layers,
  DollarSign,
  Ticket,
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react'

import {
  DiskCard,
  DiskCardHeader,
  DiskCardContent,
  DiskCardFooter,
  DiskKpiCard,
  DiskDataTable,
  ColumnDef,
  DiskInput,
  DiskSelect,
  DiskSegmentedControl,
  DiskFormField,
  DiskFilterBar,
  ActiveFilterChip,
  DiskTabs,
  DiskBadge,
  DiskStatus,
  DiskModal,
  DiskDrawer,
  DiskEmptyState,
  DiskSkeleton,
  DiskToolbar,
  DiskChartContainer,
  DiskPageHeader,
  DiskSectionHeader,
  DiskButton,
  formatCurrencyBRL,
  formatNumberBR,
  formatPercentBR,
  formatDateBR
} from '../../design-system'

interface SampleOrder {
  id: string
  cliente: string
  evento: string
  tipo: string
  valor: number
  status: 'aprovado' | 'pendente' | 'estornado'
  data: string
}

export const UniversalComponentsShowcase: React.FC = () => {
  // Estados interativos
  const [layoutMode, setLayoutMode] = useState<'cards' | 'tabela' | 'detalhes'>('tabela')
  const [selectedTab, setSelectedTab] = useState('geral')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState<string | string[]>('opcao1')
  const [searchValue, setSearchValue] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<ActiveFilterChip[]>([
    {
      id: 'f1',
      label: 'Evento',
      value: 'Rock Festival Curitiba',
      onRemove: () => setActiveFilters((prev) => prev.filter((f) => f.id !== 'f1'))
    },
    {
      id: 'f2',
      label: 'Status',
      value: 'Aprovados',
      onRemove: () => setActiveFilters((prev) => prev.filter((f) => f.id !== 'f2'))
    }
  ])

  // Mock data para a tabela
  const sampleOrders: SampleOrder[] = [
    {
      id: 'PED-1001',
      cliente: 'Mariana Silveira',
      evento: 'Rock Festival Curitiba',
      tipo: 'PIX Instantâneo',
      valor: 480.0,
      status: 'aprovado',
      data: '2026-09-16T14:30:00Z'
    },
    {
      id: 'PED-1002',
      cliente: 'Rodrigo Mendonça',
      evento: 'Festival de Inverno',
      tipo: 'Cartão de Crédito',
      valor: 1250.0,
      status: 'pendente',
      data: '2026-09-16T14:45:00Z'
    },
    {
      id: 'PED-1003',
      cliente: 'Camila Albuquerque',
      evento: 'Stand-up Comedy',
      tipo: 'Boleto Bancário',
      valor: 180.0,
      status: 'estornado',
      data: '2026-09-16T15:02:00Z'
    }
  ]

  const tableColumns: ColumnDef<SampleOrder>[] = [
    {
      key: 'id',
      header: 'Pedido',
      sortable: true,
      render: (row) => <strong className="text-foreground">{row.id}</strong>
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row) => <span className="font-medium">{row.cliente}</span>
    },
    {
      key: 'evento',
      header: 'Evento',
      priority: 'medium',
      render: (row) => <span className="text-muted-foreground">{row.evento}</span>
    },
    {
      key: 'valor',
      header: 'Valor',
      align: 'right',
      sortable: true,
      render: (row) => <strong className="text-foreground">{formatCurrencyBRL(row.valor)}</strong>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.status === 'aprovado') {
          return <DiskBadge variant="success" dot>Aprovado</DiskBadge>
        }
        if (row.status === 'pendente') {
          return <DiskBadge variant="warning" dot>Pendente</DiskBadge>
        }
        return <DiskBadge variant="danger" dot>Estornado</DiskBadge>
      }
    },
    {
      key: 'data',
      header: 'Data / Hora',
      priority: 'low',
      render: (row) => <span className="text-xs text-muted-foreground">{formatDateBR(row.data, true)}</span>
    }
  ]

  return (
    <section className="space-y-10 pt-8 border-t border-border" data-testid="universal-components-showcase">
      {/* 1. PageHeader Oficial do Design System */}
      <DiskPageHeader
        tag="Design System Komposo / Disk"
        title="Biblioteca de Componentes Universais"
        description="Conjunto definitivo de componentes visuais padronizados para aplicação em todos os módulos da plataforma (Dashboard, Eventos, Financeiro, Marketing, SAC, Contabilidade)."
        badge={<DiskBadge variant="primary">Fase 29.14.1.3.1</DiskBadge>}
        primaryAction={
          <DiskButton
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => setIsModalOpen(true)}
          >
            Abrir Diálogo Modal
          </DiskButton>
        }
        secondaryActions={
          <DiskButton
            variant="outline"
            icon={<Filter size={15} />}
            onClick={() => setIsDrawerOpen(true)}
          >
            Abrir Drawer Lateral
          </DiskButton>
        }
      />

      {/* 2. Seção: DiskCard & Variantes */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="1. Família Card (DiskCard)"
          description="Superfícies semânticas com suporte a elevação, foco, interatividade, estados de carregamento e seleção."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DiskCard variant="default">
            <DiskCardHeader
              title="Card Padrão"
              description="Variante default para listagens gerais"
              icon={<Layers size={16} />}
            />
            <DiskCardContent>
              Conteúdo adaptável que herda automaticamente os tokens de fundo e texto do tema ativo.
            </DiskCardContent>
            <DiskCardFooter>
              <span>Rodapé informativo</span>
              <DiskBadge variant="neutral" size="sm">Neutro</DiskBadge>
            </DiskCardFooter>
          </DiskCard>

          <DiskCard variant="elevated">
            <DiskCardHeader
              title="Card Elevado"
              description="Sombra sutil para destaque visual"
              icon={<Sparkles size={16} />}
            />
            <DiskCardContent>
              Ideal para resumos operacionais e métricas importantes com profundidade controlada.
            </DiskCardContent>
            <DiskCardFooter>
              <span className="text-emerald-600 font-semibold">Status Ativo</span>
            </DiskCardFooter>
          </DiskCard>

          <DiskCard variant="interactive">
            <DiskCardHeader
              title="Card Interativo"
              description="Hover animado e cursor pointer"
              icon={<Eye size={16} />}
            />
            <DiskCardContent>
              Clique para selecionar ou navegar. Possui feedback tátil e elevação suave ao passar o cursor.
            </DiskCardContent>
            <DiskCardFooter>
              <span className="text-primary font-bold">Clique para interagir →</span>
            </DiskCardFooter>
          </DiskCard>

          <DiskCard variant="default" selected>
            <DiskCardHeader
              title="Card Selecionado"
              description="Borda de realce Laranja Disk"
              icon={<CheckCircle2 size={16} />}
            />
            <DiskCardContent>
              Estado selecionado com anel de foco e tonalidade suave institucional.
            </DiskCardContent>
            <DiskCardFooter>
              <DiskBadge variant="primary" size="sm">Selecionado</DiskBadge>
            </DiskCardFooter>
          </DiskCard>
        </div>
      </div>

      {/* 3. Seção: DiskKpiCard (Métricas & KPIs) */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="2. Métricas Corporativas (DiskKpiCard)"
          description="Cards padronizados para KPIs corporativos com suporte a tendências semânticas independentes de regra matemática."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DiskKpiCard
            label="Volume Total de Vendas"
            value={formatCurrencyBRL(184920.0)}
            icon={<DollarSign size={18} />}
            accent="primary"
            trend="+12,4%"
            trendLabel="vs mês anterior"
            trendDirection="positive"
            trendStatus="success"
            comparison="Meta: R$ 200.000"
            progressPercent={82}
            tooltip="Consolidado de todas as transações da produtora"
          />

          <DiskKpiCard
            label="Ingressos Emitidos"
            value={formatNumberBR(4821)}
            icon={<Ticket size={18} />}
            accent="info"
            trend="+8,1%"
            trendLabel="semana atual"
            trendDirection="positive"
            trendStatus="success"
            comparison="Total previsto: 5.500"
            progressPercent={65}
          />

          <DiskKpiCard
            label="Taxa de Chargeback"
            value={formatPercentBR(-0.4, false, 2)}
            icon={<AlertTriangle size={18} />}
            accent="danger"
            trend="-0,15%"
            trendLabel="queda saudável"
            trendDirection="negative"
            trendStatus="success"
            helperText="Queda é favorável ao negócio (trendStatus: success)"
          />

          <DiskKpiCard
            label="Saldo a Repassar"
            value={formatCurrencyBRL(48200.0)}
            icon={<Clock size={18} />}
            accent="warning"
            trend="0,0%"
            trendLabel="estável"
            trendDirection="neutral"
            trendStatus="neutral"
            comparison="Próximo lote: 18/09"
          />
        </div>
      </div>

      {/* 4. Seção: DiskDataTable (Tabela Enterprise) */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="3. Tabela Enterprise (DiskDataTable)"
          description="Tabela genérica com ordenação, seleção em lote, paginação, alinhamento numérico e estados de carregamento/vazio."
          actions={
            <div className="flex items-center gap-2">
              <DiskSegmentedControl
                size="sm"
                options={[
                  { value: 'cards', label: 'Cards' },
                  { value: 'tabela', label: 'Tabela' },
                  { value: 'detalhes', label: 'Detalhes' },
                ]}
                value={layoutMode}
                onChange={(val) => setLayoutMode(val as 'cards' | 'tabela' | 'detalhes')}
              />
            </div>
          }
        />

        <DiskDataTable<SampleOrder>
          data={sampleOrders}
          columns={tableColumns}
          selectable
          selectedKeys={selectedRowKeys}
          onSelectKeys={setSelectedRowKeys}
          bulkActions={
            <div className="flex items-center gap-2">
              <DiskButton size="sm" variant="secondary" icon={<Download size={13} />}>
                Exportar
              </DiskButton>
              <DiskButton size="sm" variant="destructive" icon={<Trash2 size={13} />}>
                Cancelar
              </DiskButton>
            </div>
          }
          page={1}
          pageSize={10}
          totalItems={sampleOrders.length}
          onPageChange={() => {}}
        />
      </div>

      {/* 5. Seção: Formulários & Seletores */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="4. Formulários & Entradas (DiskInput, DiskSelect, DiskSegmentedControl)"
          description="Campos de entrada com validação, ícones integrados e controle de segmento moderno."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-card border border-border bg-surface">
          <DiskFormField label="Nome Completo do Cliente" required description="Para emissão de ingresso nominal">
            <DiskInput
              placeholder="Digite o nome..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClear={() => setInputValue('')}
            />
          </DiskFormField>

          <DiskFormField label="Evento de Destino" required>
            <DiskSelect
              options={[
                { value: 'opcao1', label: 'Rock Festival Curitiba' },
                { value: 'opcao2', label: 'Turnê Titãs - Encontro' },
                { value: 'opcao3', label: 'Stand-up Thiago Ventura' },
              ]}
              value={selectValue}
              onChange={setSelectValue}
              searchable
            />
          </DiskFormField>

          <DiskFormField label="Visualização do Módulo" description="Controle segmentado de layout">
            <DiskSegmentedControl
              fullWidth
              options={[
                { value: 'ativos', label: 'Ativos', badge: 12 },
                { value: 'inativos', label: 'Inativos', badge: 3 },
                { value: 'todos', label: 'Todos', badge: 15 },
              ]}
              value="ativos"
              onChange={() => {}}
            />
          </DiskFormField>
        </div>
      </div>

      {/* 6. Seção: Barra de Filtros & Chips Ativos */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="5. Barra de Filtros Integrada (DiskFilterBar)"
          description="Barra modular com busca rápida, chips de filtros aplicados e botão de limpar."
        />

        <DiskFilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Pesquisar por cliente, pedido ou CPF..."
          activeFilters={activeFilters}
          onClearAllFilters={() => setActiveFilters([])}
          onToggleAdvancedFilters={() => {}}
          isAdvancedOpen={false}
          actions={
            <DiskButton variant="primary" size="sm" icon={<Download size={14} />}>
              Relatório
            </DiskButton>
          }
        >
          <div className="w-48">
            <DiskSelect
              placeholder="Todos os canais"
              options={[
                { value: 'todos', label: 'Todos os canais' },
                { value: 'web', label: 'Site / Web' },
                { value: 'pdv', label: 'Pontos de Venda' },
              ]}
              value="todos"
              onChange={() => {}}
            />
          </div>
        </DiskFilterBar>
      </div>

      {/* 7. Seção: Abas & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DiskSectionHeader
            title="6. Sistema de Abas (DiskTabs)"
            description="Variantes Underline e Pills para subseções"
          />

          <div className="p-4 rounded-card border border-border bg-surface space-y-5">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Estilo Underline (Padrão Komposo/Disk)
              </span>
              <DiskTabs
                variant="underline"
                activeTab={selectedTab}
                onChange={setSelectedTab}
                tabs={[
                  { id: 'geral', label: 'Visão Geral', icon: <Layers size={14} /> },
                  { id: 'extrato', label: 'Extrato Financeiro', badge: 4 },
                  { id: 'config', label: 'Configurações' },
                ]}
              >
                <div className="p-4 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                  Painel da aba selecionada: <strong className="text-foreground">{selectedTab}</strong>
                </div>
              </DiskTabs>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Estilo Pills (Controle Compacto)
              </span>
              <DiskTabs
                variant="pills"
                activeTab="resumo"
                onChange={() => {}}
                tabs={[
                  { id: 'resumo', label: 'Resumo Diário' },
                  { id: 'semanal', label: 'Semanal' },
                  { id: 'mensal', label: 'Mensal' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <DiskSectionHeader
            title="7. Badges & Indicadores de Status (DiskBadge, DiskStatus)"
            description="Sinalizações semânticas com contraste garantido"
          />

          <div className="p-4 rounded-card border border-border bg-surface space-y-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Variantes Semânticas do DiskBadge
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <DiskBadge variant="primary" dot>Laranja Disk</DiskBadge>
                <DiskBadge variant="success" dot>Sucesso</DiskBadge>
                <DiskBadge variant="warning" dot>Aviso</DiskBadge>
                <DiskBadge variant="danger" dot>Perigo</DiskBadge>
                <DiskBadge variant="info" dot>Informação</DiskBadge>
                <DiskBadge variant="neutral" dot>Neutro</DiskBadge>
                <DiskBadge variant="outline">Outline</DiskBadge>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Indicadores Explícitos de Status em Tempo Real (DiskStatus)
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <DiskStatus label="Gateway Operacional" variant="success" pulse description="Latência 42ms" />
                <DiskStatus label="Fila de E-mails" variant="warning" description="3 pendentes" />
                <DiskStatus label="Serviço Antifraude" variant="primary" pulse description="Ativo em produção" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Seção: Toolbars & Feedback */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="8. Barra de Ferramentas & Feedback (DiskToolbar, DiskEmptyState, DiskSkeleton)"
          description="Estados de carregamento, ausência de dados e barras de comandos de topo."
        />

        <DiskToolbar
          title="Gerenciamento de Lotes"
          left={
            <DiskButton size="sm" variant="primary" icon={<Plus size={14} />}>
              Novo Lote
            </DiskButton>
          }
          center={
            <div className="text-xs text-muted-foreground">
              Total: <strong>14 lotes cadastrados</strong>
            </div>
          }
          right={
            <div className="flex items-center gap-1.5">
              <DiskButton size="sm" variant="outline" icon={<RefreshCw size={13} />}>
                Atualizar
              </DiskButton>
              <DiskButton size="sm" variant="secondary" icon={<Download size={13} />}>
                Exportar
              </DiskButton>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiskEmptyState
            compact
            icon={<FolderOpen size={24} />}
            title="Nenhum lote promocional ativo"
            description="Crie seu primeiro lote para disponibilizar ingressos aos compradores."
            primaryAction={
              <DiskButton size="sm" variant="primary" icon={<Plus size={14} />}>
                Criar Primeiro Lote
              </DiskButton>
            }
          />

          <DiskSkeleton variant="card" />
        </div>
      </div>

      {/* 9. Seção: Gráficos Corporativos (DiskChartContainer) */}
      <div className="space-y-4">
        <DiskSectionHeader
          title="9. Contêiner de Gráficos (DiskChartContainer)"
          description="Padronização de títulos, legendas e alturas para gráficos analíticos."
        />

        <DiskChartContainer
          title="Evolução Semanal de Ingressos Vendidos"
          description="Comparativo diário de vendas por canal oficial DiskIngressos"
          period="Últimos 7 dias"
          legends={[
            { label: 'Site Oficial (Web)', color: '#F97316', value: '4.120' },
            { label: 'Pontos de Venda (PDV)', color: '#10B981', value: '540' },
            { label: 'App Mobile', color: '#3B82F6', value: '161' },
          ]}
          actions={
            <DiskButton size="sm" variant="outline" icon={<Download size={13} />}>
              Exportar SVG
            </DiskButton>
          }
        >
          <div className="w-full h-full flex items-end justify-between px-6 pb-4 pt-8 gap-3">
            {[65, 82, 45, 94, 110, 135, 98].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[11px] font-bold text-muted-foreground">{val}k</span>
                <div
                  className="w-full rounded-t-md bg-primary hover:bg-primary-hover transition-all duration-200 cursor-pointer"
                  style={{ height: `${(val / 140) * 100}%` }}
                  title={`Volume: ${val}.000 ingressos`}
                />
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx]}
                </span>
              </div>
            ))}
          </div>
        </DiskChartContainer>
      </div>

      {/* 10. Diálogo Modal Interativo (DiskModal) */}
      <DiskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmação de Ação Crítica"
        description="Esta ação simula uma operação de confirmação no Design System Disk."
        footer={
          <>
            <DiskButton variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </DiskButton>
            <DiskButton variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirmar Operação
            </DiskButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground">
            O componente <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">DiskModal</code> isola o foco, bloqueia a rolagem do corpo da página e é fechado via tecla <kbd className="text-xs bg-muted border px-1 rounded">Escape</kbd> ou clique no backdrop.
          </p>
          <DiskCard variant="outlined" padding="sm">
            <p className="text-xs text-muted-foreground">
              Acessibilidade ARIA completa com suporte a ações destrutivas ou confirmatórias.
            </p>
          </DiskCard>
        </div>
      </DiskModal>

      {/* 11. Painel Lateral Interativo (DiskDrawer) */}
      <DiskDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Painel de Filtros Avançados"
        description="Demonstração do componente DiskDrawer com formulário interno"
        footer={
          <DiskButton variant="primary" fullWidth onClick={() => setIsDrawerOpen(false)}>
            Aplicar Filtros do Painel
          </DiskButton>
        }
      >
        <div className="space-y-4">
          <DiskFormField label="Período de Análise">
            <DiskSelect
              options={[
                { value: '7d', label: 'Últimos 7 dias' },
                { value: '30d', label: 'Últimos 30 dias' },
                { value: 'este-mes', label: 'Este mês' },
              ]}
              value="30d"
              onChange={() => {}}
            />
          </DiskFormField>

          <DiskFormField label="Canal de Entrada">
            <DiskSelect
              options={[
                { value: 'todos', label: 'Todos os canais' },
                { value: 'web', label: 'Web' },
                { value: 'pdv', label: 'PDV' },
              ]}
              value="todos"
              onChange={() => {}}
            />
          </DiskFormField>

          <DiskFormField label="Termo Específico">
            <DiskInput placeholder="Filtrar dentro do drawer..." />
          </DiskFormField>
        </div>
      </DiskDrawer>
    </section>
  )
}
