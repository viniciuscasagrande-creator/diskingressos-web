import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowDownLeft, ArrowUpRight, Banknote, Building2, CalendarDays,
  CheckCircle2, CircleDollarSign, Download, Landmark, Plus, RefreshCw, Search,
  Star, WalletCards, X, ArrowLeft, ReceiptText, HandCoins, CreditCard, SlidersHorizontal
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createFinanceBankAccount, createFinanceExpense, getFinanceBankAccounts,
  getFinanceCashSummary, getFinanceCashTransactions, getFinanceExpenses,
  payFinanceExpense, setFinancePrimaryBankAccount, updateFinanceBankAccount,
  updateFinanceExpense,
  type FinanceBankAccount, type FinanceCashSummary, type FinanceExpense,
  type FinanceTransaction
} from '../services/api'
import { consumeFinanceDrilldown, navigateWithFinanceDrilldown } from '../utils/financeDrilldown'

type Mode = 'balance' | 'statement' | 'expenses' | 'bank-accounts'
type Props = {
  mode: Mode
  events: EventItem[]
  producerId?: number
  notify?: (message: string) => void
  onNavigate?: (page: any) => void
}

const money = (c = 0) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const date = (v?: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : '—'

export default function FinanceCashOperationsPage({ mode, events, producerId, notify, onNavigate }: Props) {
  const [eventId, setEventId] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState<FinanceCashSummary | null>(null)
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [expenses, setExpenses] = useState<FinanceExpense[]>([])
  const [accounts, setAccounts] = useState<FinanceBankAccount[]>([])
  const [search, setSearch] = useState('')
  const [drilldown] = useState(() => consumeFinanceDrilldown(
    mode === 'balance' ? 'finance' :
    mode === 'statement' ? 'finance-statement' :
    mode === 'expenses' ? 'finance-expenses' : 'finance-bank-accounts'
  ))

  const flash = (m: string) => notify?.(m)
  const selectedEventName = events.find(ev => ev.id === eventId)?.title
  const openCashPage = (page: any, label: string, status?: string) => {
    if (!onNavigate) return
    navigateWithFinanceDrilldown(onNavigate, page, {
      label,
      status,
      eventName: selectedEventName,
      source: 'finance-cash-center'
    })
  }

  useEffect(() => {
    if (!drilldown?.eventName || eventId) return
    const match = events.find(ev => ev.title === drilldown.eventName)
    if (match) setEventId(match.id)
  }, [drilldown, events, eventId])

  async function load() {
    setLoading(true); setError('')
    try {
      const [s, tx, ex, ba] = await Promise.all([
        getFinanceCashSummary(producerId, eventId),
        getFinanceCashTransactions(producerId, eventId),
        getFinanceExpenses(producerId, eventId),
        getFinanceBankAccounts(producerId)
      ])
      setSummary(s); setTransactions(tx); setExpenses(ex); setAccounts(ba)
    } catch (e: any) {
      setError(e.message || 'Não foi possível carregar as operações de caixa.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [producerId, eventId])

  const title = mode === 'balance' ? 'Saldo & Disponibilidade' : mode === 'statement' ? 'Extrato Financeiro' : mode === 'expenses' ? 'Despesas Operacionais' : 'Contas Bancárias'
  const subtitle = mode === 'balance'
    ? 'Saldo real por produtora e evento, recebíveis futuros, valores comprometidos e acesso aos repasses.'
    : mode === 'statement'
      ? 'Movimentações financeiras auditáveis: entradas, saídas, vendas, taxas, despesas, estornos e repasses.'
      : mode === 'expenses'
        ? 'Cadastro, vencimento, liquidação e rastreabilidade das despesas operacionais por evento.'
        : 'Contas verificadas usadas para repasses e liquidações financeiras.'

  return <div className="cashops-page">
    <div className="flex items-center gap-2 mb-3">
      <button
        onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
      >
        <ArrowLeft size={14} className="text-[#06B6D4]" />
        <span>Voltar ao Dashboard Financeiro</span>
      </button>
    </div>
    <header className="finance-header-section card-surface cashops-head">
      <div className="finance-header-left">
        <span className="eyebrow">FINANCEIRO · OPERAÇÕES DE CAIXA</span>
        <div className="finance-title-row"><h1>{title}</h1><span className="pipeline-status-badge"><CheckCircle2 size={13}/> API + Banco</span></div>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="finance-header-controls">
        {mode !== 'bank-accounts' && <div className="finance-select-group"><span>Evento</span><select value={eventId ?? ''} onChange={e=>setEventId(e.target.value?Number(e.target.value):undefined)}><option value="">Todos os eventos</option>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.title}</option>)}</select></div>}
        <button className="tool-btn" onClick={load}><RefreshCw size={15}/> Atualizar</button>
        {mode === 'balance' && <button className="primary-btn" onClick={()=>onNavigate?.('finance-payouts')}><Banknote size={16}/> Solicitar Repasse</button>}
      </div>
    </header>

    <nav className="finance-cash-center-nav" aria-label="Central de Saldo, Extrato e Movimentações">
      <button type="button" className={mode === 'balance' ? 'active' : ''} onClick={()=>openCashPage('finance','Saldo')}><WalletCards size={15}/><span>Saldo</span></button>
      <button type="button" className={mode === 'statement' ? 'active' : ''} onClick={()=>openCashPage('finance-statement','Extrato & Movimentações')}><ReceiptText size={15}/><span>Extrato & Movimentações</span></button>
      <button type="button" onClick={()=>openCashPage('finance-receivables','Recebíveis','open')}><CircleDollarSign size={15}/><span>Recebíveis</span></button>
      <button type="button" onClick={()=>openCashPage('finance-payouts','Repasses')}><HandCoins size={15}/><span>Repasses</span></button>
      <button type="button" className={mode === 'expenses' ? 'active' : ''} onClick={()=>openCashPage('finance-expenses','Despesas')}><CreditCard size={15}/><span>Despesas</span></button>
      <button type="button" className={mode === 'bank-accounts' ? 'active' : ''} onClick={()=>openCashPage('finance-bank-accounts','Contas Bancárias')}><Landmark size={15}/><span>Contas Bancárias</span></button>
    </nav>

    {drilldown?.label && <div className="finance-cash-context"><SlidersHorizontal size={14}/><span>Contexto: <strong>{drilldown.label}</strong>{drilldown.eventName ? ` · ${drilldown.eventName}` : ''}</span></div>}

    {error && <div className="finance360-alert error"><AlertTriangle size={18}/>{error}</div>}
    {loading && <div className="finance360-loading">Carregando dados financeiros...</div>}

    {!loading && mode === 'balance' && <BalanceView summary={summary} onNavigate={onNavigate}/>} 
    {!loading && mode === 'statement' && <StatementView rows={transactions} search={search} setSearch={setSearch} flash={flash}/>} 
    {!loading && mode === 'expenses' && <ExpensesView rows={expenses} events={events} producerId={producerId} defaultEventId={eventId} reload={load} flash={flash}/>} 
    {!loading && mode === 'bank-accounts' && <BankAccountsView rows={accounts} producerId={producerId} reload={load} flash={flash} onNavigate={onNavigate}/>} 
  </div>
}

function BalanceView({ summary, onNavigate }: { summary: FinanceCashSummary | null, onNavigate?: (page:any)=>void }) {
  return <>
    <section className="finance-kpis-grid">
      <Kpi icon={<WalletCards size={22}/>} label="Saldo Disponível" value={money(summary?.availableCents)} note="Liquidação confirmada" />
      <Kpi icon={<CalendarDays size={22}/>} label="Saldo Futuro" value={money(summary?.futureCents)} note="Recebíveis em aberto" />
      <Kpi icon={<Banknote size={22}/>} label="Repasses Pendentes" value={money(summary?.pendingPayoutCents)} note="Solicitado / aprovado" />
      <Kpi icon={<ArrowUpRight size={22}/>} label="Despesas em Aberto" value={money(summary?.expensesOpenCents)} note="Ainda não liquidadas" />
    </section>
    <section className="finance-table-section card-surface">
      <div className="table-header-tabs"><div className="card-heading"><div><h3>Saldo por Evento</h3><p>Valores calculados diretamente das movimentações e obrigações financeiras.</p></div></div></div>
      <div className="finance360-table-wrap"><table><thead><tr><th>Evento</th><th>Entradas</th><th>Saídas</th><th>Disponível</th><th>A Receber</th><th>Pendente</th><th>Ação</th></tr></thead><tbody>
        {(summary?.events || []).map(r=><tr key={r.eventId ?? 'global'}><td><strong>{r.eventName}</strong></td><td>{money(r.entriesCents)}</td><td>{money(r.exitsCents)}</td><td><strong>{money(r.availableCents)}</strong></td><td>{money(r.receivableCents)}</td><td>{money(r.pendingCents)}</td><td><button className="fa-btn tiny" onClick={()=>onNavigate?.('finance-statement')}>Ver extrato</button></td></tr>)}
      </tbody></table></div>
      {!summary?.events?.length && <div className="finops360-empty">Ainda não existem eventos com movimentação financeira neste escopo.</div>}
    </section>
  </>
}

function Kpi({icon,label,value,note}:{icon:React.ReactNode;label:string;value:string;note:string}){return <article className="finance-kpi-card card-surface"><div className="kpi-icon-wrap">{icon}</div><div className="kpi-body"><span className="kpi-label">{label}</span><strong className="kpi-value">{value}</strong><div className="kpi-footer"><small>{note}</small></div></div></article>}

function StatementView({ rows, search, setSearch, flash }:{rows:FinanceTransaction[];search:string;setSearch:(v:string)=>void;flash:(m:string)=>void}){
  const [typeFilter,setTypeFilter]=useState<'all'|'entrada'|'saida'>('all')
  const [statusFilter,setStatusFilter]=useState('all')
  const [categoryFilter,setCategoryFilter]=useState('all')
  const categories=useMemo(()=>Array.from(new Set(rows.map(r=>r.category).filter(Boolean))).sort(),[rows])
  const filtered=useMemo(()=>rows.filter(r=>{
    const text=`${r.code} ${r.description} ${r.category} ${r.event?.title||''}`.toLowerCase()
    if(!text.includes(search.toLowerCase())) return false
    if(typeFilter!=='all' && r.type!==typeFilter) return false
    if(statusFilter!=='all' && r.status!==statusFilter) return false
    if(categoryFilter!=='all' && r.category!==categoryFilter) return false
    return true
  }),[rows,search,typeFilter,statusFilter,categoryFilter])
  const entries=filtered.filter(r=>r.type==='entrada'&&r.status==='liquidado').reduce((a,r)=>a+r.amountCents,0), exits=filtered.filter(r=>r.type==='saida'&&r.status==='liquidado').reduce((a,r)=>a+r.amountCents,0)
  function exportCsv(){const head='Código;Data;Tipo;Categoria;Descrição;Evento;Status;Valor\n';const body=filtered.map(r=>[r.code,date(r.occurredAt),r.type,r.category,`"${r.description.replaceAll('"','""')}"`,`"${r.event?.title||''}"`,r.status,(r.amountCents/100).toFixed(2).replace('.',',')].join(';')).join('\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+head+body],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`extrato_financeiro_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);flash('Extrato exportado em CSV.')}
  return <>
    <section className="finance-kpis-grid"><Kpi icon={<ArrowDownLeft size={22}/>} label="Entradas Liquidadas" value={money(entries)} note={`${filtered.filter(r=>r.type==='entrada').length} movimentos`}/><Kpi icon={<ArrowUpRight size={22}/>} label="Saídas Liquidadas" value={money(exits)} note={`${filtered.filter(r=>r.type==='saida').length} movimentos`}/><Kpi icon={<CircleDollarSign size={22}/>} label="Saldo do Período" value={money(entries-exits)} note="Entradas - saídas"/><Kpi icon={<ReceiptText size={22}/>} label="Movimentações" value={String(filtered.length)} note="Após filtros aplicados"/></section>
    <section className="finance-table-section card-surface">
      <div className="cashops-filterbar">
        <div className="small-search"><Search size={14}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar código, evento, categoria..."/></div>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as any)} aria-label="Filtrar por tipo"><option value="all">Todos os tipos</option><option value="entrada">Entradas</option><option value="saida">Saídas</option></select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filtrar por status"><option value="all">Todos os status</option><option value="liquidado">Liquidado</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option><option value="estornado">Estornado</option></select>
        <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} aria-label="Filtrar por categoria"><option value="all">Todas as categorias</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
        <button className="tool-btn" onClick={exportCsv}><Download size={15}/> Exportar CSV</button>
      </div>
      <div className="finance360-table-wrap"><table><thead><tr><th>Transação</th><th>Data</th><th>Evento</th><th>Categoria</th><th>Descrição</th><th>Status</th><th>Valor</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>{r.code}</strong></td><td>{date(r.occurredAt)}</td><td>{r.event?.title||'Geral'}</td><td>{r.category}</td><td>{r.description}</td><td><span className={`fa-status ${r.status}`}>{r.status}</span></td><td><strong className={r.type==='entrada'?'cashops-positive':'cashops-negative'}>{r.type==='entrada'?'+ ':'- '}{money(r.amountCents)}</strong></td></tr>)}</tbody></table></div>{!filtered.length&&<div className="finops360-empty">Nenhuma movimentação encontrada com os filtros atuais.</div>}
    </section>
  </>
}

