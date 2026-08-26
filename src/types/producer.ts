export interface Producer {
  id: string;
  name: string;
  legalName: string;
  cnpj: string;
  logoInitial: string;
  activeEventsCount: number;
  totalEventsCount: number;
  verified: boolean;
  avatarColor: string;
}

export type NavigationPage = 
  | 'dashboard'
  | 'produtora'
  | 'status-faciais'
  | 'eventos'
  | 'dashboard-evento'
  | 'novo-evento'
  | 'editar-evento'
  | 'lotes'
  | 'participantes'
  | 'categorias-setores'
  | 'cupons'
  | 'cortesias'
  | 'financeiro'
  | 'saldo'
  | 'vendas'
  | 'recebimentos'
  | 'repasses'
  | 'conciliacao'
  | 'fluxo-caixa'
  | 'extrato'
  | 'terminais-pos'
  | 'atendimento'
  | 'marketing'
  | 'campanhas'
  | 'pixel-meta'
  | 'google-analytics'
  | 'remarketing'
  | 'mensagens'
  | 'gerenciar-acessos'
  | 'administracao'
  | 'clube-beneficios';
