import { LogOut, Menu, Search, SlidersHorizontal } from 'lucide-react'
import { isGlobalAdmin, roleLabel, type AppUser, type Producer } from '../auth/model'

type Props = {
  query: string
  onQuery: (value: string) => void
  user: AppUser | null
  producers?: Producer[]
  selectedProducer?: number | 'all'
  onProducer?: (v: number | 'all') => void
  onLogout?: () => void
  onToggleMenu?: () => void
}

export default function Header({ query, onQuery, user, producers = [], selectedProducer = 'all', onProducer, onLogout, onToggleMenu }: Props) {
  const userName = user?.name || 'Usuário'
  const userInitials = userName.split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase() || 'DI'
  const userRole = user?.role ? (roleLabel[user.role] || user.role) : 'Acesso'

  return (
    <header className="topbar global-topbar">
      <button className="mobile-menu-button" onClick={onToggleMenu} aria-label="Abrir navegação"><Menu size={22} /></button>
      <div className="brand global-brand">
        <span className="brand-mark">Di</span>
        <span>DiskIngressos</span>
      </div>
      <div className="search-wrap global-search">
        <Search size={21} />
        <input value={query || ''} onChange={e => onQuery(e.target.value)} placeholder="Buscar eventos..." />
        <SlidersHorizontal size={19} />
      </div>
      <div className="profile-area global-profile">
        {user && isGlobalAdmin(user) && onProducer && (
          <select className="producer-switch" value={selectedProducer} onChange={e => onProducer(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">Todas as produtoras</option>
            {producers.filter(p => p?.status === 'ativo').map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <div className="avatar">
          {userInitials}
          <span className="online" />
        </div>
        <div className="profile-copy">
          <strong>{userName}</strong>
          <small>{userRole}</small>
        </div>
        {onLogout && (
          <button className="logout-btn" onClick={onLogout} title="Sair">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}

