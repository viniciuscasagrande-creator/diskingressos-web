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
  // Hub Financeiro & Modules
  | 'financeiro'
  | 'fin-hub'
  | 'fin-saldo'
  | 'fin-repasses'
  | 'fin-antecipacoes'
  | 'fin-extrato'
  | 'fin-despesas'
  | 'fin-contas'
  | 'fin-bordero'
  | 'fin-negociacoes'
  | 'fin-advanced'
  | 'fin-split'
  | 'fin-inteligencia'
  | 'fin-conciliacao'
  | 'fin-spread'
  | 'saldo'
  | 'vendas'
  | 'recebimentos'
  | 'repasses'
  | 'conciliacao'
  | 'fluxo-caixa'
  | 'extrato'
  // POS
  | 'terminais-pos'
  | 'pos-terminals'
  | 'pos-sales'
  | 'pos-closing'
  // Outros
  | 'atendimento'
  | 'marketing'
  | 'campanhas'
  | 'pixel-meta'
  | 'google-analytics'
  | 'remarketing'
  | 'mensagens'
  // Admin & Multi-Tenant (Fase 7)
  | 'gerenciar-acessos'
  | 'gerenciar-usuarios'
  | 'logs-auditoria'
  | 'administracao'
  | 'clube-beneficios';
