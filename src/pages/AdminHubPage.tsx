import { Building2, ShieldCheck, UserCog, ScrollText, LockKeyhole, ArrowRight } from 'lucide-react'
import type { PageKey } from '../components/ModuleSidebar'
const cards:[PageKey,string,string,any][]=[
 ['admin-users','Usuários e Acessos','Crie usuários, vincule produtoras e controle status.',UserCog],
 ['admin-producers','Produtoras','Cadastre produtoras e acompanhe situação da conta.',Building2],
 ['admin-permissions','Perfis e Permissões','Defina o que cada perfil pode visualizar e alterar.',ShieldCheck],
 ['admin-audit','Logs de Auditoria','Rastreie ações críticas executadas no sistema.',ScrollText],
 ['admin-security','Segurança','Políticas de senha, sessão e proteção de acesso.',LockKeyhole],
]
export default function AdminHubPage({onNavigate}:{onNavigate:(p:PageKey)=>void}){
 return <div className="admin-hub"><div className="admin-intro"><p className="eyebrow">ADMINISTRAÇÃO</p><h2>Central Administrativa</h2><p>Gerencie estrutura, acessos e segurança do ambiente multi-produtor.</p></div><div className="admin-card-grid">{cards.map(([key,title,desc,Icon])=><button className="admin-module-card" key={key} onClick={()=>onNavigate(key)}><span className="admin-card-icon"><Icon size={25}/></span><span><strong>{title}</strong><small>{desc}</small></span><ArrowRight className="admin-card-arrow" size={18}/></button>)}</div></div>
}