function ExpensesView({rows,events,producerId,defaultEventId,reload,flash}:{rows:FinanceExpense[];events:EventItem[];producerId?:number;defaultEventId?:number;reload:()=>Promise<void>;flash:(m:string)=>void}){
  const [open,setOpen]=useState(false);const [saving,setSaving]=useState(false);const [form,setForm]=useState({category:'Operacional',description:'',amount:'',dueDate:new Date().toISOString().slice(0,10),counterparty:'',documentRef:'',eventId:defaultEventId?String(defaultEventId):''})
  async function submit(e:React.FormEvent){e.preventDefault();const cents=Math.round(Number(form.amount)*100);if(!cents||!form.description.trim())return flash('Informe descrição e valor válido.');setSaving(true);try{await createFinanceExpense({category:form.category,description:form.description.trim(),amountCents:cents,dueDate:form.dueDate,counterparty:form.counterparty||undefined,documentRef:form.documentRef||undefined,eventId:form.eventId?Number(form.eventId):undefined,producerId});flash('Despesa cadastrada.');setOpen(false);setForm({...form,description:'',amount:'',counterparty:'',documentRef:''});await reload()}catch(e:any){flash(e.message||'Erro ao cadastrar despesa.')}finally{setSaving(false)}}
  async function pay(id:number){try{await payFinanceExpense(id);flash('Despesa liquidada e registrada no extrato.');await reload()}catch(e:any){flash(e.message||'Erro ao pagar despesa.')}}
  async function cancel(id:number){try{await updateFinanceExpense(id,{status:'cancelado'});flash('Despesa cancelada.');await reload()}catch(e:any){flash(e.message||'Erro ao cancelar despesa.')}}
  const openC=rows.filter(r=>!['pago','cancelado'].includes(r.status)).reduce((a,r)=>a+r.amountCents,0),paid=rows.filter(r=>r.status==='pago').reduce((a,r)=>a+r.amountCents,0)
  return <>
    <section className="finance-kpis-grid"><Kpi icon={<CalendarDays size={22}/>} label="Em Aberto" value={money(openC)} note="Obrigações a liquidar"/><Kpi icon={<CheckCircle2 size={22}/>} label="Pago" value={money(paid)} note="Impacta o saldo e extrato"/></section>
    <section className="finance-table-section card-surface"><div className="table-header-tabs"><div className="card-heading"><div><h3>Despesas</h3><p>Obrigações financeiras com vínculo opcional ao evento.</p></div></div><button className="primary-btn" onClick={()=>setOpen(true)}><Plus size={15}/> Nova Despesa</button></div><div className="finance360-table-wrap"><table><thead><tr><th>Código</th><th>Evento</th><th>Descrição</th><th>Favorecido</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><strong>{r.code}</strong></td><td>{r.event?.title||'Geral'}</td><td>{r.description}<small>{r.category}</small></td><td>{r.counterparty||'—'}</td><td>{date(r.dueDate)}</td><td><strong>{money(r.amountCents)}</strong></td><td><span className={`fa-status ${r.status}`}>{r.status}</span></td><td><div className="fa-actions">{!['pago','cancelado'].includes(r.status)&&<button className="fa-btn tiny primary" onClick={()=>pay(r.id)}>Pagar</button>}{!['pago','cancelado'].includes(r.status)&&<button className="fa-btn tiny" onClick={()=>cancel(r.id)}>Cancelar</button>}</div></td></tr>)}</tbody></table></div>{!rows.length&&<div className="finops360-empty">Nenhuma despesa cadastrada.</div>}</section>
    {open&&<div className="utm-modal-backdrop" onClick={()=>setOpen(false)}><div className="utm-modal-card wide" onClick={e=>e.stopPropagation()}><div className="utm-modal-head"><div><span className="eyebrow">OPERAÇÕES DE CAIXA</span><h3>Nova Despesa</h3></div><button className="icon-action" onClick={()=>setOpen(false)}><X size={18}/></button></div><form onSubmit={submit} className="cashops-form"><label>Descrição *<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></label><label>Categoria<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Operacional</option><option>Fornecedor</option><option>Produção</option><option>Marketing</option><option>Logística</option><option>Taxas</option></select></label><label>Valor (R$) *<input type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></label><label>Vencimento *<input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} required/></label><label>Evento<select value={form.eventId} onChange={e=>setForm({...form,eventId:e.target.value})}><option value="">Geral / sem evento</option>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.title}</option>)}</select></label><label>Favorecido<input value={form.counterparty} onChange={e=>setForm({...form,counterparty:e.target.value})}/></label><label>Documento / referência<input value={form.documentRef} onChange={e=>setForm({...form,documentRef:e.target.value})}/></label><div className="cashops-form-actions"><button type="button" className="tool-btn" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving?'Salvando...':'Cadastrar Despesa'}</button></div></form></div></div>}
  </>
}

