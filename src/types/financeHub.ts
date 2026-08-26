export type FinanceSectionCategory = 
  | 'operacoes-caixa' 
  | 'advanced-inteligencia' 
  | 'simuladores-liquidacoes';

export type FinanceModuleKey = 
  | 'hub'
  | 'saldo-consolidado'
  | 'solicitar-repasse'
  | 'antecipacoes'
  | 'extrato-geral'
  | 'pontos-venda'
  | 'devolucoes-estornos'
  | 'financeiro-advanced'
  | 'conciliacao-bancaria'
  | 'financeiro-spread'
  | 'split-financeiro'
  | 'inteligencia-financeira'
  | 'operadoras-cartao'
  | 'simulador-spread'
  | 'metodos-pagamento'
  | 'pagamentos-customizados'
  | 'despesas'
  | 'bordero-assinaturas'
  | 'contas-bancarias'
  | 'negociacoes';

export interface FinanceModuleMeta {
  key: FinanceModuleKey;
  category: FinanceSectionCategory;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  badgeTone?: 'blue' | 'orange' | 'green' | 'purple' | 'slate';
  accentColor: 'blue' | 'orange' | 'green';
  metrics?: { label: string; value: string };
  tags: string[];
}
