import { useState, useMemo, useEffect, type FormEvent, type Dispatch, type SetStateAction } from 'react'
import {
  Users, UserCheck, UserX, Shield, ShieldCheck, Check, X, Plus, KeyRound,
  Search, Mail, SlidersHorizontal, Building2, CheckCircle2, AlertCircle,
  Eye, Edit3, Trash2, Copy, Save, ArrowLeft, RefreshCw, Sparkles, Filter,
  Lock, Unlock, BadgeCheck, FileText, ChevronDown, ChevronRight
} from 'lucide-react'
import { roleLabel, type AppUser, type Role, type Producer } from '../auth/model'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import { DiskPageHeader, DiskKpiCard } from '../components/ui/disk'

export interface PermissionItem {
  key: string
  label: string
  description: string
  module: 'Eventos' | 'Financeiro' | 'Estornos' | 'Marketing' | 'Atendimento / SAC' | 'Comercial' | 'POS / PDV' | 'Controle de Acesso' | 'Administração'
  riskLevel: 'baixo' | 'medio' | 'alto' | 'critico'
}

export const SYSTEM_PERMISSIONS: PermissionItem[] = [
  // 1. Eventos (5)
  { key: 'eventos.view', label: 'Visualizar Eventos', description: 'Consultar listagem geral, dados cadastrais e painéis do evento', module: 'Eventos', riskLevel: 'baixo' },
  { key: 'eventos.create', label: 'Criar Novos Eventos', description: 'Cadastrar novos eventos, lotes de ingressos e setores', module: 'Eventos', riskLevel: 'medio' },
  { key: 'eventos.edit', label: 'Editar Eventos & Lotes', description: 'Alterar datas, preços, descrições e configurações de vendas', module: 'Eventos', riskLevel: 'medio' },
  { key: 'eventos.publish', label: 'Publicar / Pausar Vendas', description: 'Abrir e encerrar vendas de ingressos publicamente no portal', module: 'Eventos', riskLevel: 'alto' },
  { key: 'eventos.delete', label: 'Excluir / Arquivar Eventos', description: 'Remover eventos ou arquivar históricos da plataforma', module: 'Eventos', riskLevel: 'critico' },

  // 2. Financeiro (6)
  { key: 'financeiro.view', label: 'Visualizar Dashboard Financeiro', description: 'Acessar receitas, balanços consolidados, gráficos e saldo disponível', module: 'Financeiro', riskLevel: 'baixo' },
  { key: 'financeiro.statement', label: 'Consultar Extrato & Conciliação', description: 'Acessar extrato bancário detalhado e reconciliação Efí Pix', module: 'Financeiro', riskLevel: 'medio' },
  { key: 'financeiro.receivables', label: 'Agenda de Recebíveis', description: 'Visualizar projeções de liquidação de cartão de crédito e boletos', module: 'Financeiro', riskLevel: 'medio' },
  { key: 'financeiro.payables', label: 'Contas a Pagar & Despesas', description: 'Lançar e gerenciar compromissos, custos e fornecedores da produção', module: 'Financeiro', riskLevel: 'alto' },
  { key: 'financeiro.payout', label: 'Solicitar & Autorizar Repasses', description: 'Transferir recursos das vendas para a conta bancária do produtor', module: 'Financeiro', riskLevel: 'critico' },
  { key: 'financeiro.bordero', label: 'Emitir Borderô Oficial', description: 'Gerar e homologar borderô financeiro definitivo do evento', module: 'Financeiro', riskLevel: 'alto' },

  // 3. Centro de Controle de Estornos (5)
  { key: 'estornos.view', label: 'Visualizar Centro de Estornos', description: 'Consultar fila de disputas, contestações e pedidos de reembolso', module: 'Estornos', riskLevel: 'baixo' },
  { key: 'estornos.request', label: 'Protocolar Solicitação de Estorno', description: 'Registrar pedidos de cancelamento via SAC ou portaria', module: 'Estornos', riskLevel: 'medio' },
  { key: 'estornos.analyze', label: 'Analisar Contestações & CDC', description: 'Auditar documentação, prazo de 7 dias e regras do evento', module: 'Estornos', riskLevel: 'medio' },
  { key: 'estornos.approve', label: 'Aprovar Estorno & Reembolso', description: 'Autorizar devolução monetária automática no gateway bancário Efí Pix', module: 'Estornos', riskLevel: 'critico' },
  { key: 'estornos.override', label: 'Estorno Administrativo em Lote', description: 'Executar cancelamento em massa em caso de cancelamento do evento', module: 'Estornos', riskLevel: 'critico' },

  // 4. Marketing & Conversões (4)
  { key: 'marketing.view', label: 'Visualizar Métricas de Marketing', description: 'Consultar tráfego, vendas por canal e campanhas ativas', module: 'Marketing', riskLevel: 'baixo' },
  { key: 'marketing.utm', label: 'Gerenciador de Links UTM', description: 'Criar tags de rastreamento de anúncios, mídias e influenciadores', module: 'Marketing', riskLevel: 'baixo' },
  { key: 'marketing.pixel', label: 'Configurar Pixels (Meta / CAPI)', description: 'Inserir IDs de rastreamento do Facebook, Google e TikTok', module: 'Marketing', riskLevel: 'medio' },
  { key: 'marketing.remarketing', label: 'Réguas de Resgate & Remarketing', description: 'Disparar mensagens de abandono de carrinho via WhatsApp e E-mail', module: 'Marketing', riskLevel: 'alto' },

  // 5. Atendimento / SAC (5)
  { key: 'sac.view', label: 'Acessar Central de Atendimento', description: 'Operar chat em tempo real, inbox omnichannel e histórico', module: 'Atendimento / SAC', riskLevel: 'baixo' },
  { key: 'sac.tickets', label: 'Protocolar & Gerenciar Tickets', description: 'Abrir chamados com SLA e registrar interações de clientes', module: 'Atendimento / SAC', riskLevel: 'baixo' },
  { key: 'sac.sla', label: 'Gestão de SLA & Escalonamento', description: 'Modificar prazos de resposta e transferir chamados críticos P1', module: 'Atendimento / SAC', riskLevel: 'medio' },
  { key: 'sac.copilot', label: 'Operar Disk Copilot IA', description: 'Utilizar inteligência artificial para respostas e automações', module: 'Atendimento / SAC', riskLevel: 'baixo' },
  { key: 'sac.knowledge', label: 'Base de Conhecimento FAQ', description: 'Editar artigos de suporte e manuais públicos da plataforma', module: 'Atendimento / SAC', riskLevel: 'medio' },

  // 6. Comercial & Condições (3)
  { key: 'comercial.view', label: 'Visualizar Tabela de Taxas', description: 'Consultar condições comerciais e taxas acordadas com produtores', module: 'Comercial', riskLevel: 'baixo' },
  { key: 'comercial.spread', label: 'Editar Spread & Negociação', description: 'Adicionar e alterar margem de spread e taxa de conveniência do evento', module: 'Comercial', riskLevel: 'alto' },
  { key: 'comercial.proposals', label: 'Criar & Homologar Propostas', description: 'Aprovar novos contratos comerciais com condições especiais', module: 'Comercial', riskLevel: 'alto' },

  // 7. POS / PDV & Vendas Físicas (3)
  { key: 'pos.sales', label: 'Operação de Caixa & Vendas', description: 'Vender ingressos físicos e processar pagamentos na maquininha', module: 'POS / PDV', riskLevel: 'medio' },
  { key: 'pos.courtesy', label: 'Emissão de Cortesias Nominais', description: 'Emitir ingressos cortesias com rastreabilidade de autorização', module: 'POS / PDV', riskLevel: 'alto' },
  { key: 'pos.closing', label: 'Fechamento de Caixa & Sangria', description: 'Realizar conciliação diária de turno de operadores físicos', module: 'POS / PDV', riskLevel: 'alto' },

  // 8. Controle de Acesso & Portaria (3)
  { key: 'acesso.validate', label: 'Validar Ingressos & QR Code', description: 'Escanear QR Codes na portaria e registrar check-in', module: 'Controle de Acesso', riskLevel: 'baixo' },
  { key: 'acesso.devices', label: 'Gerenciamento de Catracas', description: 'Monitorar dispositivos portáteis e catracas conectadas', module: 'Controle de Acesso', riskLevel: 'medio' },
  { key: 'acesso.override', label: 'Liberação Manual de Acesso', description: 'Liberar entrada manualmente em caso de falha de conexão', module: 'Controle de Acesso', riskLevel: 'alto' },

  // 9. Administração & Governança (3)
  { key: 'admin.users', label: 'Gerenciar Usuários & Contas', description: 'Criar contas, alterar senhas e vincular produtoras', module: 'Administração', riskLevel: 'alto' },
  { key: 'admin.permissions', label: 'Habilitar / Desabilitar Permissões', description: 'Ativar e revogar acessos de usuários por e-mail cadastrado', module: 'Administração', riskLevel: 'critico' },
  { key: 'admin.audit', label: 'Logs de Auditoria & Segurança', description: 'Acessar trilha de auditoria e monitoramento de atividades', module: 'Administração', riskLevel: 'critico' },
]

