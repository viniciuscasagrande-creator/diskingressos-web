import type { PageKey } from '../components/ModuleSidebar'

export type FinanceReferenceScreen = {
  id: string
  title: string
  page: PageKey
  group: 'caixa' | 'advanced' | 'liquidacao' | 'controle'
  functions: string[]
  integration: string[]
}

/**
 * Catálogo funcional baseado no mapa do Financeiro de referência.
 * Ele NÃO injeta valores fictícios: apenas descreve as telas e os contratos
 * funcionais que devem ser atendidos pelas páginas/API existentes.
 */
export const financeReferenceScreens: FinanceReferenceScreen[] = [
  { id:'saldo', title:'Saldo', page:'finance', group:'caixa', functions:['Consolidar saldo disponível, bloqueado e futuro','Filtrar por produtor/evento','Abrir fluxo de repasse'], integration:['/api/finance/balance','tenant producerId'] },
  { id:'repasse', title:'Solicitação de Repasse', page:'finance-payouts', group:'caixa', functions:['Selecionar conta bancária','Informar valor','Validar elegibilidade','Solicitar/aprovar/agendar/pagar/cancelar','Consultar histórico'], integration:['settlement payouts API','auditoria'] },
  { id:'antecipacao', title:'Antecipações', page:'finance-advance', group:'caixa', functions:['Simular antecipação','Calcular taxas e líquido','Criar solicitação','Aprovar e contratar'], integration:['settlement advances API','recebíveis'] },
  { id:'extrato', title:'Extrato Financeiro', page:'finance-statement', group:'caixa', functions:['Pesquisar transações','Filtrar período/tipo/evento','Distinguir crédito e débito','Exportar'], integration:['finance statement API','CSV/PDF'] },
  { id:'despesas', title:'Despesas', page:'finance-expenses', group:'caixa', functions:['Cadastrar despesa','Categorizar','Vincular evento','Editar/consultar'], integration:['despesas financeiras','tenant/event scope'] },
  { id:'contas-bancarias', title:'Contas Bancárias', page:'finance-bank-accounts', group:'caixa', functions:['Cadastrar conta','Definir conta principal','Configurar PIX/dados bancários','Editar/ativar/desativar'], integration:['bank accounts','permissões'] },
  { id:'advanced', title:'Financeiro Advanced', page:'finance-advanced', group:'advanced', functions:['Consolidar caixa, receber e pagar','Exibir liquidez e resultado','Acompanhar inadimplência'], integration:['finance summaries','receivables/payables'] },
  { id:'conciliacao', title:'Conciliação Bancária', page:'finance-reconciliation', group:'advanced', functions:['Importar/consultar movimentos','Identificar divergências','Sugerir conciliação','Conciliar/ajustar'], integration:['reconciliation API','audit log'] },
  { id:'spread', title:'Financeiro Spread', page:'finance-spread', group:'advanced', functions:['Calcular margem','Comparar adquirentes','Exibir taxas e custos','Histórico de simulações'], integration:['spread dashboard/history','acquirers'] },
  { id:'simulador-spread', title:'Simulador de Spread', page:'finance-spread-simulator', group:'advanced', functions:['Simular preço, MDR, parcelamento e antecipação','Comparar adquirentes','Salvar simulação'], integration:['spread simulate/compare','spread history'] },
  { id:'inteligencia', title:'Inteligência Financeira', page:'finance-intelligence', group:'advanced', functions:['Consolidar indicadores','Gerar alertas de divergência/margem','Apoiar análise de rentabilidade'], integration:['operations summary','insights'] },
  { id:'operadoras', title:'Operadoras / Adquirentes', page:'finance-operators', group:'advanced', functions:['Cadastrar adquirente','Configurar MDR crédito/débito/PIX','Prazo de liquidação','Taxa de antecipação'], integration:['card acquirers API','tax matrix'] },
  { id:'gateways', title:'Gateways de Pagamento', page:'finance-gateways', group:'advanced', functions:['Cadastrar gateway','Definir ambiente/prioridade','Validar configuração','Ativar/desativar'], integration:['payment gateways API','secret-safe configuration'] },
  { id:'split', title:'Split Financeiro', page:'finance-split', group:'liquidacao', functions:['Configurar beneficiários','Definir percentuais/regras','Simular divisão','Aplicar split'], integration:['finance splits API','settlement'] },
  { id:'metodos', title:'Métodos de Pagamento', page:'finance-methods', group:'liquidacao', functions:['Ativar PIX/crédito/débito/boleto','Configurar tarifa/MDR','Configurar parcelamento/prazo'], integration:['payment method rules API'] },
  { id:'customizados', title:'Pagamentos Customizados', page:'finance-custom', group:'liquidacao', functions:['Criar regras especiais por evento/produtor','Definir tarifas/acordos','Consultar condições'], integration:['finance custom rules'] },
  { id:'bordero', title:'Borderô', page:'finance-bordero', group:'liquidacao', functions:['Gerar demonstrativo','Calcular líquido','Programar pagamento','Assinatura e histórico'], integration:['borderô/accounting bridge','documents/signatures'] },
  { id:'pdv', title:'Pontos de Venda (PDV)', page:'pos', group:'liquidacao', functions:['Gerenciar terminais','Acompanhar vendas presenciais','Consolidar operação por ponto'], integration:['POS module','sales'] },
  { id:'recebiveis', title:'Recebíveis', page:'finance-receivables', group:'controle', functions:['Consultar agenda','Filtrar vencimentos','Acompanhar liquidação/adquirente'], integration:['receivables API'] },
  { id:'pagar', title:'Contas a Pagar', page:'finance-payables', group:'controle', functions:['Cadastrar/consultar obrigações','Vencimentos','Status e programação'], integration:['payables API'] },
  { id:'fluxo-caixa', title:'Fluxo de Caixa', page:'finance-cashflow', group:'controle', functions:['Entradas e saídas','Previsto x realizado','Projeção'], integration:['cashflow API'] },
  { id:'estornos', title:'Devoluções / Estornos', page:'finance-refunds', group:'controle', functions:['Solicitar total/parcial','Aprovar/processar','Atualizar pedido/recebível/split','Auditar status'], integration:['refund/disputes API','gateway/acquirer'] },
  { id:'relatorios', title:'Relatórios Financeiros', page:'finance-reports', group:'controle', functions:['Filtrar período/evento','Consolidar indicadores','Exportar'], integration:['finance reporting'] },
]