function BankAccountsView({rows,producerId,reload,flash,onNavigate}:{rows:FinanceBankAccount[];producerId?:number;reload:()=>Promise<void>;flash:(m:string)=>void;onNavigate?:(page:any)=>void}){
  const [open,setOpen]=useState(false);const [saving,setSaving]=useState(false);const [form,setForm]=useState({bankCode:'341',bankName:'Banco Itaú S.A.',agency:'',accountNumber:'',accountType:'corrente',holderName:'',holderDocument:'',pixType:'CNPJ',pixKey:'',isPrimary:false})
  async function submit(e:React.FormEvent){e.preventDefault();setSaving(true);try{await createFinanceBankAccount({...form,producerId});flash('Conta bancária cadastrada e auditada.');setOpen(false);setForm({...form,agency:'',accountNumber:'',holderName:'',holderDocument:'',pixKey:'',isPrimary:false});await reload()}catch(e:any){flash(e.message||'Erro ao cadastrar conta.')}finally{setSaving(false)}}
  async function primary(id:number){try{await setFinancePrimaryBankAccount(id);flash('Conta principal atualizada.');await reload()}catch(e:any){flash(e.message||'Erro ao definir conta principal.')}}
  async function toggle(r:FinanceBankAccount){try{await updateFinanceBankAccount(r.id,{status:r.status==='ativo'?'inativo':'ativo'});flash('Status da conta atualizado.');await reload()}catch(e:any){flash(e.message||'Erro ao atualizar conta.')}}
  return <>
    <section className="finance-kpis-grid"><Kpi icon={<Landmark size={22}/>} label="Contas Ativas" value={String(rows.filter(r=>r.status==='ativo').length)} note="Destinos habilitados"/><Kpi icon={<Star size={22}/>} label="Conta Principal" value={rows.find(r=>r.isPrimary)?.bankName||'Não definida'} note="Destino padrão para repasses"/></section>
    <section className="bank-accounts-grid">{rows.map(r=><article className="bank-card card-surface" key={r.id}><div className="bank-card-head"><div><span className="bank-code-badge">{r.bankCode}</span><strong>{r.bankName}</strong></div>{r.isPrimary?<span className="primary-pill">Principal</span>:<button className="text-action" onClick={()=>primary(r.id)}>Tornar principal</button>}</div><div className="bank-details-rows"><div className="bank-detail"><span>Agência</span><b>{r.agency}</b></div><div className="bank-detail"><span>Conta</span><b>{r.accountNumber}</b></div><div className="bank-detail"><span>Titular</span><b>{r.holderName}</b></div><div className="bank-detail"><span>Documento</span><b>{r.holderDocument}</b></div><div className="bank-detail"><span>PIX</span><code>{r.pixKey||'Não informado'}</code></div></div><div className="bank-card-footer"><span className={`fa-status ${r.status}`}>{r.status}</span><div className="fa-actions"><button className="fa-btn tiny" onClick={()=>toggle(r)}>{r.status==='ativo'?'Desativar':'Ativar'}</button><button className="fa-btn tiny primary" onClick={()=>onNavigate?.('finance-payouts')}>Repasse</button></div></div></article>)}</section>
    <button className="primary-btn cashops-floating-action" onClick={()=>setOpen(true)}><Plus size={16}/> Cadastrar Nova Conta</button>
    {!rows.length&&<div className="finops360-empty card-surface">Nenhuma conta bancária cadastrada. Cadastre a primeira conta para habilitar repasses.</div>}
    {open&&<div className="utm-modal-backdrop" onClick={()=>setOpen(false)}><div className="utm-modal-card wide" onClick={e=>e.stopPropagation()}><div className="utm-modal-head"><div><span className="eyebrow">TESOURARIA</span><h3>Cadastrar Conta Bancária</h3></div><button className="icon-action" onClick={()=>setOpen(false)}><X size={18}/></button></div><form className="cashops-form" onSubmit={submit}><label>Banco *<select value={`${form.bankCode}|${form.bankName}`} onChange={e=>{const [code,name]=e.target.value.split('|');setForm({...form,bankCode:code,bankName:name})}}><option value="341|Banco Itaú S.A.">341 · Itaú</option><option value="237|Banco Bradesco S.A.">237 · Bradesco</option><option value="001|Banco do Brasil S.A.">001 · Banco do Brasil</option><option value="033|Banco Santander Brasil">033 · Santander</option><option value="260|Nu Pagamentos S.A.">260 · Nubank</option><option value="077|Banco Inter S.A.">077 · Banco Inter</option></select></label><label>Tipo de conta<select value={form.accountType} onChange={e=>setForm({...form,accountType:e.target.value})}><option value="corrente">Corrente</option><option value="poupanca">Poupança</option><option value="pagamento">Pagamento</option></select></label><label>Agência *<input value={form.agency} onChange={e=>setForm({...form,agency:e.target.value})} required/></label><label>Conta com dígito *<input value={form.accountNumber} onChange={e=>setForm({...form,accountNumber:e.target.value})} required/></label><label>Titular *<input value={form.holderName} onChange={e=>setForm({...form,holderName:e.target.value})} required/></label><label>CPF/CNPJ *<input value={form.holderDocument} onChange={e=>setForm({...form,holderDocument:e.target.value})} required/></label><label>Tipo PIX<select value={form.pixType} onChange={e=>setForm({...form,pixType:e.target.value})}><option>CNPJ</option><option>CPF</option><option>E-mail</option><option>Telefone</option><option>Aleatória</option></select></label><label>Chave PIX<input value={form.pixKey} onChange={e=>setForm({...form,pixKey:e.target.value})}/></label><label className="cashops-check"><input type="checkbox" checked={form.isPrimary} onChange={e=>setForm({...form,isPrimary:e.target.checked})}/> Definir como conta principal</label><div className="cashops-form-actions"><button type="button" className="tool-btn" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving?'Salvando...':'Salvar Conta'}</button></div></form></div></div>}
  </>
}
