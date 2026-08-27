import { ArrowLeft, CalendarDays, Check, ChevronRight, ImagePlus, MapPin, Save, Ticket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { EventItem, EventStatus } from '../data/events'

type Props = {
  mode: 'new'|'edit'
  event?: EventItem | null
  onCancel:()=>void
  onSave:(event:EventItem)=>void
}

const blank: EventItem = {
  id: 0, code: '', title: '', venue: '', city: '', date: '', total:'0,00', sales:0,
  available:0, courtesy:0, occupancy:'0.0%', cover:'custom', status:'rascunho', category:'Show', producer:'DiskIngressos', visibility:'publico', producerId:1
}

export default function EventFormPage({mode,event,onCancel,onSave}:Props){
  const [form,setForm] = useState<EventItem>(event || blank)
  const [step,setStep] = useState(1)
  useEffect(()=>setForm(event || blank),[event,mode])

  const update = (key:keyof EventItem, value:string|number) => setForm(prev=>({...prev,[key]:value}))
  const submit = () => {
    if(!form.title.trim() || !form.venue.trim() || !form.date.trim()) return
    onSave({...form, id: form.id || Date.now(), code: form.code || String(Math.floor(4000+Math.random()*5000))})
  }

  return <>
    <section className="page-head form-page-head">
      <div><button className="back-link" onClick={onCancel}><ArrowLeft size={17}/> Voltar para eventos</button><p className="eyebrow">EVENTOS / {mode==='new'?'NOVO':'EDITAR'}</p><h1>{mode==='new'?'Criar novo evento':'Editar evento'}</h1><p className="head-subtitle">Configure as informações principais, publicação e capacidade.</p></div>
      <button className="primary-btn" onClick={submit}><Save size={18}/>{mode==='new'?'Salvar evento':'Salvar alterações'}</button>
    </section>

    <div className="wizard-steps">
      {[['1','Informações'],['2','Local e data'],['3','Ingressos'],['4','Publicação']].map(([n,label],i)=><button key={n} className={step===i+1?'active':''} onClick={()=>setStep(i+1)}><span>{step>i+1?<Check size={14}/>:n}</span>{label}{i<3&&<ChevronRight size={15}/>}</button>)}
    </div>

    <div className="form-layout">
      <section className="form-card">
        <div className="section-title"><div className="section-icon"><Ticket size={19}/></div><div><h2>Informações do evento</h2><p>Dados que aparecem para compradores e na administração.</p></div></div>
        <div className="form-grid two">
          <label className="field span-2"><span>Nome do evento *</span><input value={form.title} onChange={e=>update('title',e.target.value)} placeholder="Ex.: Festival de Música 2027"/></label>
          <label className="field"><span>Categoria</span><select value={form.category} onChange={e=>update('category',e.target.value)}><option>Show</option><option>Festival</option><option>Congresso</option><option>Teatro</option><option>Esporte</option><option>Música</option></select></label>
          <label className="field"><span>Produtora</span><input value={form.producer} onChange={e=>update('producer',e.target.value)}/></label>
          <label className="field span-2"><span>Descrição</span><textarea rows={4} value={form.description || ''} onChange={e=>update('description',e.target.value)} placeholder="Apresente o evento, atrações e informações importantes."/></label>
        </div>

        <div className="section-divider"/>
        <div className="section-title"><div className="section-icon"><MapPin size={19}/></div><div><h2>Local e data</h2><p>Defina onde e quando o evento será realizado.</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Local *</span><input value={form.venue} onChange={e=>update('venue',e.target.value)} placeholder="Nome do local"/></label>
          <label className="field"><span>Cidade / UF</span><input value={form.city} onChange={e=>update('city',e.target.value)} placeholder="Curitiba - PR"/></label>
          <label className="field"><span>Início *</span><div className="input-icon"><CalendarDays size={16}/><input value={form.date} onChange={e=>update('date',e.target.value)} placeholder="DD/MM/AAAA HH:MM"/></div></label>
          <label className="field"><span>Término</span><div className="input-icon"><CalendarDays size={16}/><input value={form.endDate || ''} onChange={e=>update('endDate',e.target.value)} placeholder="DD/MM/AAAA HH:MM"/></div></label>
        </div>

        <div className="section-divider"/>
        <div className="section-title"><div className="section-icon"><Users size={19}/></div><div><h2>Capacidade e publicação</h2><p>Controle a disponibilidade inicial e o status do evento.</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Ingressos disponíveis</span><input type="number" min="0" value={form.available} onChange={e=>update('available',Number(e.target.value))}/></label>
          <label className="field"><span>Cortesias</span><input type="number" min="0" value={form.courtesy} onChange={e=>update('courtesy',Number(e.target.value))}/></label>
          <label className="field"><span>Status</span><select value={form.status} onChange={e=>update('status',e.target.value as EventStatus)}><option value="rascunho">Rascunho</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></label>
          <label className="field"><span>Visibilidade</span><select value={form.visibility} onChange={e=>update('visibility',e.target.value)}><option value="publico">Público</option><option value="privado">Privado</option></select></label>
        </div>
      </section>

      <aside className="preview-column">
        <div className="preview-card">
          <div className="preview-cover"><ImagePlus size={28}/><span>Capa do evento</span><small>1920 × 1080 recomendado</small></div>
          <div className="preview-content"><span className="preview-label">PRÉ-VISUALIZAÇÃO</span><h3>{form.title || 'Nome do evento'}</h3><p><MapPin size={15}/>{form.venue || 'Local do evento'}</p><p><CalendarDays size={15}/>{form.date || 'Data e hora'}</p><div className="preview-status"><span className={`status-pill ${form.status}`}>{form.status}</span><span>{form.visibility==='publico'?'Visível na loja':'Acesso privado'}</span></div></div>
        </div>
        <div className="help-card"><strong>Checklist para publicar</strong><ul><li className={form.title?'done':''}>Nome definido</li><li className={form.venue?'done':''}>Local informado</li><li className={form.date?'done':''}>Data configurada</li><li className={form.available>0?'done':''}>Capacidade definida</li></ul></div>
      </aside>
    </div>
  </>
}
