export type POSTerminal = {
  id: string;
  name: string;
  event: string;
  operator: string;
  status: 'online' | 'offline';
  battery: number;
  lastSync: string;
  sales: number;
  total: number;
};

export type POSSale = {
  id: string;
  time: string;
  terminal: string;
  event: string;
  item: string;
  payment: 'Crédito' | 'Débito' | 'Pix' | 'Dinheiro';
  status: 'Aprovada' | 'Cancelada' | 'Pendente';
  value: number;
};

export const initialTerminals: POSTerminal[] = [
  {
    id: 'POS-001',
    name: 'Bilheteria Principal',
    event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
    operator: 'Ana Martins',
    status: 'online',
    battery: 92,
    lastSync: 'Agora',
    sales: 184,
    total: 28460.00,
  },
  {
    id: 'POS-002',
    name: 'Portão Norte',
    event: 'IRON MAIDEN — THE FUTURE PAST',
    operator: 'Carlos Souza',
    status: 'online',
    battery: 76,
    lastSync: 'Há 1 min',
    sales: 132,
    total: 21680.00,
  },
  {
    id: 'POS-003',
    name: 'Bilheteria VIP',
    event: 'CONFERÊNCIA FUTURO DIGITAL',
    operator: 'Marina Alves',
    status: 'online',
    battery: 64,
    lastSync: 'Há 2 min',
    sales: 96,
    total: 15480.00,
  },
  {
    id: 'POS-004',
    name: 'Caixa Externo 02',
    event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
    operator: 'Paulo Lima',
    status: 'offline',
    battery: 18,
    lastSync: 'Há 38 min',
    sales: 41,
    total: 6120.00,
  },
];

export const initialSales: POSSale[] = [
  {
    id: '#PDV-92841',
    time: '16:48',
    terminal: 'POS-001',
    event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
    item: 'Ingresso Inteira - 1º Lote',
    payment: 'Crédito',
    status: 'Aprovada',
    value: 180.00,
  },
  {
    id: '#PDV-92840',
    time: '16:45',
    terminal: 'POS-002',
    event: 'IRON MAIDEN — THE FUTURE PAST',
    item: 'Pista Premium - Inteira',
    payment: 'Pix',
    status: 'Aprovada',
    value: 350.00,
  },
  {
    id: '#PDV-92839',
    time: '16:42',
    terminal: 'POS-003',
    event: 'CONFERÊNCIA FUTURO DIGITAL',
    item: 'Inscrição Geral - Lote 2',
    payment: 'Débito',
    status: 'Aprovada',
    value: 220.00,
  },
  {
    id: '#PDV-92838',
    time: '16:39',
    terminal: 'POS-001',
    event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
    item: 'Meia Entrada Estudante',
    payment: 'Dinheiro',
    status: 'Aprovada',
    value: 90.00,
  },
  {
    id: '#PDV-92837',
    time: '16:31',
    terminal: 'POS-004',
    event: 'SEM PARAR — EXPERIÊNCIA MÚSICA E NATUREZA',
    item: 'Ingresso Inteira - 1º Lote',
    payment: 'Crédito',
    status: 'Cancelada',
    value: 180.00,
  },
];
