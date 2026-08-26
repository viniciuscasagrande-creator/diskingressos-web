export type CheckinStatus = 'presente' | 'pendente';
export type FacialStatus = 'aprovado' | 'pendente' | 'nao-cadastrado';

export interface Participant {
  id: number;
  name: string;
  email: string;
  document: string;
  cpf?: string;
  ticket: string;
  order: string;
  ticketCode?: string;
  batchName?: string;
  eventId: number;
  purchaseDate: string;
  value: number;
  price?: number;
  checkin: CheckinStatus;
  checkinStatus?: 'realizado' | 'pendente';
  checkinTime?: string;
  facial: FacialStatus;
  facialStatus?: 'aprovado' | 'pendente' | 'nao_cadastrado';
  gate?: string;
}

export const mockParticipants: Participant[] = [
  {
    id: 1,
    name: 'Ana Beatriz Souza',
    email: 'ana.souza@email.com',
    document: '***.458.219-**',
    cpf: '048.912.839-44',
    ticket: 'Pista • Inteira',
    order: '#DI-98231',
    ticketCode: 'DK-9823-A1',
    batchName: '1º Lote - Pista',
    eventId: 2,
    purchaseDate: '12/08/2026 14:21',
    value: 180.00,
    price: 180.00,
    checkin: 'presente',
    checkinStatus: 'realizado',
    checkinTime: '18:47',
    facial: 'aprovado',
    facialStatus: 'aprovado',
    gate: 'Portão A'
  },
  {
    id: 2,
    name: 'Lucas Henrique Lima',
    email: 'lucas.lima@email.com',
    document: '***.771.903-**',
    cpf: '812.349.102-15',
    ticket: 'Pista • Meia',
    order: '#DI-98232',
    ticketCode: 'DK-9823-A2',
    batchName: '1º Lote - Pista Meia',
    eventId: 2,
    purchaseDate: '12/08/2026 14:25',
    value: 90.00,
    price: 90.00,
    checkin: 'pendente',
    checkinStatus: 'pendente',
    facial: 'aprovado',
    facialStatus: 'aprovado'
  },
  {
    id: 3,
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    document: '***.120.765-**',
    cpf: '391.824.901-88',
    ticket: 'VIP • Inteira',
    order: '#DI-98244',
    ticketCode: 'DK-9824-V1',
    batchName: 'Camarote Open Bar & Food',
    eventId: 3,
    purchaseDate: '13/08/2026 09:14',
    value: 240.00,
    price: 240.00,
    checkin: 'presente',
    checkinStatus: 'realizado',
    checkinTime: '07:56',
    facial: 'pendente',
    facialStatus: 'pendente',
    gate: 'Portão VIP'
  },
  {
    id: 4,
    name: 'Rafael Martins',
    email: 'rafael.m@email.com',
    document: '***.882.140-**',
    cpf: '901.284.112-90',
    ticket: 'Plateia • Inteira',
    order: '#DI-98261',
    ticketCode: 'DK-9826-P1',
    batchName: 'Inscrição Geral Domingo',
    eventId: 3,
    purchaseDate: '13/08/2026 11:02',
    value: 120.00,
    price: 120.00,
    checkin: 'pendente',
    checkinStatus: 'pendente',
    facial: 'nao-cadastrado',
    facialStatus: 'nao_cadastrado'
  },
  {
    id: 5,
    name: 'Camila Rocha',
    email: 'camila.rocha@email.com',
    document: '***.309.512-**',
    cpf: '128.491.029-73',
    ticket: 'Plateia • Meia',
    order: '#DI-98275',
    ticketCode: 'DK-9827-P2',
    batchName: 'Inscrição Geral Sábado',
    eventId: 4,
    purchaseDate: '13/08/2026 13:45',
    value: 60.00,
    price: 60.00,
    checkin: 'presente',
    checkinStatus: 'realizado',
    checkinTime: '08:03',
    facial: 'aprovado',
    facialStatus: 'aprovado',
    gate: 'Portão B'
  },
  {
    id: 6,
    name: 'Felipe Andrade',
    email: 'felipe.andrade@email.com',
    document: '***.672.310-**',
    cpf: '739.102.844-01',
    ticket: 'Pista • Inteira',
    order: '#DI-98301',
    ticketCode: 'DK-9830-X1',
    batchName: 'Passaporte Geral',
    eventId: 1,
    purchaseDate: '14/08/2026 10:06',
    value: 150.00,
    price: 150.00,
    checkin: 'pendente',
    checkinStatus: 'pendente',
    facial: 'pendente',
    facialStatus: 'pendente'
  },
  {
    id: 7,
    name: 'Juliana Freitas',
    email: 'juliana.freitas@email.com',
    document: '***.246.889-**',
    cpf: '209.481.039-22',
    ticket: 'Pista • Inteira',
    order: '#DI-98310',
    ticketCode: 'DK-9831-A3',
    batchName: 'Plateia Baixa - 1º Lote',
    eventId: 2,
    purchaseDate: '14/08/2026 10:51',
    value: 180.00,
    price: 180.00,
    checkin: 'presente',
    checkinStatus: 'realizado',
    checkinTime: '18:52',
    facial: 'aprovado',
    facialStatus: 'aprovado',
    gate: 'Portão A'
  },
  {
    id: 8,
    name: 'Pedro Alves',
    email: 'pedro.alves@email.com',
    document: '***.519.402-**',
    cpf: '519.402.810-99',
    ticket: 'Cortesia',
    order: '#DI-98318',
    ticketCode: 'DK-9831-C1',
    batchName: 'Passaporte Geral - Lote Promocional',
    eventId: 1,
    purchaseDate: '14/08/2026 12:33',
    value: 0.00,
    price: 0.00,
    checkin: 'pendente',
    checkinStatus: 'pendente',
    facial: 'nao-cadastrado',
    facialStatus: 'nao_cadastrado'
  }
];