export function getDefaultPermissionsForRole(role: Role): Record<string, boolean> {
  const p: Record<string, boolean> = {}
  SYSTEM_PERMISSIONS.forEach(item => {
    if (role === 'admin-master' || role === 'admin') {
      p[item.key] = true
    } else if (role === 'producer-admin') {
      p[item.key] = !item.key.startsWith('admin.') || item.key === 'admin.users'
    } else if (role === 'producer-finance') {
      p[item.key] = item.module === 'Financeiro' || item.module === 'Estornos' || item.key === 'eventos.view'
    } else if (role === 'producer-operation') {
      p[item.key] = item.module === 'Eventos' || item.module === 'POS / PDV' || item.module === 'Controle de Acesso' || item.module === 'Atendimento / SAC'
    } else if (role === 'producer-marketing') {
      p[item.key] = item.module === 'Marketing' || item.key === 'eventos.view' || item.key === 'sac.knowledge'
    } else if (role === 'commercial') {
      p[item.key] = item.module === 'Comercial' || item.key === 'eventos.view'
    } else if (role === 'viewer') {
      p[item.key] = item.key.endsWith('.view')
    } else {
      p[item.key] = false
    }
  })
  return p
}

type Props = {
  users: AppUser[]
  setUsers: Dispatch<SetStateAction<AppUser[]>>
  currentUser: AppUser
  producers: Producer[]
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

const LOCAL_STORAGE_KEY = 'diskingressos_users_permissions_v1'

export default function UsersPage({ users, setUsers, currentUser, producers, notify, onNavigate }: Props) {
  // Search state — prioritized for registered email
  const [emailSearch, setEmailSearch] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('todos')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [moduleFilter, setModuleFilter] = useState<string>('todos')
  const [permissionKeyword, setPermissionKeyword] = useState<string>('')

  // Selected user for granular permission management
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  // Modal create user state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'producer-operation' as Role,
    producerId: currentUser.producerId ?? (producers[0]?.id || 1)
  })

  // Initialize or load permissions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<number, Record<string, boolean>>
        setUsers(prev =>
          prev.map(u => ({
            ...u,
            permissions: parsed[u.id] || u.permissions || getDefaultPermissionsForRole(u.role)
          }))
        )
      } else {
        // Apply default permissions if missing
        setUsers(prev =>
          prev.map(u => ({
            ...u,
            permissions: u.permissions || getDefaultPermissionsForRole(u.role)
          }))
        )
      }
    } catch {
      // Ignore fallback
    }
  }, [])

  // Persist permissions whenever users change
  const saveToStorage = (updatedUsers: AppUser[]) => {
    try {
      const map: Record<number, Record<string, boolean>> = {}
      updatedUsers.forEach(u => {
        if (u.permissions) map[u.id] = u.permissions
      })
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map))
    } catch {
      // Ignore
    }
  }

  // Filtered users by email search, role and status
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Email / keyword filter
      if (emailSearch.trim()) {
        const query = emailSearch.toLowerCase().trim()
        const matchEmail = u.email.toLowerCase().includes(query)
        const matchName = u.name.toLowerCase().includes(query)
        if (!matchEmail && !matchName) return false
      }

      // Role filter
      if (roleFilter !== 'todos' && u.role !== roleFilter) return false

      // Status filter
      if (statusFilter !== 'todos' && u.status !== statusFilter) return false

      // Producer scope (if non-admin master)
      if (currentUser.role !== 'admin-master' && currentUser.role !== 'admin') {
        if (u.producerId !== currentUser.producerId) return false
      }

      return true
    })
  }, [users, emailSearch, roleFilter, statusFilter, currentUser])

  // Automatically select the user if exactly 1 matches the email search or keep selected
  useEffect(() => {
    if (emailSearch.trim()) {
      const exactMatch = users.find(u => u.email.toLowerCase() === emailSearch.toLowerCase().trim())
      if (exactMatch) {
        setSelectedUserId(exactMatch.id)
      } else if (filteredUsers.length === 1) {
        setSelectedUserId(filteredUsers[0].id)
      }
    } else if (selectedUserId === null && users.length > 0) {
      setSelectedUserId(users[0].id)
    }
  }, [emailSearch, filteredUsers, users, selectedUserId])

  // Current selected user object
  const selectedUser = useMemo(() => {
    return users.find(u => u.id === selectedUserId) || users[0] || null
  }, [users, selectedUserId])

  // Selected user permissions map
  const activeUserPermissions = useMemo(() => {
    if (!selectedUser) return {}
    return selectedUser.permissions || getDefaultPermissionsForRole(selectedUser.role)
  }, [selectedUser])

  // Count active permissions for selected user
  const activeCount = useMemo(() => {
    return Object.values(activeUserPermissions).filter(Boolean).length
  }, [activeUserPermissions])

  // Toggle single permission for selected user
  const togglePermission = (permKey: string) => {
    if (!selectedUser) return

    const newPerms = {
      ...activeUserPermissions,
      [permKey]: !activeUserPermissions[permKey]
    }

    const updated = users.map(u =>
      u.id === selectedUser.id ? { ...u, permissions: newPerms } : u
    )

    setUsers(updated)
    saveToStorage(updated)
    notify(`Permissão "${permKey}" ${newPerms[permKey] ? 'HABILITADA' : 'DESABILITADA'} para ${selectedUser.name}!`)
  }

  // Enable all permissions for selected user
  const handleEnableAll = () => {
    if (!selectedUser) return
    const allEnabled: Record<string, boolean> = {}
    SYSTEM_PERMISSIONS.forEach(p => { allEnabled[p.key] = true })

    const updated = users.map(u =>
      u.id === selectedUser.id ? { ...u, permissions: allEnabled } : u
    )
    setUsers(updated)
    saveToStorage(updated)
    notify(`Todas as 40 permissões foram HABILITADAS para ${selectedUser.name}!`)
  }

  // Disable all permissions for selected user
  const handleDisableAll = () => {
    if (!selectedUser) return
    const allDisabled: Record<string, boolean> = {}
    SYSTEM_PERMISSIONS.forEach(p => { allDisabled[p.key] = false })

    const updated = users.map(u =>
      u.id === selectedUser.id ? { ...u, permissions: allDisabled } : u
    )
    setUsers(updated)
    saveToStorage(updated)
    notify(`Todas as permissões foram DESABILITADAS para ${selectedUser.name}!`)
  }

  // Reset to default role permissions
  const handleResetToRoleDefault = () => {
    if (!selectedUser) return
    const defaults = getDefaultPermissionsForRole(selectedUser.role)

    const updated = users.map(u =>
      u.id === selectedUser.id ? { ...u, permissions: defaults } : u
    )
    setUsers(updated)
    saveToStorage(updated)
    notify(`Permissões restauradas para o padrão do perfil "${roleLabel[selectedUser.role]}"!`)
  }

  // Toggle active/inactive user status
  const toggleUserStatus = (userId: number) => {
    const updated = users.map(u =>
      u.id === userId ? { ...u, status: u.status === 'ativo' ? 'inativo' as const : 'ativo' as const } : u
    )
    setUsers(updated)
    saveToStorage(updated)
    notify('Status do usuário atualizado!')
  }

  // Create new user submit
  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim() || !createForm.email.trim()) return

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === createForm.email.toLowerCase().trim())) {
      notify('Atenção: Já existe um usuário cadastrado com este e-mail.')
      return
    }

    const defaultPerms = getDefaultPermissionsForRole(createForm.role)
    const newUser: AppUser = {
      id: Date.now(),
      name: createForm.name.trim(),
      email: createForm.email.toLowerCase().trim(),
      password: createForm.password || 'Disk@2026',
      role: createForm.role,
      producerId: ['admin-master', 'admin'].includes(createForm.role) ? null : Number(createForm.producerId),
      status: 'ativo',
      lastLogin: 'Nunca',
      permissions: defaultPerms
    }

    const updated = [newUser, ...users]
    setUsers(updated)
    saveToStorage(updated)
    setIsCreateModalOpen(false)
    setSelectedUserId(newUser.id)
    setEmailSearch(newUser.email)
    notify(`Usuário ${newUser.name} criado com sucesso e permissões vinculadas!`)

    setCreateForm({
      name: '',
      email: '',
      password: '',
      role: 'producer-operation',
      producerId: currentUser.producerId ?? (producers[0]?.id || 1)
    })
  }

  // Filtered permission items by module and keyword
  const filteredPermissions = useMemo(() => {
    return SYSTEM_PERMISSIONS.filter(p => {
      if (moduleFilter !== 'todos' && p.module !== moduleFilter) return false
      if (permissionKeyword.trim()) {
        const q = permissionKeyword.toLowerCase().trim()
        const matchLabel = p.label.toLowerCase().includes(q)
        const matchKey = p.key.toLowerCase().includes(q)
        const matchDesc = p.description.toLowerCase().includes(q)
        if (!matchLabel && !matchKey && !matchDesc) return false
      }
      return true
    })
  }, [moduleFilter, permissionKeyword])

  // Group filtered permissions by module
  const permissionsByModule = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {}
    filteredPermissions.forEach(p => {
      if (!groups[p.module]) groups[p.module] = []
      groups[p.module].push(p)
    })
    return groups
  }, [filteredPermissions])

  // Quick email chips
  const quickEmails = useMemo(() => {
    return users.slice(0, 7).map(u => u.email)
  }, [users])

  return (
    <LimitlessPage className="space-y-4 w-full max-w-none font-sans text-slate-100 px-2 sm:px-4 md:px-6 py-2">
      
      {/* HEADER DA PÁGINA */}
      <DiskPageHeader
        title="Usuários & Gestão de Acessos"
        description="Busca operacional por e-mail de cadastro, governança RBAC e matriz de permissões granulares"
        breadcrumbs={['DiskIngressos', 'Administração', 'Usuários e Acessos']}
        badge="Segurança & RBAC"
        badgeTone="info"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('profile-dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
                title="Voltar ao Painel"
              >
                <ArrowLeft size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">Painel</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                saveToStorage(users)
                notify('Matriz de permissões salva e persistida com sucesso!')
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-[#334155] transition cursor-pointer"
            >
              <Save size={14} className="text-emerald-400" />
              <span>Salvar Alterações</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition cursor-pointer"
            >
              <Plus size={15} />
              <span>Novo Usuário</span>
            </button>
          </div>
        }
      />

      {/* SCORECARDS RÁPIDOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DiskKpiCard
          icon={<Users size={20} />}
          label="Total de Usuários"
          value={users.length.toString()}
          note="Cadastrados no sistema"
          accent="info"
        />
        <DiskKpiCard
          icon={<UserCheck size={20} />}
          label="Usuários Ativos"
          value={users.filter(u => u.status === 'ativo').length.toString()}
          note="Com acesso liberado"
          accent="success"
        />
        <DiskKpiCard
          icon={<ShieldCheck size={20} />}
          label="Permissões por Usuário"
          value={selectedUser ? `${activeCount} / 40` : '40 itens'}
          note={selectedUser ? `${selectedUser.name.split(' ')[0]}` : 'Matriz granular'}
          accent="sky"
        />
        <DiskKpiCard
          icon={<Building2 size={20} />}
          label="Produtoras Vinculadas"
          value={producers.length.toString()}
          note="Multi-tenant ativo"
          accent="warning"
        />
      </div>

      {/* ========================================================
          DESTAQUE PRINCIPAL: BUSCA POR E-MAIL DE CADASTRO
          ======================================================== */}
      <div className="bg-[#111722] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mail size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Busca de Usuário por E-mail de Cadastro
              </h2>
              <p className="text-xs text-slate-400">
                Localize qualquer operador ou produtor pelo e-mail para habilitar e desabilitar permissões instantaneamente
              </p>
            </div>
          </div>

          {emailSearch && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {filteredUsers.length} resultado(s)
            </span>
          )}
        </div>

        {/* Campo de Busca Grande */}
        <div className="relative w-full">
          <input
            type="text"
            value={emailSearch}
            onChange={e => setEmailSearch(e.target.value)}
            placeholder="Digite o e-mail de cadastro (ex: vinicius@diskingressos.com.br, financeiro@fep.com.br)..."
            className="w-full bg-[#151c27] text-white pl-11 pr-24 py-3 text-sm rounded-xl border border-[#283548] focus:outline-hidden focus:border-blue-500 shadow-inner"
          />
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
          {emailSearch && (
            <button
              type="button"
              onClick={() => setEmailSearch('')}
              className="absolute right-3 top-2.5 px-2.5 py-1 text-xs font-semibold rounded bg-[#1e293b] text-slate-300 hover:text-white border border-[#334155] cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Chips de E-mails Rápidos / Cadastrados */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            E-mails rápidos:
          </span>
          {quickEmails.map((email, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setEmailSearch(email)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono transition cursor-pointer border ${
                emailSearch.toLowerCase() === email.toLowerCase()
                  ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                  : 'bg-[#151c27] text-slate-300 hover:text-white border-[#283548] hover:bg-[#1e293b]'
              }`}
            >
              {email}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          ÁREA PRINCIPAL: COCKPIT DO USUÁRIO & MATRIZ DE PERMISSÕES
          ======================================================== */}
      {selectedUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* COLUNA ESQUERDA: DOSSIÊ DO USUÁRIO SELECIONADO (Lg: 4 colunas) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            
            {/* Card de Identificação */}
            <div className="bg-[#111722] border border-[#1e293b] rounded-2xl p-4 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Usuário Selecionado</span>
                <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${
                  selectedUser.status === 'ativo'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  ● {selectedUser.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                  {selectedUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white truncate leading-tight">{selectedUser.name}</h3>
                  <div className="text-xs text-blue-400 font-mono truncate mt-0.5">{selectedUser.email}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-semibold">
                    {roleLabel[selectedUser.role]}
                  </div>
                </div>
              </div>

              {/* Informações Complementares */}
              <div className="bg-[#151c27] rounded-xl p-3 border border-[#283548] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Produtora</span>
                  <strong className="text-slate-200">
                    {selectedUser.producerId ? producers.find(p => p.id === selectedUser.producerId)?.name : 'Visão Global (Todas)'}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Último Acesso</span>
                  <span className="text-slate-200 font-mono">{selectedUser.lastLogin || 'Nunca acessou'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">ID do Usuário</span>
                  <span className="text-slate-400 font-mono">#{selectedUser.id}</span>
                </div>
              </div>

              {/* Barra de Progresso de Permissões */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Nível de Acesso:</span>
                  <strong className="text-emerald-400 font-bold">
                    {activeCount} de 40 ativas ({Math.round((activeCount / 40) * 100)}%)
                  </strong>
                </div>
                <div className="w-full bg-[#151c27] h-2.5 rounded-full overflow-hidden border border-[#283548]">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(activeCount / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ações Rápidas de Permissão */}
              <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Ações Rápidas de Permissão
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleEnableAll}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-xs transition cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Habilitar Todas</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisableAll}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-700/50 transition cursor-pointer"
                  >
                    <X size={14} />
                    <span>Desabilitar Todas</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToRoleDefault}
                    className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#151c27] hover:bg-[#1e293b] text-slate-200 border border-[#283548] transition cursor-pointer"
                  >
                    <RefreshCw size={13} className="text-cyan-400" />
                    <span>Restaurar Padrão do Perfil ({roleLabel[selectedUser.role]})</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedUser.id === currentUser.id}
                    onClick={() => toggleUserStatus(selectedUser.id)}
                    className={`col-span-2 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      selectedUser.status === 'ativo'
                        ? 'bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border-amber-700/50'
                        : 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border-emerald-700/50'
                    }`}
                  >
                    {selectedUser.status === 'ativo' ? <Lock size={13} /> : <Unlock size={13} />}
                    <span>{selectedUser.status === 'ativo' ? 'Bloquear / Inativar Conta' : 'Desbloquear / Ativar Conta'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Lista Compacta de Outros Usuários */}
            <div className="bg-[#111722] border border-[#1e293b] rounded-2xl shadow-md overflow-hidden flex flex-col">
              <div className="p-3 border-b border-[#1e293b] bg-[#151c27]/70 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Outros Usuários Cadastrados</span>
                <span className="text-[11px] text-slate-400">{filteredUsers.length} total</span>
              </div>

              <div className="max-h-[300px] overflow-y-auto divide-y divide-[#1e293b]">
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUserId(u.id)
                      setEmailSearch(u.email)
                    }}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                      u.id === selectedUser.id ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'hover:bg-[#151c27]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-white truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold whitespace-nowrap">
                      {roleLabel[u.role].split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: MATRIZ DE PERMISSÕES GRANULARES (Lg: 8 colunas) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            
            {/* Barra de Filtro de Módulos & Busca Textual de Permissão */}
            <div className="bg-[#111722] border border-[#1e293b] rounded-2xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-2.5">
              
              {/* Filtro por Módulo */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 text-xs">
                <span className="text-slate-400 font-bold text-[11px] whitespace-nowrap">Módulo:</span>
                {[
                  'todos',
                  'Eventos',
                  'Financeiro',
                  'Estornos',
                  'Marketing',
                  'Atendimento / SAC',
                  'Comercial',
                  'POS / PDV',
                  'Controle de Acesso',
                  'Administração'
                ].map((mod) => (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setModuleFilter(mod)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                      moduleFilter === mod
                        ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                        : 'bg-[#151c27] text-slate-300 border-[#283548] hover:bg-[#1e293b]'
                    }`}
                  >
                    {mod === 'todos' ? 'Todos os Módulos (40)' : mod}
                  </button>
                ))}
              </div>

              {/* Busca por Palavra-chave da Permissão */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={permissionKeyword}
                  onChange={e => setPermissionKeyword(e.target.value)}
                  placeholder="Filtrar permissão (ex: pix, estorno)..."
                  className="w-full bg-[#151c27] text-white pl-8 pr-2 py-1.5 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                />
                <Search size={13} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Grupos de Permissões */}
            <div className="space-y-3.5">
              {Object.keys(permissionsByModule).length === 0 ? (
                <div className="bg-[#111722] border border-[#1e293b] rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Nenhuma permissão encontrada para os filtros selecionados.
                </div>
              ) : (
                Object.entries(permissionsByModule).map(([moduleName, perms]) => (
                  <div key={moduleName} className="bg-[#111722] border border-[#1e293b] rounded-2xl overflow-hidden shadow-md">
                    
                    {/* Cabeçalho do Módulo */}
                    <div className="px-4 py-2.5 bg-[#151c27] border-b border-[#1e293b] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-blue-400" />
                        <h4 className="text-xs sm:text-sm font-bold text-white">{moduleName}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold">
                          {perms.length} permissões
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newMap = { ...activeUserPermissions }
                            perms.forEach(p => { newMap[p.key] = true })
                            const updated = users.map(u => u.id === selectedUser.id ? { ...u, permissions: newMap } : u)
                            setUsers(updated)
                            saveToStorage(updated)
                            notify(`Permissões do módulo ${moduleName} habilitadas para ${selectedUser.name}!`)
                          }}
                          className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                        >
                          Ativar Todas
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newMap = { ...activeUserPermissions }
                            perms.forEach(p => { newMap[p.key] = false })
                            const updated = users.map(u => u.id === selectedUser.id ? { ...u, permissions: newMap } : u)
                            setUsers(updated)
                            saveToStorage(updated)
                            notify(`Permissões do módulo ${moduleName} desabilitadas para ${selectedUser.name}!`)
                          }}
                          className="text-[11px] text-rose-400 hover:underline font-semibold cursor-pointer"
                        >
                          Desativar Todas
                        </button>
                      </div>
                    </div>

                    {/* Lista de Permissões com Switches */}
                    <div className="divide-y divide-[#1e293b]">
                      {perms.map(p => {
                        const isEnabled = !!activeUserPermissions[p.key]
                        return (
                          <div
                            key={p.key}
                            className={`p-3.5 flex items-center justify-between gap-3 transition ${
                              isEnabled ? 'bg-[#111722]' : 'bg-[#0f141f]/70'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className={`text-xs sm:text-sm font-bold ${isEnabled ? 'text-white' : 'text-slate-400'}`}>
                                  {p.label}
                                </strong>
                                <code className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                  {p.key}
                                </code>
                                {p.riskLevel === 'critico' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">
                                    Crítico
                                  </span>
                                )}
                                {p.riskLevel === 'alto' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                                    Alto
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 leading-snug">
                                {p.description}
                              </p>
                            </div>

                            {/* Switch Toggle Habilitar / Desabilitar */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-[11px] font-bold hidden sm:inline ${
                                isEnabled ? 'text-emerald-400' : 'text-slate-500'
                              }`}>
                                {isEnabled ? 'Habilitado' : 'Desabilitado'}
                              </span>

                              <button
                                type="button"
                                onClick={() => togglePermission(p.key)}
                                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shadow-inner ${
                                  isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                                }`}
                                title={isEnabled ? `Desabilitar ${p.label}` : `Habilitar ${p.label}`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                    isEnabled ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-[#111722] border border-[#1e293b] rounded-2xl p-10 text-center text-slate-400">
          Nenhum usuário selecionado. Digite um e-mail de cadastro na barra acima para visualizar e alterar as permissões.
        </div>
      )}

      {/* ========================================================
          TABELA GERAL DE USUÁRIOS & AUDITORIA
          ======================================================== */}
      <div className="bg-[#111722] border border-[#1e293b] rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-[#1e293b] bg-[#151c27]/80 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white">Tabela de Usuários Cadastrados & Perfis</h3>
            <p className="text-xs text-slate-400">Controle completo de contas, perfis e quantidade de permissões habilitadas</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-[#111722] text-slate-200 border border-[#283548] rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="todos">Todos os Perfis</option>
              <option value="admin-master">Admin Master</option>
              <option value="producer-admin">Produtor Admin</option>
              <option value="producer-finance">Produtor Financeiro</option>
              <option value="producer-operation">Produtor Operacional</option>
              <option value="producer-marketing">Produtor Marketing</option>
              <option value="commercial">Comercial</option>
              <option value="viewer">Somente Leitura</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#111722] text-slate-200 border border-[#283548] rounded-lg px-2.5 py-1 text-xs"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs divide-y divide-[#1e293b]">
            <thead className="bg-[#151c27] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-6">Usuário</th>
                <th className="py-3 px-4">E-mail de Cadastro</th>
                <th className="py-3 px-4">Perfil RBAC</th>
                <th className="py-3 px-4">Produtora</th>
                <th className="py-3 px-4 text-center">Permissões</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredUsers.map(u => {
                const userPerms = u.permissions || getDefaultPermissionsForRole(u.role)
                const userActiveCount = Object.values(userPerms).filter(Boolean).length
                const isSelected = u.id === selectedUser?.id

                return (
                  <tr
                    key={u.id}
                    className={`transition hover:bg-[#151c27] ${
                      isSelected ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-6 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {u.email}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {roleLabel[u.role]}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {u.producerId ? producers.find(p => p.id === u.producerId)?.name : 'Global (Todas)'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-blue-950/70 text-blue-300 border border-blue-700/50">
                        {userActiveCount} / 40
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ativo' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {u.lastLogin || 'Nunca'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserId(u.id)
                            setEmailSearch(u.email)
                            notify(`Gerenciando permissões de ${u.name} (${u.email})`)
                          }}
                          className="px-2 py-1 rounded bg-[#1e293b] hover:bg-[#283548] text-cyan-400 font-semibold text-[11px] border border-[#334155] cursor-pointer"
                          title="Habilitar/Desabilitar permissões"
                        >
                          Permissões
                        </button>

                        <button
                          type="button"
                          disabled={u.id === currentUser.id}
                          onClick={() => toggleUserStatus(u.id)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title={u.status === 'ativo' ? 'Inativar' : 'Ativar'}
                        >
                          {u.status === 'ativo' ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL: NOVO USUÁRIO COM PERMISSÕES INICIAIS
          ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111722] border border-[#283548] rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
              <div className="flex items-center gap-2">
                <Plus size={18} className="text-blue-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Novo Usuário & Definir Acessos</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ex: Carlos Silva de Alencar"
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">E-mail de Cadastro (Chave de Acesso)</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="usuario@diskingressos.com.br"
                  className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Senha Inicial</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Mínimo 8 dígitos"
                    className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Perfil RBAC</label>
                  <select
                    value={createForm.role}
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value as Role })}
                    className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="producer-operation">Produtor Operacional</option>
                    <option value="producer-finance">Produtor Financeiro</option>
                    <option value="producer-marketing">Produtor Marketing</option>
                    <option value="commercial">Comercial</option>
                    <option value="producer-admin">Produtor Admin</option>
                    <option value="admin">Admin</option>
                    <option value="admin-master">Admin Master</option>
                    <option value="viewer">Somente Leitura</option>
                  </select>
                </div>
              </div>

              {!['admin-master', 'admin'].includes(createForm.role) && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Produtora Vinculada</label>
                  <select
                    value={createForm.producerId}
                    onChange={e => setCreateForm({ ...createForm, producerId: Number(e.target.value) })}
                    className="w-full bg-[#151c27] text-white px-3 py-2 text-xs rounded-lg border border-[#283548] focus:outline-hidden focus:border-blue-500"
                  >
                    {producers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-2.5 text-xs text-blue-200">
                💡 <b>Permissões Iniciais:</b> Ao criar o usuário, a matriz de permissões será inicializada com o padrão do perfil selecionado e poderá ser personalizada a qualquer momento pela busca por e-mail.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#151c27] hover:bg-[#1e293b] text-slate-300 border border-[#283548] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm cursor-pointer"
                >
                  Criar Usuário & Habilitar Acessos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </LimitlessPage>
  )
}
