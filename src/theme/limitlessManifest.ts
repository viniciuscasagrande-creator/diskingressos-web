/** SafeSaff Fase 25.3.4 — mapa funcional do pacote Limitless licenciado. */
export const LIMITLESS_RELEASE = '25.3.4-limitless-enterprise-ui-2026-09-02'

export const limitlessCapabilities = {
  layout: ['navbar', 'sidebar', 'multiple-sidebars', 'boxed', 'sticky', 'fixed', 'responsive'],
  navigation: ['vertical', 'horizontal', 'accordion', 'collapsible', 'tabs', 'mega-menu', 'badges'],
  forms: ['validation', 'wizards', 'selects', 'inputs', 'upload', 'editors'],
  tables: ['responsive', 'sorting', 'filtering', 'export', 'fixed-columns', 'reorder', 'scroller'],
  charts: ['echarts', 'd3', 'c3', 'sparklines', 'maps', 'heatmaps', 'funnels', 'waterfalls'],
  feedback: ['modal', 'offcanvas', 'toast', 'popover', 'tooltip', 'alerts'],
  pages: ['dashboard', 'login', 'profile', 'inbox', 'chat', 'timeline'],
} as const
