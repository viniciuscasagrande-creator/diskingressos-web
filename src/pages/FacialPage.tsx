import { AlertTriangle, CheckCircle2, ScanFace, Search, UserX } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Participant } from '../data/participants'

export default function FacialPage({participants}:{participants:Participant[]}){
 const [q,setQ]=useState(''); const filtered=useMemo(()=>participants.filter(p=>`${p.name} ${p.email}`.toLowerCase().includes(q.toLowerCase())),[participants,q])
 const approved=participants.filter(p=>p.facial==='aprovado').length, pending=participants.filter(p=>p.facial==='pendente').length, missing=participants.filter(p=>p.facial==='nao-cadastrado').length
 return <><section className="page-head"><div><p className="eyebrow">CONTROLE DE ACESSO</p><h1>Status Faciais</h1><p className="head-subtitle">Acompanhe a situação de cadastro e validação facial dos participantes.</p></div></section>
 <section className="facial-kpis"><div><span className="kpi-icon success"><CheckCircle2/></span><div><small>Aprovados</small><strong>{approved}</strong><em>{Math.round(approved/participants.length*100)}% da base</em></div></div><div><span className="kpi-icon warning"><AlertTriangle/></span><div><small>Em análise</small><strong>{pending}</strong><em>requer acompanhamento</em></div></div><div><span className="kpi-icon neutral"><UserX/></span><div><small>Não cadastrados</small><strong>{missing}</strong><em>contato recomendado</em></div></div></section>
 <section className="table-card"><div className="table-toolbar"><div><h2>Base facial</h2><p>Visualização operacional para validação e acesso.</p></div><div className="small-search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar participante..."/></div></div><div className="facial-grid">{filtered.map(p=><article className="facial-card" key={p.id}><div className="facial-photo"><ScanFace size={30}/></div><div className="facial-copy"><strong>{p.name}</strong><small>{p.email}</small><span className={`facial-chip ${p.facial}`}>{p.facial==='nao-cadastrado'?'Não cadastrado':p.facial}</span></div><button className="secondary-btn compact-btn">Detalhes</button></article>)}</div></section></>
}
