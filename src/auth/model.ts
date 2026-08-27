export type Role = 'admin-master' | 'admin' | 'producer-admin' | 'producer-finance' | 'producer-operation' | 'producer-marketing' | 'viewer'
export type Producer = { id:number; name:string; document:string; status:'ativo'|'inativo' }
export type AppUser = {
  id:number; name:string; email:string; password?:string; role:Role; producerId:number|null;
  status:'ativo'|'inativo'; lastLogin?:string
}

export const producers:Producer[] = [
  {id:1,name:'DiskIngressos Produções',document:'12.345.678/0001-90',status:'ativo'},
  {id:2,name:'FEP Eventos',document:'98.765.432/0001-10',status:'ativo'},
]

export const seedUsers:AppUser[] = [
  {id:1,name:'Administrador Master',email:'admin@diskingressos.com.br',password:'Admin@123',role:'admin-master',producerId:null,status:'ativo',lastLogin:'26/08/2026 17:44'},
  {id:2,name:'Vinicius Casagrande',email:'vinicius@diskingressos.com.br',password:'Produtor@123',role:'producer-admin',producerId:1,status:'ativo',lastLogin:'26/08/2026 16:52'},
  {id:3,name:'Financeiro FEP',email:'financeiro@fep.com.br',password:'Financeiro@123',role:'producer-finance',producerId:2,status:'ativo',lastLogin:'25/08/2026 09:12'},
  {id:4,name:'Marketing Disk',email:'marketing@diskingressos.com.br',password:'Marketing@123',role:'producer-marketing',producerId:1,status:'ativo'},
  {id:5,name:'Operação Disk',email:'operacao@diskingressos.com.br',password:'Operacao@123',role:'producer-operation',producerId:1,status:'ativo'},
  {id:6,name:'Consulta Disk',email:'consulta@diskingressos.com.br',password:'Consulta@123',role:'viewer',producerId:1,status:'ativo'},
]

export const roleLabel:Record<Role,string> = {
  'admin-master':'Admin Master','admin':'Admin','producer-admin':'Produtor Admin','producer-finance':'Produtor Financeiro',
  'producer-operation':'Produtor Operacional','producer-marketing':'Produtor Marketing','viewer':'Somente leitura'
}

export function isGlobalAdmin(user:AppUser){return user.role==='admin-master'||user.role==='admin'}
export function canAccess(user:AppUser, area:'events'|'finance'|'pos'|'admin'|'marketing'|'remarketing'|'sac'){
  if(isGlobalAdmin(user)) return true
  if(area==='admin') return user.role==='producer-admin'
  if(area==='finance') return ['producer-admin','producer-finance','viewer'].includes(user.role)
  if(area==='pos') return ['producer-admin','producer-operation','viewer'].includes(user.role)
  if(area==='marketing'||area==='remarketing') return ['producer-admin','producer-marketing','viewer'].includes(user.role)
  if(area==='sac') return ['producer-admin','producer-operation','viewer'].includes(user.role)
  return ['producer-admin','producer-operation','producer-marketing','viewer'].includes(user.role)
}
