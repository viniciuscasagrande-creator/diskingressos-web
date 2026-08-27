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
    total: '84.320,00', sales: 640, available: 832, courtesy: 584, occupancy: '70.2%',
    cover: 'nature', status: 'ativo', category: 'Música', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 2, code: '3571', title: 'IRON MAIDEN SYMPHONIC',
    venue: 'Ópera de Arame', city: 'Curitiba - PR', date: '14/03/2027 19:00',
    total: '128.450,00', sales: 580, available: 1596, courtesy: 40, occupancy: '62.4%',
    cover: 'maiden', status: 'ativo', category: 'Show', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 3, code: '4101', title: 'Festival Disk Verão 2027',
    venue: 'Pedreira Paulo Leminski', city: 'Curitiba - PR', date: '10/01/2027 16:00',
    total: '96.400,00', sales: 482, available: 3518, courtesy: 50, occupancy: '12.1%',
    cover: 'nature', status: 'ativo', category: 'Festival', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 4, code: '4102', title: 'Rock Experience Curitiba',
    venue: 'Live Curitiba', city: 'Curitiba - PR', date: '24/01/2027 20:00',
    total: '63.600,00', sales: 318, available: 1182, courtesy: 30, occupancy: '21.2%',
    cover: 'maiden', status: 'ativo', category: 'Show', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 5, code: '4103', title: 'Sunset Eletrônico',
    venue: 'Parque Barigui', city: 'Curitiba - PR', date: '07/02/2027 15:00',
    total: '144.200,00', sales: 721, available: 4279, courtesy: 120, occupancy: '14.4%',
    cover: 'nature', status: 'ativo', category: 'Festival', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 6, code: '4104', title: 'Encontro de Negócios & Inovação',
    venue: 'Expo Unimed Curitiba', city: 'Curitiba - PR', date: '18/02/2027 09:00',
    total: '41.200,00', sales: 206, available: 794, courtesy: 20, occupancy: '20.6%',
    cover: 'conference', status: 'ativo', category: 'Congresso', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 7, code: '4105', title: 'Tributo aos Clássicos do Rock',
    venue: 'Teatro Guaíra', city: 'Curitiba - PR', date: '05/03/2027 20:30',
    total: '120.800,00', sales: 604, available: 496, courtesy: 15, occupancy: '54.9%',
    cover: 'maiden', status: 'ativo', category: 'Show', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 8, code: '4106', title: 'Festival Gastronômico Curitiba',
    venue: 'Museu Oscar Niemeyer', city: 'Curitiba - PR', date: '21/03/2027 11:00',
    total: '66.400,00', sales: 332, available: 1668, courtesy: 60, occupancy: '16.6%',
    cover: 'nature', status: 'ativo', category: 'Festival', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 9, code: '4107', title: 'Conexão Empreendedora 2027',
    venue: 'Centro de Eventos Positivo', city: 'Curitiba - PR', date: '09/04/2027 08:30',
    total: '37.400,00', sales: 187, available: 813, courtesy: 25, occupancy: '18.7%',
    cover: 'conference', status: 'ativo', category: 'Congresso', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 10, code: '4108', title: 'Noite Sinfônica Especial',
    venue: 'Ópera de Arame', city: 'Curitiba - PR', date: '30/04/2027 20:00',
    total: '88.200,00', sales: 441, available: 559, courtesy: 30, occupancy: '44.1%',
    cover: 'conference2', status: 'ativo', category: 'Música', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 11, code: '4109', title: 'Festival de Inverno Disk',
    venue: 'Parque Tanguá', city: 'Curitiba - PR', date: '12/06/2027 14:00',
    total: '103.600,00', sales: 518, available: 2482, courtesy: 80, occupancy: '17.3%',
    cover: 'nature', status: 'ativo', category: 'Festival', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 12, code: '4110', title: 'Tech Experience Paraná',
    venue: 'Viasoft Experience', city: 'Curitiba - PR', date: '19/06/2027 09:00',
    total: '52.800,00', sales: 264, available: 736, courtesy: 40, occupancy: '26.4%',
    cover: 'conference', status: 'ativo', category: 'Tecnologia', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 13, code: '4111', title: 'Especial MPB ao Ar Livre',
    venue: 'Parque São Lourenço', city: 'Curitiba - PR', date: '18/07/2027 16:00',
    total: '79.000,00', sales: 395, available: 1605, courtesy: 50, occupancy: '19.8%',
    cover: 'nature', status: 'ativo', category: 'Música', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 14, code: '4112', title: 'Arena Gamer Curitiba',
    venue: 'Expo Barigui', city: 'Curitiba - PR', date: '07/08/2027 10:00',
    total: '161.400,00', sales: 807, available: 3193, courtesy: 150, occupancy: '20.2%',
    cover: 'conference2', status: 'ativo', category: 'Games', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 15, code: '4113', title: 'Experience 80 & 90',
    venue: 'Live Curitiba', city: 'Curitiba - PR', date: '28/08/2027 21:00',
    total: '55.200,00', sales: 276, available: 724, courtesy: 20, occupancy: '27.6%',
    cover: 'maiden', status: 'rascunho', category: 'Show', producer: 'DiskIngressos Produções', visibility: 'publico', producerId: 1
  },
  {
    id: 16, code: '3714', title: '29ª Conferência Espírita',
    venue: 'Teatro Positivo', city: 'Curitiba - PR', date: '14/03/2027 08:00',
    total: '54.000,00', sales: 1200, available: 2188, courtesy: 100, occupancy: '54.8%',
    cover: 'conference', badge: '29ª Conferência Estadual Espírita', status: 'ativo',
    category: 'Congresso', producer: 'FEP Eventos', visibility: 'publico', producerId: 2
  },
  {
    id: 17, code: '3713', title: '29ª Conferência Espírita - Sábado',
    venue: 'Teatro Positivo', city: 'Curitiba - PR', date: '13/03/2027 08:00',
    total: '60.500,00', sales: 1350, available: 2587, courtesy: 80, occupancy: '52.1%',
    cover: 'conference2', badge: '29ª Conferência Estadual Espírita', status: 'ativo',
    category: 'Congresso', producer: 'FEP Eventos', visibility: 'publico', producerId: 2
  }
]
