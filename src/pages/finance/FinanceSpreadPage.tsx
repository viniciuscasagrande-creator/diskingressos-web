import React, { useState, useMemo, useEffect, type FormEvent } from 'react'
import {
  Percent, TrendingUp, CreditCard, Building2, CheckCircle2,
  DollarSign, ArrowUpRight, PieChart, BarChart3, ArrowLeft,
  Plus, X, Edit3, Trash2, Copy, SlidersHorizontal, Calculator,
  Sparkles, Check, AlertCircle, RefreshCw, HelpCircle, Layers,
  Wallet, ShieldCheck, Filter, ArrowRight
} from 'lucide-react'

export interface SpreadRateItem {
  id: string
  name: string
  paymentMethod: 'pix' | 'credit_1x' | 'credit_installments' | 'debit' | 'boleto' | 'pos'
  paymentMethodLabel: string
  acquirer: 'cielo' | 'rede' | 'stone' | 'pagbank' | 'efi' | 'mercadopago'
  acquirerLabel: string
  brand: string
  channel: 'todos' | 'web' | 'mobile' | 'pos' | 'sac'
  channelLabel: string
  chargedRatePercent: number
  acquirerMdrPercent: number
  fixedFeeAmount: number
  anticipationPercent: number
  payoutTerm: 'D+0' | 'D+1' | 'D+2' | 'D+14' | 'D+30'
  responsibleParty: 'produtor' | 'comprador' | 'split'
  responsiblePartyLabel: string
  status: 'ativo' | 'homologacao' | 'inativo'
  notes?: string
  createdAt?: string
}

const LOCAL_STORAGE_SPREAD_KEY = 'diskingressos_spread_rates_v1'

const DEFAULT_SPREAD_RATES: SpreadRateItem[] = [
  {
    id: 'spr-1',
    name: 'Cartão de Crédito Parcelado (2x a 6x)',
    paymentMethod: 'credit_installments',
    paymentMethodLabel: 'Cartão Parcelado (2x a 6x)',
    acquirer: 'cielo',
    acquirerLabel: 'Cielo',
    brand: 'Visa / Mastercard / Elo',
    channel: 'todos',
    channelLabel: 'Todos os Canais',
    chargedRatePercent: 8.00,
    acquirerMdrPercent: 2.80,
    fixedFeeAmount: 0.80,
    anticipationPercent: 0.584,
    payoutTerm: 'D+30',
    responsibleParty: 'comprador',
    responsiblePartyLabel: 'Comprador (Conveniência)',
    status: 'ativo',
    notes: 'Spread padrão para parcelamentos curtos no portal e app'
  },
  {
    id: 'spr-2',
    name: 'Cartão de Crédito à Vista (1x)',
    paymentMethod: 'credit_1x',
    paymentMethodLabel: 'Cartão à Vista (1x)',
    acquirer: 'rede',
    acquirerLabel: 'Rede',
    brand: 'Todas as Bandeiras',
    channel: 'todos',
    channelLabel: 'Todos os Canais',
    chargedRatePercent: 4.80,
    acquirerMdrPercent: 2.00,
    fixedFeeAmount: 0.50,
    anticipationPercent: 0,
    payoutTerm: 'D+14',
    responsibleParty: 'produtor',
    responsiblePartyLabel: 'Produtor (Retenção)',
    status: 'ativo',
    notes: 'Taxa negociada com adquirente Rede para crédito à vista'
  },
  {
    id: 'spr-3',
    name: 'Cartão de Crédito Parcelado (7x a 12x Premium)',
    paymentMethod: 'credit_installments',
    paymentMethodLabel: 'Cartão Parcelado (7x a 12x)',
    acquirer: 'stone',
    acquirerLabel: 'Stone',
    brand: 'Visa / Mastercard',
    channel: 'web',
    channelLabel: 'Web / App Online',
    chargedRatePercent: 9.90,
    acquirerMdrPercent: 3.40,
    fixedFeeAmount: 1.00,
    anticipationPercent: 1.20,
    payoutTerm: 'D+30',
    responsibleParty: 'comprador',
    responsiblePartyLabel: 'Comprador (Conveniência)',
    status: 'ativo',
    notes: 'Parcelamento longo com taxa repassada ao comprador'
  },
  {
    id: 'spr-4',
    name: 'PIX Instantâneo Efí / Safra',
    paymentMethod: 'pix',
    paymentMethodLabel: 'PIX Instantâneo',
    acquirer: 'efi',
    acquirerLabel: 'Efí Pix',
    brand: 'PIX Banco Central',
    channel: 'todos',
    channelLabel: 'Todos os Canais',
    chargedRatePercent: 1.50,
    acquirerMdrPercent: 0.40,
    fixedFeeAmount: 0.00,
    anticipationPercent: 0,
    payoutTerm: 'D+0',
    responsibleParty: 'produtor',
    responsiblePartyLabel: 'Produtor (Retenção)',
    status: 'ativo',
    notes: 'Liquidação instantânea D+0 com menor taxa do ecossistema'
  },
  {
    id: 'spr-5',
    name: 'Cartão de Débito Balcão PDV & Online',
    paymentMethod: 'debit',
    paymentMethodLabel: 'Cartão de Débito',
    acquirer: 'pagbank',
    acquirerLabel: 'PagBank',
    brand: 'Todas as Bandeiras',
    channel: 'pos',
    channelLabel: 'POS Físico & Web',
    chargedRatePercent: 3.90,
    acquirerMdrPercent: 1.10,
    fixedFeeAmount: 0.30,
    anticipationPercent: 0,
    payoutTerm: 'D+1',
    responsibleParty: 'produtor',
    responsiblePartyLabel: 'Produtor (Retenção)',
    status: 'ativo',
    notes: 'Débito para maquininhas presenciais e pagamento online'
  },
  {
    id: 'spr-6',
    name: 'Boleto Bancário Registrado',
    paymentMethod: 'boleto',
    paymentMethodLabel: 'Boleto Bancário',
    acquirer: 'rede',
    acquirerLabel: 'Rede',
    brand: 'Boleto Registrado',
    channel: 'web',
    channelLabel: 'Web / Online',
    chargedRatePercent: 4.30,
    acquirerMdrPercent: 1.20,
    fixedFeeAmount: 2.50,
    anticipationPercent: 0,
    payoutTerm: 'D+2',
    responsibleParty: 'produtor',
    responsiblePartyLabel: 'Produtor (Retenção)',
    status: 'ativo',
    notes: 'Compensação bancária D+2 com tarifa por boleto liquidado'
  }
]

