import { FormEvent, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Plus, Search, ShieldCheck, UserCog, X, ArrowLeft } from 'lucide-react'
import { roleLabel, type AppUser, type Role, type Producer } from '../auth/model'

type Props={users:AppUser[];setUsers:Dispatch<SetStateAction<AppUser[]>>;currentUser:AppUser;producers:Producer[];notify:(m:string)=>void;onNavigate?:(page:any)=>void}
const roles=Object.keys(roleLabel) as Role[]
export default function UsersPage({users,setUsers,currentUser,producers,notify,onNavigate}:Props){
 const [q,setQ]=useState('');const [open,setOpen]=useState(false)
 const visible=useMemo(()=>users.filter(u=>(currentUser.role==='admin-master'||currentUser.role==='admin'||u.producerId===currentUser.producerId)&&`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())),[users,q,currentUser])
 const [form,setForm]=useState({name:'',email:'',password:'',role:'producer-operation' as Role,producerId:currentUser.producerId??producers[0].id})
 const submit=(e:FormEvent)=>{e.preventDefault();setUsers(prev=>[...prev,{id:Date.now(),...form,producerId:form.role==='admin-master'||form.role==='admin'?null:Number(form.producerId),status:'ativo'}]);setOpen(false);notify('Usuário criado com sucesso.');setForm({name:'',email:'',password:'',role:'producer-operation',producerId:currentUser.producerId??producers[0].id})}
 const toggle=(id:number)=>setUsers(prev=>prev.map(u=>u.id===id?{...u,status:u.status==='ativo'?'inativo':'ativo'}:u))
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
   <div className="users-toolbar"><div><p className="eyebrow">ADMINISTRAÇÃO</p><h2>Usuários e acessos</h2><p>Gerencie contas, perfis e vínculo com produtoras.</p></div><button className="primary-btn" onClick={()=>setOpen(true)}><Plus size={18}/> Novo usuário</button></div><div className="users-summary"><div><UserCog/><span><b>{visible.length}</b> usuários visíveis</span></div><div><ShieldCheck/><span>Controle por perfil e produtora</span></div></div><div className="table-card"><div className="table-tools"><div className="table-search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar usuário..."/></div></div><div className="table-scroll"><table className="users-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Produtora</th><th>Último acesso</th><th>Status</th><th></th></tr></thead><tbody>{visible.map(u=><tr key={u.id}><td><b>{u.name}</b><small>{u.email}</small></td><td>{roleLabel[u.role]}</td><td>{u.producerId?producers.find(p=>p.id===u.producerId)?.name:'Todas as produtoras'}</td><td>{u.lastLogin||'Nunca'}</td><td><span className={`status-chip ${u.status}`}>{u.status}</span></td><td><button className="secondary-small" disabled={u.id===currentUser.id} onClick={()=>toggle(u.id)}>{u.status==='ativo'?'Desativar':'Ativar'}</button></td></tr>)}</tbody></table></div></div>{open&&<div className="modal-backdrop"><form className="user-modal" onSubmit={submit}><button type="button" className="modal-close" onClick={()=>setOpen(false)}><X/></button><h3>Novo usuário</h3><p>Defina o perfil e a produtora que este usuário poderá acessar.</p><label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>E-mail<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Senha inicial<input required minLength={8} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><label>Perfil<select value={form.role} onChange={e=>setForm({...form,role:e.target.value as Role})}>{roles.filter(r=>currentUser.role==='admin-master'||!['admin-master','admin'].includes(r)).map(r=><option key={r} value={r}>{roleLabel[r]}</option>)}</select></label>{!['admin-master','admin'].includes(form.role)&&<label>Produtora<select value={form.producerId} disabled={currentUser.producerId!==null} onChange={e=>setForm({...form,producerId:Number(e.target.value)})}>{producers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}<button className="login-submit" type="submit">Criar usuário</button></form></div>}</div>
}
