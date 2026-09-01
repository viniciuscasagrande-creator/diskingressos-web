import { useState } from 'react'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { roleLabel, type Role } from '../auth/model'
const roles=(Object.keys(roleLabel) as Role[]).filter(r=>r!=='admin-master')
const modules=['Eventos','Financeiro','POS / PDV','Participantes','Marketing','Administração']
const actions=['Visualizar','Criar','Editar','Excluir']
const defaults:Record<string,boolean>={}
roles.forEach(r=>modules.forEach((m,mi)=>actions.forEach((a,ai)=>{defaults[`${r}|${m}|${a}`]=r==='admin'||r==='producer-admin'||(r==='producer-finance'&&m==='Financeiro'&&ai<3)||(r==='producer-operation'&&['Eventos','POS / PDV','Participantes'].includes(m)&&ai<3)||(r==='producer-marketing'&&['Eventos','Marketing'].includes(m)&&ai<3)||(r==='viewer'&&a==='Visualizar'&&!['Administração'].includes(m))})))
export default function PermissionsPage({notify,onNavigate}:{notify:(m:string)=>void;onNavigate?:(page:any)=>void}){const [role,setRole]=useState<Role>('producer-admin');const [perm,setPerm]=useState(defaults);const toggle=(m:string,a:string)=>setPerm(v=>({...v,[`${role}|${m}|${a}`]:!v[`${role}|${m}|${a}`]}));return <div className="permissions-page">
  <div className="flex items-center gap-2 mb-3">
    <button
      onClick={()=>onNavigate?onNavigate('admin-hub'):window.history.back()}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
    >
      <ArrowLeft size={14} className="text-[#06B6D4]"/>
      <span>Voltar ao Menu Administração</span>
    </button>
  </div>
  <div className="users-toolbar"><div><p className="eyebrow">CONTROLE DE ACESSO</p><h2>Perfis e Permissões</h2><p>Defina permissões por perfil. O backend deve aplicar as mesmas regras em cada endpoint.</p></div><button className="primary-btn" onClick={()=>notify('Matriz de permissões salva no protótipo.')}>Salvar alterações</button></div><div className="permissions-layout"><aside className="role-list">{roles.map(r=><button key={r} className={role===r?'active':''} onClick={()=>setRole(r)}><ShieldCheck size={17}/>{roleLabel[r]}</button>)}</aside><div className="permission-table-wrap"><div className="permission-heading"><strong>{roleLabel[role]}</strong><span>Permissões efetivas deste perfil</span></div><div className="table-scroll"><table className="permission-table"><thead><tr><th>Módulo</th>{actions.map(a=><th key={a}>{a}</th>)}</tr></thead><tbody>{modules.map(m=><tr key={m}><td><b>{m}</b></td>{actions.map(a=><td key={a}><label className="perm-check"><input type="checkbox" checked={!!perm[`${role}|${m}|${a}`]} onChange={()=>toggle(m,a)}/><span/></label></td>)}</tr>)}</tbody></table></div></div></div></div>}
