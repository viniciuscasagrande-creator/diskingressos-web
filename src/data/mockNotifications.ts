export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'sale' | 'batch_alert' | 'facial' | 'finance' | 'system';
  read: boolean;
  eventCode?: string;
}

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Virada de Lote Automática',
    message: 'O lote "Passaporte 3 Dias - Early Bird" do evento Curitiba Jazz Festival esgotou 100% dos ingressos.',
    time: 'Há 5 minutos',
    type: 'batch_alert',
    read: false,
    eventCode: '4190'
  },
  {
    id: 'n-2',
    title: 'Pico de Vendas em Cartão',
    message: '14 novos ingressos vendidos nos últimos 15 minutos para Thiago Ventura - Modo Efetivo.',
    time: 'Há 22 minutos',
    type: 'sale',
    read: false,
    eventCode: '4238'
  },
  {
    id: 'n-3',
    title: 'Reconhecimento Facial Aprovado',
    message: '99.2% de conformidade biométrica atingida para o evento Sem Parar - Música e Natureza.',
    time: 'Há 1 hora',
    type: 'facial',
    read: false,
    eventCode: '1760'
  },
  {
    id: 'n-4',
    title: 'Repasse Financeiro Concluído',
    message: 'Repasse no valor de R$ 124.500,00 creditado com sucesso na conta bancária cadastrada.',
    time: 'Hoje, 09:15',
    type: 'finance',
    read: true
  }
];
