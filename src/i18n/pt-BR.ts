/**
 * Dicionário Oficial de Termos em Português do Brasil (pt-BR).
 * Fase 26.17.3.1 — Padronização Total PT-BR
 */

export const UI_DICTIONARY: Record<string, string> = {
  // Módulos e Seções
  Dashboard: 'Painel',
  'Executive Dashboard': 'Painel Executivo',
  'Customer 360': 'Cliente 360°',
  'Global Search': 'Pesquisa Global',
  'Live Operations': 'Operação ao Vivo',
  'Incident Center': 'Central de Incidentes',
  'Event Day Command': 'Central do Dia do Evento',
  'Revenue Intelligence': 'Inteligência de Receita',
  'Pricing Intelligence': 'Inteligência de Preços',
  'Revenue & Pricing Intelligence': 'Inteligência de Receita e Preços',
  'Forecast Center': 'Central de Previsões',
  Readiness: 'Preparação do Evento',
  'Go-Live': 'Liberação do Evento',
  'Disk Intelligence': 'Inteligência Disk',
  'Platform Operations': 'Operações da Plataforma',
  'Activity Stream': 'Histórico de Atividades',
  Inventory: 'Inventário',
  Insights: 'Análises Inteligentes',
  'Health Score': 'Índice de Saúde',
  Settings: 'Configurações',

  // Ações Comuns
  Search: 'Pesquisar',
  Refresh: 'Atualizar',
  Export: 'Exportar',
  Save: 'Salvar',
  Cancel: 'Cancelar',
  Close: 'Fechar',
  Edit: 'Editar',
  Delete: 'Excluir',
  Details: 'Detalhes',
  View: 'Visualizar',
  Compare: 'Comparar',
  Retry: 'Tentar novamente',

  // Estados de Interface
  Loading: 'Carregando...',
  'No data': 'Sem dados disponíveis',
  Error: 'Erro de comunicação',
  Success: 'Sucesso'
}

export function translateTerm(term: string): string {
  return UI_DICTIONARY[term] || term
}
