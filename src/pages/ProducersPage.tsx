import { FormEvent, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Building2, Plus, Search, X, ArrowLeft } from 'lucide-react'
import type { Producer } from '../auth/model'
type Props={producers:Producer[];setProducers:Dispatch<SetStateAction<Producer[]>>;notify:(m:string)=>void;onNavigate?:(page:any)=>void}
export default function ProducersPage({producers,setProducers,notify,onNavigate}:Props){
 const [q,setQ]=useState('');const [open,setOpen]=useState(false);const [form,setForm]=useState({name:'',document:''})
 const visible=useMemo(()=>producers.filter(p=>`${p.name} ${p.document}`.toLowerCase().includes(q.toLowerCase())),[producers,q])
 const submit=(e:FormEvent)=>{e.preventDefault();setProducers(v=>[...v,{id:Date.now(),name:form.name,document:form.document,status:'ativo'}]);setForm({name:'',document:''});setOpen(false);notify('Produtora cadastrada com sucesso.')}
 const toggle=(id:number)=>setProducers(v=>v.map(p=>p.id===id?{...p,status:p.status==='ativo'?'inativo':'ativo'}:p))
 return <div className="users-page">
   <div className="flex items-center gap-2 mb-3">
     <button
       onClick={()=>onNavigate?onNavigate('admin-hub'):window.history.back()}
       className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
     >
       <ArrowLeft size={14} className="text-[#06B6D4]"/>
       <span>Voltar ao Menu Administração</span>
     </button>
   </div>
   <div className="users-toolbar"><div><p className="eyebrow">ADMINISTRAÇÃO</p><h2>Produtoras</h2><p>Controle as organizações que operam eventos dentro da plataforma.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Plus size={18}/> Nova produtora</button></div><div className="users-summary"><div><Building2/><span><b>{producers.length}</b> produtoras cadastradas</span></div><div><span><b>{producers.filter(p=>p.status==='ativo').length}</b> contas ativas</span></div></div><div className="table-card"><div className="table-tools"><div className="table-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar produtora..."/></div></div><div className="table-scroll"><table className="users-table"><thead><tr><th>Produtora</th><th>Documento</th><th>Status</th><th></th></tr></thead><tbody>{visible.map(p=><tr key={p.id}><td><b>{p.name}</b><small>ID #{p.id}</small></td><td>{p.document}</td><td><span className={`status-chip ${p.status}`}>{p.status}</span></td><td><button className="secondary-small" onClick={()=>toggle(p.id)}>{p.status==='ativo'?'Desativar':'Ativar'}</button></td></tr>)}</tbody></table></div></div>{open&&<div className="modal-backdrop"><form className="user-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setOpen(false)}><X/></button><h3>Nova produtora</h3><p>Cadastre uma organização para isolar seus eventos, usuários e dados financeiros.</p><label>Nome da produtora<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>CNPJ / Documento<input required value={form.document} onChange={e=>setForm({...form,document:e.target.value})}/></label><button className="login-submit" type="submit">Cadastrar produtora</button></form></div>}</div>
}
