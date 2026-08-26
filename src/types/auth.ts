export type UserRole = 
  | 'admin-master'
  | 'admin'
  | 'produtor-admin'
  | 'produtor-financeiro'
  | 'produtor-operacional'
  | 'produtor-marketing'
  | 'leitura';

export interface PermissionMatrix {
  events: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  finance: {
    view: boolean;
    requestPayout: boolean;
    anticipate: boolean;
    viewBankAccounts: boolean;
    manageSplit: boolean;
  };
  participants: {
    view: boolean;
    checkin: boolean;
    refund: boolean;
  };
  pos: {
    view: boolean;
    operate: boolean;
    closeCashier: boolean;
  };
  marketing: {
    view: boolean;
    editPixel: boolean;
  };
  admin: {
    manageUsers: boolean;
    manageProducers: boolean;
    viewAuditLogs: boolean;
    settings: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  producerId: string | null; // null = Admin Master (todas as produtoras)
  producerName?: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  lastLogin: string;
  avatarColor: string;
  permissions: PermissionMatrix;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  producerId: string | null;
  producerName: string;
  action: string;
  module: 'Eventos' | 'Financeiro' | 'Participantes' | 'POS' | 'Segurança' | 'Administração';
  details: string;
  ipAddress: string;
  status: 'Concluído' | 'Falha' | 'Alerta';
}