const formatMoney = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

const formatPct = (val: number) =>
  `${(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`

interface FormState {
  id?: string
  name: string
  paymentMethod: SpreadRateItem['paymentMethod']
  acquirer: SpreadRateItem['acquirer']
  brand: string
  channel: SpreadRateItem['channel']
  chargedRatePercent: number
  acquirerMdrPercent: number
  fixedFeeAmount: number
  anticipationPercent: number
  payoutTerm: SpreadRateItem['payoutTerm']
  responsibleParty: SpreadRateItem['responsibleParty']
  status: SpreadRateItem['status']
  notes: string
}

const INITIAL_FORM: FormState = {
  name: '',
  paymentMethod: 'credit_installments',
  acquirer: 'cielo',
  brand: 'Todas as Bandeiras',
  channel: 'todos',
  chargedRatePercent: 5.50,
  acquirerMdrPercent: 2.10,
  fixedFeeAmount: 0.50,
  anticipationPercent: 0.584,
  payoutTerm: 'D+30',
  responsibleParty: 'comprador',
  status: 'ativo',
  notes: ''
}

export default function FinanceSpreadPage({
  events = [],
  eventId,
  producerId,
  notify = () => {},
  onBack,
  onNavigate
}: {
  events?: any[]
  eventId?: number | string
  producerId?: number | string
  notify?: (msg: string) => void
  onBack?: () => void
  onNavigate?: (page: any) => void
}) {
  const [rates, setRates] = useState<SpreadRateItem[]>(DEFAULT_SPREAD_RATES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM)
  const [testAmount, setTestAmount] = useState<number>(500.0)
  const [filterMethod, setFilterMethod] = useState<string>('todos')
  const [filterAcquirer, setFilterAcquirer] = useState<string>('todos')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SPREAD_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRates(parsed)
        }
      }
    } catch {
      // fallback to defaults
    }
  }, [])

  // Save to localStorage helper
  const saveRates = (newRates: SpreadRateItem[]) => {
    setRates(newRates)
    try {
      localStorage.setItem(LOCAL_STORAGE_SPREAD_KEY, JSON.stringify(newRates))
    } catch {
      // ignore
    }
  }

  // Calculate live spread and metrics
  const activeRates = useMemo(() => rates.filter(r => r.status === 'ativo'), [rates])

  const calculatedAvgSpread = useMemo(() => {
    if (activeRates.length === 0) return 4.83
    const sum = activeRates.reduce((acc, r) => acc + (r.chargedRatePercent - r.acquirerMdrPercent), 0)
    return sum / activeRates.length
  }, [activeRates])

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingId(null)
    setFormData(INITIAL_FORM)
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEditModal = (rate: SpreadRateItem) => {
    setEditingId(rate.id)
    setFormData({
      id: rate.id,
      name: rate.name,
      paymentMethod: rate.paymentMethod,
      acquirer: rate.acquirer,
      brand: rate.brand,
      channel: rate.channel,
      chargedRatePercent: rate.chargedRatePercent,
      acquirerMdrPercent: rate.acquirerMdrPercent,
      fixedFeeAmount: rate.fixedFeeAmount,
      anticipationPercent: rate.anticipationPercent,
      payoutTerm: rate.payoutTerm,
      responsibleParty: rate.responsibleParty,
      status: rate.status,
      notes: rate.notes || ''
    })
    setIsModalOpen(true)
  }

  // Duplicate rate
  const handleDuplicateRate = (rate: SpreadRateItem) => {
    const duplicated: SpreadRateItem = {
      ...rate,
      id: `spr-${Date.now()}`,
      name: `${rate.name} (Cópia)`
    }
    const updated = [duplicated, ...rates]
    saveRates(updated)
    notify(`Taxa "${duplicated.name}" duplicada com sucesso!`)
  }

  // Toggle active/inactive
  const handleToggleStatus = (id: string) => {
    const updated = rates.map(r =>
      r.id === id
        ? { ...r, status: r.status === 'ativo' ? ('inativo' as const) : ('ativo' as const) }
        : r
    )
    saveRates(updated)
    notify('Status da taxa de spread atualizado!')
  }

  // Delete rate
  const handleDeleteRate = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta taxa de spread?')) {
      const updated = rates.filter(r => r.id !== id)
      saveRates(updated)
      notify('Taxa de spread removida com sucesso.')
    }
  }

  // Method labels mapping
  const getMethodLabel = (m: SpreadRateItem['paymentMethod']) => {
    switch (m) {
      case 'pix': return 'PIX Instantâneo'
      case 'credit_1x': return 'Cartão à Vista (1x)'
      case 'credit_installments': return 'Cartão Parcelado (2x a 12x)'
      case 'debit': return 'Cartão de Débito'
      case 'boleto': return 'Boleto Bancário'
      case 'pos': return 'PDV Físico / Maquininha'
      default: return m
    }
  }

  // Acquirer labels mapping
  const getAcquirerLabel = (a: SpreadRateItem['acquirer']) => {
    switch (a) {
      case 'cielo': return 'Cielo'
      case 'rede': return 'Rede'
      case 'stone': return 'Stone'
      case 'pagbank': return 'PagBank'
      case 'efi': return 'Efí Pix'
      case 'mercadopago': return 'Mercado Pago'
      default: return a
    }
  }

  // Channel labels mapping
  const getChannelLabel = (c: SpreadRateItem['channel']) => {
    switch (c) {
      case 'todos': return 'Todos os Canais'
      case 'web': return 'Web / Online'
      case 'mobile': return 'App Mobile'
      case 'pos': return 'POS Físico'
      case 'sac': return 'Televendas / SAC'
      default: return c
    }
  }

  // Responsible party labels
  const getResponsibleLabel = (r: SpreadRateItem['responsibleParty']) => {
    switch (r) {
      case 'produtor': return 'Produtor (Retenção)'
      case 'comprador': return 'Comprador (Conveniência)'
      case 'split': return 'Split / Misto (50/50)'
      default: return r
    }
  }

  // Handle Form Submit (Create or Update)
  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      notify('Por favor, informe o nome descritivo da taxa de spread.')
      return
    }

    const netSpread = Number((formData.chargedRatePercent - formData.acquirerMdrPercent).toFixed(2))

    if (editingId) {
      // Update
      const updated = rates.map(r => {
        if (r.id === editingId) {
          return {
            ...r,
            name: formData.name.trim(),
            paymentMethod: formData.paymentMethod,
            paymentMethodLabel: getMethodLabel(formData.paymentMethod),
            acquirer: formData.acquirer,
            acquirerLabel: getAcquirerLabel(formData.acquirer),
            brand: formData.brand,
            channel: formData.channel,
            channelLabel: getChannelLabel(formData.channel),
            chargedRatePercent: formData.chargedRatePercent,
            acquirerMdrPercent: formData.acquirerMdrPercent,
            fixedFeeAmount: formData.fixedFeeAmount,
            anticipationPercent: formData.anticipationPercent,
            payoutTerm: formData.payoutTerm,
            responsibleParty: formData.responsibleParty,
            responsiblePartyLabel: getResponsibleLabel(formData.responsibleParty),
            status: formData.status,
            notes: formData.notes
          }
        }
        return r
      })
      saveRates(updated)
      notify(`Taxa "${formData.name}" atualizada com sucesso! Spread de ${netSpread.toFixed(2)}%`)
    } else {
      // Create
      const newRate: SpreadRateItem = {
        id: `spr-${Date.now()}`,
        name: formData.name.trim(),
        paymentMethod: formData.paymentMethod,
        paymentMethodLabel: getMethodLabel(formData.paymentMethod),
        acquirer: formData.acquirer,
        acquirerLabel: getAcquirerLabel(formData.acquirer),
        brand: formData.brand,
        channel: formData.channel,
        channelLabel: getChannelLabel(formData.channel),
        chargedRatePercent: formData.chargedRatePercent,
        acquirerMdrPercent: formData.acquirerMdrPercent,
        fixedFeeAmount: formData.fixedFeeAmount,
        anticipationPercent: formData.anticipationPercent,
        payoutTerm: formData.payoutTerm,
        responsibleParty: formData.responsibleParty,
        responsiblePartyLabel: getResponsibleLabel(formData.responsibleParty),
        status: formData.status,
        notes: formData.notes,
        createdAt: new Date().toLocaleDateString('pt-BR')
      }
      saveRates([newRate, ...rates])
      notify(`Nova taxa de spread adicionada! Margem líquida calculada: ${netSpread.toFixed(2)}%`)
    }

    setIsModalOpen(false)
  }

  // Filtered list
  const filteredRates = useMemo(() => {
    return rates.filter(r => {
      if (filterMethod !== 'todos' && r.paymentMethod !== filterMethod) return false
      if (filterAcquirer !== 'todos' && r.acquirer !== filterAcquirer) return false
      return true
    })
  }, [rates, filterMethod, filterAcquirer])

  // In-modal live preview calculations
  const modalNetSpreadPercent = Number((formData.chargedRatePercent - formData.acquirerMdrPercent).toFixed(2))
  const modalSimMdrAmount = testAmount * (formData.acquirerMdrPercent / 100)
  const modalSimChargedAmount = testAmount * (formData.chargedRatePercent / 100) + formData.fixedFeeAmount
  const modalSimSpreadProfit = modalSimChargedAmount - modalSimMdrAmount
  const modalSimProducerNet = testAmount - (formData.responsibleParty === 'produtor' ? modalSimChargedAmount : modalSimMdrAmount)

  return (
    <div className="space-y-5 text-slate-100 font-sans pb-10">
      
      {/* Top Bar / Navigation */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={() => (onBack ? onBack() : onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#131b2e] hover:bg-[#1e293b] text-slate-200 border border-[#283548] transition cursor-pointer shadow-xs"
        >
          <ArrowLeft size={14} className="text-[#FF8047]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>

        <button
          onClick={() => {
            saveRates(DEFAULT_SPREAD_RATES)
            notify('Taxas de spread restauradas para a calibração padrão!')
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#131b2e] hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 border border-[#283548] transition cursor-pointer"
          title="Restaurar taxas originais do sistema"
        >
          <RefreshCw size={13} />
          <span>Restaurar Padrão</span>
        </button>
      </div>

      {/* Header Card com Botão de Destaque para Adicionar Taxa de Spread */}
      <div className="bg-[#131b2e] border border-[#1e293b] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-md">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF8047]">
              <Percent size={18} />
            </div>
            <span>Financeiro Spread & Adquirentes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Análise de receitas, tarifas retidas, custos de adquirentes e rentabilidade líquida do ecossistema de pagamentos
          </p>
        </div>

        {/* BOTOES DE AÇÃO */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate ? onNavigate('finance-spread-simulator') : null}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1e293b] hover:bg-[#283548] text-slate-300 hover:text-white border border-[#334155] transition cursor-pointer shadow-xs"
          >
            <Calculator size={15} className="text-sky-400" />
            <span>Simulador Avançado</span>
          </button>

          {/* BOTÃO SOLICITADO: ADICIONAR TAXA DE SPREAD COMPLETO */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#FF8047] hover:bg-[#ff9466] text-white shadow-md hover:shadow-orange-500/20 transition-all transform active:scale-98 cursor-pointer"
            data-testid="btn-add-spread-rate"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Adicionar Taxa de Spread</span>
          </button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#131b2e] border border-[#1e293b] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Volume Processado</span>
          <h3 className="text-lg font-black text-white mt-1 font-mono">R$ 8.540.000</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +8.2% vs mês anterior
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Receita de Taxas</span>
          <h3 className="text-lg font-black text-white mt-1 font-mono">R$ 412.800</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +5.4% vs mês anterior
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Spread Médio</span>
          <h3 className="text-lg font-black text-sky-400 mt-1 font-mono">
            {formatPct(calculatedAvgSpread)}
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            {activeRates.length} taxa(s) ativas calibradas
          </span>
        </div>

        <div className="bg-[#131b2e] border border-[#1e293b] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Lucro Líquido</span>
          <h3 className="text-lg font-black text-emerald-400 mt-1 font-mono">R$ 231.540</h3>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={13} /> +9.1% margem de lucro
          </span>
        </div>
      </div>

      {/* Analysis Grid: Methods vs Acquirers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Spread por Meio de Pagamento */}
        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-[#1e293b] pb-2 flex items-center gap-2">
            <CreditCard size={16} className="text-sky-400" />
            <span>Spread por Meio de Pagamento</span>
          </h3>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">PIX</span>
                <span className="font-mono font-bold text-emerald-400">1,10% (R$ 93.940)</span>
              </div>
              <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Cartão de Crédito</span>
                <span className="font-mono font-bold text-rose-400">5,20% (R$ 225.400)</span>
              </div>
              <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '55%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Cartão de Débito</span>
                <span className="font-mono font-bold text-amber-400">2,80% (R$ 51.240)</span>
              </div>
              <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Boleto Bancário</span>
                <span className="font-mono font-bold text-sky-400">3,10% (R$ 42.220)</span>
              </div>
              <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Spread por Adquirente */}
        <div className="bg-[#131b2e] border border-[#1e293b] p-5 rounded-2xl space-y-4 shadow-sm text-xs">
          <h3 className="font-bold text-sm text-white border-b border-[#1e293b] pb-2 flex items-center gap-2">
            <Building2 size={16} className="text-purple-400" />
            <span>Spread por Adquirente</span>
          </h3>

          <div className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Cielo</span>
                <span className="font-mono font-bold text-sky-400">5,20%</span>
              </div>
              <div className="h-2.5 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Rede</span>
                <span className="font-mono font-bold text-sky-400">4,80%</span>
              </div>
              <div className="h-2.5 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">Stone</span>
                <span className="font-mono font-bold text-emerald-400">4,50% (Melhor Taxa)</span>
              </div>
              <div className="h-2.5 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-200">PagBank</span>
                <span className="font-mono font-bold text-sky-400">4,20%</span>
              </div>
              <div className="h-2.5 bg-[#0f172a] rounded-full overflow-hidden border border-[#1e293b]">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '64%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NOVA SEÇÃO COMPLETA: TABELA DE TAXAS DE SPREAD CONFIGURADAS & VIGENTES
          ========================================================================= */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl shadow-md overflow-hidden">
        {/* Barra de Título & Filtros da Tabela */}
        <div className="p-4 sm:p-5 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 bg-[#111724]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Taxas de Spread Configuradas & Vigentes
              </h3>
              <p className="text-xs text-slate-400">
                Gerencie regras de precificação, margens retidas por adquirente e responsabilidade de repasse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtro Meio */}
            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              className="bg-[#151c27] text-slate-200 border border-[#283548] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
            >
              <option value="todos">Todos os Meios</option>
              <option value="pix">PIX Instantâneo</option>
              <option value="credit_1x">Cartão à Vista (1x)</option>
              <option value="credit_installments">Cartão Parcelado</option>
              <option value="debit">Cartão de Débito</option>
              <option value="boleto">Boleto Bancário</option>
            </select>

            {/* Filtro Adquirente */}
            <select
              value={filterAcquirer}
              onChange={e => setFilterAcquirer(e.target.value)}
              className="bg-[#151c27] text-slate-200 border border-[#283548] rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
            >
              <option value="todos">Todas as Adquirentes</option>
              <option value="cielo">Cielo</option>
              <option value="rede">Rede</option>
              <option value="stone">Stone</option>
              <option value="pagbank">PagBank</option>
              <option value="efi">Efí Pix</option>
            </select>

            {/* Botão Adicionar Taxa */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF8047] hover:bg-[#ff9466] text-white shadow-xs transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Nova Taxa</span>
            </button>
          </div>
        </div>

        {/* Tabela de Taxas */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-[#1e293b]">
            <thead className="bg-[#0f172a] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-5">Regra / Meio de Pagamento</th>
                <th className="py-3 px-4">Adquirente</th>
                <th className="py-3 px-4 text-center">Taxa Cobrada</th>
                <th className="py-3 px-4 text-center">Custo MDR</th>
                <th className="py-3 px-4 text-center">Spread Líquido</th>
                <th className="py-3 px-4 text-center">Tarifa Fixa</th>
                <th className="py-3 px-4">Repasse / Quem Paga</th>
                <th className="py-3 px-4 text-center">Prazo D+</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Nenhuma taxa de spread encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRates.map(r => {
                  const netSpread = Number((r.chargedRatePercent - r.acquirerMdrPercent).toFixed(2))
                  const isHealthy = netSpread >= 2.0

                  return (
                    <tr key={r.id} className="hover:bg-[#151c27] transition">
                      <td className="py-3 px-5">
                        <div className="flex flex-col">
                          <strong className="text-white text-xs font-bold flex items-center gap-1.5">
                            {r.name}
                          </strong>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {r.paymentMethodLabel} • {r.brand}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-300">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1e293b] border border-[#334155] text-slate-200 text-[11px]">
                          <Building2 size={12} className="text-purple-400" />
                          {r.acquirerLabel}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                        {formatPct(r.chargedRatePercent)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {formatPct(r.acquirerMdrPercent)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] border ${
                          isHealthy
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60'
                            : 'bg-amber-950/80 text-amber-400 border-amber-700/60'
                        }`}>
                          <Sparkles size={11} />
                          +{formatPct(netSpread)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {r.fixedFeeAmount > 0 ? formatMoney(r.fixedFeeAmount) : '-'}
                      </td>

                      <td className="py-3 px-4 text-slate-300 text-[11px]">
                        {r.responsiblePartyLabel}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
                          {r.payoutTerm}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(r.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition ${
                            r.status === 'ativo'
                              ? 'bg-emerald-900/40 text-emerald-400 border-emerald-600/50 hover:bg-emerald-800/50'
                              : 'bg-rose-900/40 text-rose-400 border-rose-600/50 hover:bg-rose-800/50'
                          }`}
                          title="Clique para alternar status"
                        >
                          ● {r.status === 'ativo' ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>

                      <td className="py-3 px-5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(r)}
                            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Editar Taxa"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicateRate(r)}
                            className="p-1.5 rounded-md hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                            title="Duplicar Taxa"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRate(r.id)}
                            className="p-1.5 rounded-md hover:bg-rose-900/40 text-rose-400 hover:text-rose-200 transition cursor-pointer"
                            title="Remover Taxa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL COMPLETO: ADICIONAR / EDITAR TAXA DE SPREAD
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div
            className="bg-[#111827] border border-[#1e293b] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            data-testid="modal-spread-rate"
          >
            {/* Cabeçalho do Modal */}
            <div className="p-4 sm:p-5 border-b border-[#1e293b] bg-[#151c27] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#FF8047]">
                  <Percent size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingId ? 'Editar Taxa de Spread' : 'Adicionar Nova Taxa de Spread'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Parametrize precificação de spread, tarifas de adquirentes e margem retida
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#1e293b] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* BLOCO 1: Identificação & Meio */}
              <div className="space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-sky-400" />
                  1. Identificação & Meio de Pagamento
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome da Regra de Spread *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Spread Cartão de Crédito 1x a 6x Nacional"
                    className="w-full bg-[#151c27] text-white px-3.5 py-2.5 text-xs rounded-xl border border-[#283548] focus:outline-hidden focus:border-[#FF8047]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Meio de Pagamento *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="credit_installments">Cartão de Crédito Parcelado</option>
                      <option value="credit_1x">Cartão de Crédito à Vista (1x)</option>
                      <option value="pix">PIX Instantâneo</option>
                      <option value="debit">Cartão de Débito</option>
                      <option value="boleto">Boleto Bancário</option>
                      <option value="pos">PDV / Maquininha Presencial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Adquirente Parceira *
                    </label>
                    <select
                      value={formData.acquirer}
                      onChange={e => setFormData({ ...formData, acquirer: e.target.value as any })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="cielo">Cielo</option>
                      <option value="rede">Rede</option>
                      <option value="stone">Stone</option>
                      <option value="pagbank">PagBank</option>
                      <option value="efi">Efí Pix</option>
                      <option value="mercadopago">Mercado Pago</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Bandeiras Aplicáveis
                    </label>
                    <select
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="Todas as Bandeiras">Todas as Bandeiras</option>
                      <option value="Visa">Somente Visa</option>
                      <option value="Mastercard">Somente Mastercard</option>
                      <option value="Elo">Somente Elo</option>
                      <option value="Hipercard">Somente Hipercard</option>
                      <option value="Amex">Somente American Express</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Canal de Venda
                    </label>
                    <select
                      value={formData.channel}
                      onChange={e => setFormData({ ...formData, channel: e.target.value as any })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="todos">Todos os Canais (Omnichannel)</option>
                      <option value="web">Web / Portal Oficial</option>
                      <option value="mobile">App Mobile</option>
                      <option value="pos">POS Físico / Bilheteria</option>
                      <option value="sac">Televendas / SAC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Status da Taxa
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="ativo">Ativa (Vigente)</option>
                      <option value="homologacao">Em Homologação</option>
                      <option value="inativo">Inativa / Suspensa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: Parâmetros de Precificação & MDR */}
              <div className="space-y-3.5 pt-3 border-t border-[#1e293b]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-emerald-400" />
                  2. Parâmetros de Precificação, MDR & Repasse
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Taxa Cobrada (%) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        value={formData.chargedRatePercent}
                        onChange={e => setFormData({ ...formData, chargedRatePercent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#151c27] text-white pl-3 pr-8 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Taxa bruta total cobrada</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Custo MDR Adquirente (%) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        value={formData.acquirerMdrPercent}
                        onChange={e => setFormData({ ...formData, acquirerMdrPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#151c27] text-white pl-3 pr-8 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Taxa retida pela adquirente</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Tarifa Fixa (R$)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        value={formData.fixedFeeAmount}
                        onChange={e => setFormData({ ...formData, fixedFeeAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#151c27] text-white pl-3 pr-8 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 font-bold">R$</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Custo fixo por transação</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Prazo de Liquidação (D+)
                    </label>
                    <select
                      value={formData.payoutTerm}
                      onChange={e => setFormData({ ...formData, payoutTerm: e.target.value as any })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="D+0">D+0 (Instantâneo)</option>
                      <option value="D+1">D+1 (1 dia útil)</option>
                      <option value="D+2">D+2 (2 dias úteis)</option>
                      <option value="D+14">D+14 (14 dias corridos)</option>
                      <option value="D+30">D+30 (30 dias corridos)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Taxa de Antecipação (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={formData.anticipationPercent}
                        onChange={e => setFormData({ ...formData, anticipationPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#151c27] text-white pl-3 pr-8 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden font-mono"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Custo de antecipação de fluxo</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Responsável pelo Custo
                    </label>
                    <select
                      value={formData.responsibleParty}
                      onChange={e => setFormData({ ...formData, responsibleParty: e.target.value as any })}
                      className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                    >
                      <option value="comprador">Comprador (Conveniência)</option>
                      <option value="produtor">Produtor (Desconto Repasse)</option>
                      <option value="split">Split / Dividido 50/50</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Observações Comerciais / Justificativa
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Acordo especial firmado com a adquirente para festivais e grandes turnês"
                    className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-xl border border-[#283548] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* BLOCO 3: Cálculo Automático do Spread em Tempo Real */}
              <div className="p-4 rounded-xl bg-[#0f172a] border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Spread Líquido Calculado (Margem Disk)
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black font-mono text-[#FF8047]">
                      {modalNetSpreadPercent >= 0 ? `+${modalNetSpreadPercent.toFixed(2)}%` : `${modalNetSpreadPercent.toFixed(2)}%`}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      modalNetSpreadPercent >= 3.0
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-600/60'
                        : modalNetSpreadPercent >= 1.5
                        ? 'bg-blue-950 text-blue-400 border-blue-600/60'
                        : modalNetSpreadPercent > 0
                        ? 'bg-amber-950 text-amber-400 border-amber-600/60'
                        : 'bg-rose-950 text-rose-400 border-rose-600/60'
                    }`}>
                      {modalNetSpreadPercent >= 3.0
                        ? 'Margem Excelente 🟢'
                        : modalNetSpreadPercent >= 1.5
                        ? 'Margem Saudável 🔵'
                        : modalNetSpreadPercent > 0
                        ? 'Margem Moderada 🟡'
                        : 'Margem Negativa / Risco 🔴'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Fórmula: Taxa Cobrada ({formData.chargedRatePercent.toFixed(2)}%) − Custo Adquirente ({formData.acquirerMdrPercent.toFixed(2)}%)
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-[#1e293b] sm:pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa Fixa Aplicada</span>
                  <span className="text-sm font-mono font-bold text-slate-200">
                    {formData.fixedFeeAmount > 0 ? `+ ${formatMoney(formData.fixedFeeAmount)} / pedido` : 'Isenta'}
                  </span>
                </div>
              </div>

              {/* BLOCO 4: Mini-Simulador de Venda de Exemplo */}
              <div className="p-4 rounded-xl bg-[#151c27] border border-[#283548] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calculator size={14} className="text-sky-400" />
                    Simulação de Exemplo em Tempo Real
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold">Valor da Venda:</span>
                    <input
                      type="number"
                      step="10"
                      min="1"
                      value={testAmount}
                      onChange={e => setTestAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-24 bg-[#0f172a] text-white px-2 py-1 text-xs rounded-lg border border-[#334155] text-right font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e293b]">
                    <span className="text-slate-400 block">Taxa Bruta:</span>
                    <strong className="text-slate-200 font-mono">{formatMoney(modalSimChargedAmount)}</strong>
                  </div>
                  <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e293b]">
                    <span className="text-slate-400 block">Custo MDR Adquirente:</span>
                    <strong className="text-rose-400 font-mono">-{formatMoney(modalSimMdrAmount)}</strong>
                  </div>
                  <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e293b]">
                    <span className="text-slate-400 block">Lucro Líquido Spread:</span>
                    <strong className="text-emerald-400 font-mono font-bold">+{formatMoney(modalSimSpreadProfit)}</strong>
                  </div>
                  <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#1e293b]">
                    <span className="text-slate-400 block">Repasse ao Produtor:</span>
                    <strong className="text-sky-400 font-mono">{formatMoney(modalSimProducerNet)}</strong>
                  </div>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1e293b] hover:bg-[#283548] text-slate-300 hover:text-white border border-[#334155] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#FF8047] hover:bg-[#ff9466] text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
                  data-testid="btn-save-spread-rate"
                >
                  <Check size={16} />
                  <span>{editingId ? 'Salvar Alterações' : 'Salvar Taxa de Spread'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
