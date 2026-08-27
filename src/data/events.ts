export type EventStatus = 'ativo' | 'rascunho' | 'inativo'

export type EventItem = {
  id: number
  code: string
  title: string
  venue: string
  city: string
  date: string
  endDate?: string
  total: string
  sales: number
  available: number
  courtesy: number
  occupancy: string
  cover: string
  badge?: string
  status: EventStatus
  description?: string
  category?: string
  producer?: string
  visibility?: 'publico' | 'privado'
  producerId: number
}

export const events: EventItem[] = [
  {
    id: 1, code: '1760', title: 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',
    venue: 'Parque Jaime Lerner', city: 'Curitiba - PR', date: '30/06/2027 10:00',
    total: '0,00', sales: 0, available: 832, courtesy: 584, occupancy: '70.2%',
    cover: 'nature', status: 'ativo', category: 'Música', producer: 'DiskIngressos', visibility: 'publico', producerId: 1
  },
  {
    id: 2, code: '3571', title: 'IRON MAIDEN SYMPHONIC',
    venue: 'Ópera de Arame', city: 'Curitiba - PR', date: '14/03/2027 19:00',
    total: '2.180,00', sales: 10, available: 1596, courtesy: 0, occupancy: '0.6%',
    cover: 'maiden', status: 'ativo', category: 'Show', producer: 'DiskIngressos', visibility: 'publico', producerId: 1
  },
  {
    id: 3, code: '3714', title: '29ª Conferência Espírita',
    venue: 'Teatro Positivo', city: 'Curitiba - PR', date: '14/03/2027 08:00',
    total: '540,00', sales: 12, available: 2188, courtesy: 0, occupancy: '0.5%',
    cover: 'conference', badge: '29ª Conferência Estadual Espírita', status: 'ativo',
    category: 'Congresso', producer: 'FEP', visibility: 'publico', producerId: 2
  },
  {
    id: 4, code: '3713', title: '29ª Conferência Espírita',
    venue: 'Teatro Positivo', city: 'Curitiba - PR', date: '13/03/2027 08:00',
    total: '605,00', sales: 13, available: 2587, courtesy: 0, occupancy: '0.5%',
    cover: 'conference2', badge: '29ª Conferência Estadual Espírita', status: 'ativo',
    category: 'Congresso', producer: 'FEP', visibility: 'publico', producerId: 2
  }
]
