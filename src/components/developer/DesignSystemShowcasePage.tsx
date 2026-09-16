import React, { useState } from 'react'
import {
  Sun,
  Moon,
  Monitor,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Palette,
  Layers,
  Type,
  Sliders,
  Layout,
  Table,
  BarChart3,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { useTheme } from '../../design-system/hooks/useTheme'
import { ThemeSwitcher } from '../../design-system/components/ThemeSwitcher'
import { ThemeToggleCompact } from '../../design-system/components/ThemeToggleCompact'
import { getChartPalette } from '../../design-system/themes/chart-theme'

export const DesignSystemShowcasePage: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [inputVal, setInputVal] = useState('Valor de exemplo')
  const [switchActive, setSwitchActive] = useState(true)
  const [checkboxActive, setCheckboxActive] = useState(true)
  const [selectedOption, setSelectedOption] = useState('opcao1')

  const chartPalette = getChartPalette(resolvedTheme)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(text)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Dados mock para a tabela do Komposo
  const sampleTableData = [
    {
      id: 'PED-89410',
      cliente: 'Mariana Silveira',
      evento: 'Festival de Inverno Curitiba',
      tipo: 'PIX Instantâneo',
      valor: 'R$ 480,00',
      status: 'Aprovado',
      statusType: 'success',
      data: '16/09/2026 09:42'
    },
    {
      id: 'PED-89411',
      cliente: 'Rodrigo Mendonça',
      evento: 'Turnê Titãs - Encontro',
      tipo: 'Cartão de Crédito (3x)',
      valor: 'R$ 1.250,00',
      status: 'Em Análise Antifraude',
      statusType: 'warning',
      data: '16/09/2026 09:45'
    },
    {
      id: 'PED-89412',
      cliente: 'Camila Albuquerque',
      evento: 'Stand-up Thiago Ventura',
      tipo: 'Boleto Bancário',
      valor: 'R$ 180,00',
      status: 'Aguardando Pagamento',
      statusType: 'info',
      data: '16/09/2026 10:02'
    },
    {
      id: 'PED-89413',
      cliente: 'Fernando Bastos',
      evento: 'Rock Festival Brasil',
      tipo: 'Cartão de Débito',
      valor: 'R$ 620,00',
      status: 'Estornado',
      statusType: 'danger',
      data: '16/09/2026 10:14'
    }
  ]

  // Dados para o gráfico de barras SVG
  const chartData = [
    { dia: 'Seg', valor: 65, total: 'R$ 124.500' },
    { dia: 'Ter', valor: 82, total: 'R$ 158.200' },
    { dia: 'Qua', valor: 45, total: 'R$ 89.100' },
    { dia: 'Qui', valor: 94, total: 'R$ 192.400' },
    { dia: 'Sex', valor: 110, total: 'R$ 245.800' },
    { dia: 'Sáb', valor: 135, total: 'R$ 312.000' },
    { dia: 'Dom', valor: 98, total: 'R$ 215.300' }
  ]

  return (
    <div
      className="space-y-8 max-w-7xl mx-auto pb-16 animate-fadeIn"
      data-testid="design-system-showcase"
    >
      {/* Top Banner de Identidade & Controles de Tema */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Design System Disk • Padrão Visual Komposo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Fundação Visual & Sistema de Tokens
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Arquitetura de design unificada para toda a plataforma DiskIngressos. Suporte a modo
              Claro, Escuro e Sistema, paleta institucional padronizada com Laranja Disk e
              superfícies de alto contraste inspiradas na excelência Komposo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <ThemeToggleCompact />
              <ThemeSwitcher variant="segmented" showLabels />
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Tema Resolvido: {resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}</span>
            </div>
          </div>
        </div>

        {/* Seletor em Formato Cards */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Alternância Rápida de Modos
          </p>
          <ThemeSwitcher variant="cards" />
        </div>
      </div>

      {/* 1. Paleta de Cores e Tokens */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              1. Paleta de Cores & Tokens Oficiais
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laranja Disk institucional e cores semânticas padronizadas entre todos os módulos.
            </p>
          </div>
        </div>

        {/* Laranja Institucional Disk */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Marca Institucional DiskIngressos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => copyToClipboard('--disk-color-primary')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-orange-500 transition group"
            >
              <div className="w-full h-12 rounded-lg bg-[#F97316] mb-3 shadow-inner flex items-center justify-center text-white font-black text-xs">
                #F97316
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Laranja Disk Principal</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                --disk-color-primary
              </p>
            </div>

            <div
              onClick={() => copyToClipboard('--disk-color-primary-hover')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-orange-500 transition group"
            >
              <div className="w-full h-12 rounded-lg bg-[#EA580C] mb-3 shadow-inner flex items-center justify-center text-white font-black text-xs">
                #EA580C
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Laranja Interativo Hover</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                --disk-color-primary-hover
              </p>
            </div>

            <div
              onClick={() => copyToClipboard('--disk-color-primary-active')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-orange-500 transition group"
            >
              <div className="w-full h-12 rounded-lg bg-[#C2410C] mb-3 shadow-inner flex items-center justify-center text-white font-black text-xs">
                #C2410C
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Laranja Pressionado Ativo</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                --disk-color-primary-active
              </p>
            </div>

            <div
              onClick={() => copyToClipboard('--disk-color-primary-subtle')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-orange-500 transition group"
            >
              <div className="w-full h-12 rounded-lg bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 mb-3 flex items-center justify-center text-orange-800 dark:text-orange-300 font-black text-xs">
                Sutil
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100">Fundo Sutil Disk</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                --disk-color-primary-subtle
              </p>
            </div>
          </div>
        </div>

        {/* Cores Semânticas de Negócio */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Cores Semânticas de Negócio
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="w-full h-10 rounded-lg bg-emerald-500 mb-2.5 flex items-center justify-center text-white font-black text-xs">
                #10B981
              </div>
              <p className="font-bold text-xs text-emerald-900 dark:text-emerald-300">Sucesso / Concluído</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Vendas aprovadas, ingressos validados
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
              <div className="w-full h-10 rounded-lg bg-amber-500 mb-2.5 flex items-center justify-center text-white font-black text-xs">
                #F59E0B
              </div>
              <p className="font-bold text-xs text-amber-900 dark:text-amber-300">Alerta / Atenção</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                Lotes em esgotamento, pendências
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
              <div className="w-full h-10 rounded-lg bg-rose-500 mb-2.5 flex items-center justify-center text-white font-black text-xs">
                #EF4444
              </div>
              <p className="font-bold text-xs text-rose-900 dark:text-rose-300">Perigo / Erro</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                Estornos, bloqueios, chargebacks
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
              <div className="w-full h-10 rounded-lg bg-blue-500 mb-2.5 flex items-center justify-center text-white font-black text-xs">
                #3B82F6
              </div>
              <p className="font-bold text-xs text-blue-900 dark:text-blue-300">Informação / Neutro</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                Dados cadastrais, avisos e dicas
              </p>
            </div>
          </div>
        </div>

        {copiedToken && (
          <div className="mt-4 p-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-2 justify-center animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Token copiado para a área de transferência: {copiedToken}</span>
          </div>
        )}
      </section>

      {/* 2. Tipografia & Hierarquia */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              2. Tipografia & Hierarquia Textual
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escala tipográfica com legibilidade máxima e pesos consistentes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                H1 • Título de Página Principal (28px - 32px / Peso 900)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
                Gestão Geral de Operações Disk
              </h1>
            </div>
            <span className="text-xs font-mono text-slate-400">text-3xl font-black</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                H2 • Título de Seção (20px - 24px / Peso 800)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Extrato Consolidado do Evento
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">text-2xl font-bold</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                H3 • Título de Cartão ou Subseção (16px - 18px / Peso 700)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Detalhamento dos Lotes Ativos
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">text-lg font-bold</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Corpo de Texto & Legenda (13px - 14px / Regular & Médio)
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                O fluxo de fechamento financeiro consolida automaticamente todos os ingressos emitidos, taxas de serviço, retenções de segurança e repasses homologados ao produtor.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">text-sm text-slate-600</span>
          </div>
        </div>
      </section>

      {/* 3. Botões & Ações */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              3. Botões & Ações
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Botão principal no Laranja Disk institucional, variantes secundárias e estados operacionais.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Variantes Principais
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                <span>Ação Primária Disk</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition border border-slate-200 dark:border-slate-700 flex items-center gap-2"
              >
                <span>Ação Secundária</span>
              </button>

              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm transition border border-slate-300 dark:border-slate-700 flex items-center gap-2"
              >
                <span>Outline / Contorno</span>
              </button>

              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Ação de Risco / Cancelar</span>
              </button>

              <button
                type="button"
                className="px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm transition flex items-center gap-2"
              >
                <span>Botão Fantasma</span>
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Estados Operacionais (Carregando e Desabilitado)
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center gap-2 opacity-80 cursor-wait"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processando Pagamento...</span>
              </button>

              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold text-sm cursor-not-allowed border border-transparent"
              >
                <span>Ação Desabilitada</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Formulários & Entradas de Dados */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              4. Entradas & Controles de Formulário
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Campos padronizados com foco em Laranja Disk e bordas neutras refinadas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Campo de Texto Padrão
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Digite as instruções..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Busca com Ícone Integrado
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Pesquisar por pedido, CPF ou cliente..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Seletor Suspenso (Dropdown)
              </label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              >
                <option value="opcao1">Opção 1 • Produtora Curitiba Shows</option>
                <option value="opcao2">Opção 2 • Opus Entretenimento</option>
                <option value="opcao3">Opção 3 • Live Nation Brasil</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Área de Texto (Textarea)
              </label>
              <textarea
                rows={3}
                placeholder="Observações de auditoria ou notas fiscais..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkboxActive}
                  onChange={(e) => setCheckboxActive(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notificar produtor via WhatsApp
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setSwitchActive((prev) => !prev)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    switchActive ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      switchActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Trava de Segurança Ativa
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cards & Superfícies Komposo */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              5. Cards & Superfícies Komposo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Padrão de elevação e cartões com métricas de negócio e indicadores de desempenho.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card KPI 1 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Receita Bruta Total
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
              R$ 1.842.630,45
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>+18.4% vs mês anterior</span>
            </div>
          </div>

          {/* Card KPI 2 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ingressos Emitidos
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
              14.280 un
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>91.2% da capacidade</span>
            </div>
          </div>

          {/* Card KPI 3 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Taxa de Conversão
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
              4.62%
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Checkout otimizado</span>
            </div>
          </div>

          {/* Card KPI 4 */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Índice de Estornos
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
              0.31%
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
              <span>Abaixo da meta de 0.8%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pílulas de Status & Badges */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              6. Badges & Pílulas de Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Status semânticos para pedidos, pagamentos, lotes e ingressos 100% em pt-BR.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <Check className="w-3.5 h-3.5" /> Aprovado / Liquidado
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <AlertTriangle className="w-3.5 h-3.5" /> Pendente / Em Análise
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Info className="w-3.5 h-3.5" /> Aguardando Pagamento
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <XCircle className="w-3.5 h-3.5" /> Estornado / Cancelado
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/60">
            <Sparkles className="w-3.5 h-3.5" /> Destaque Especial Disk
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Rascunho
          </span>
        </div>
      </section>

      {/* 7. Tabela Komposo Homologada */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              7. Tabela de Listagem no Padrão Komposo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estrutura de dados refinada com separadores sutis, hover dinâmico e formatação brasileira.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Comprador</th>
                <th className="p-3.5">Evento Vinculado</th>
                <th className="p-3.5">Forma</th>
                <th className="p-3.5 text-right">Valor Total</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sampleTableData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {row.id}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                    {row.cliente}
                  </td>
                  <td className="p-3.5">{row.evento}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{row.tipo}</td>
                  <td className="p-3.5 text-right font-black text-slate-900 dark:text-slate-100">
                    {row.valor}
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        row.statusType === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : row.statusType === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : row.statusType === 'info'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Visualização de Dados & Gráficos Dinâmicos com Tema */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
              8. Visualização de Gráficos Adaptativa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gráficos em SVG sincronizados em tempo real com a paleta do modo Claro e Escuro.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Volume Semanal de Vendas
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                R$ 1.337.000,00 na semana
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: chartPalette.primary }}
                />
                Vendas Homologadas
              </span>
            </div>
          </div>

          {/* Gráfico de Barras SVG Dinâmico */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
            <svg
              viewBox="0 0 700 200"
              className="w-full h-48 sm:h-64"
              role="img"
              aria-label="Gráfico semanal de vendas"
            >
              {/* Linhas de Grade de Fundo */}
              <line x1="40" y1="40" x2="680" y2="40" stroke={chartPalette.grid} strokeDasharray="4 4" />
              <line x1="40" y1="90" x2="680" y2="90" stroke={chartPalette.grid} strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="680" y2="140" stroke={chartPalette.grid} strokeDasharray="4 4" />
              <line x1="40" y1="170" x2="680" y2="170" stroke={chartPalette.grid} />

              {/* Barras por Dia */}
              {chartData.map((d, idx) => {
                const barWidth = 44
                const barSpacing = 88
                const x = 70 + idx * barSpacing
                const height = d.valor
                const y = 170 - height

                return (
                  <g key={d.dia} className="transition-all duration-300">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx={6}
                      fill={chartPalette.primary}
                      className="hover:opacity-80 transition cursor-pointer"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fill={chartPalette.axisText}
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {d.valor}k
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y={188}
                      textAnchor="middle"
                      fill={chartPalette.axisText}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {d.dia}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </section>
    </div>
  )
}
