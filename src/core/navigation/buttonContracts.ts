/**
 * Registro de Contratos de Botões e Ações Interativas do Event OS.
 * Fase 26.17.2 — Button Contract & Navigation Repair
 */

import type { ButtonContract } from './navigationTypes'

export const CRITICAL_BUTTON_CONTRACTS: ButtonContract[] = [
  // 1. Cockpit 360
  {
    id: 'cockpit-open-inventory',
    module: 'cockpit',
    label: 'Inventário',
    actionType: 'navigate',
    target: 'event-inventory',
    requiredContext: ['eventId']
  },
  {
    id: 'cockpit-open-customer360',
    module: 'cockpit',
    label: 'Customer 360',
    actionType: 'navigate',
    target: 'event-customer-360',
    requiredContext: ['eventId']
  },
  {
    id: 'cockpit-open-finance',
    module: 'cockpit',
    label: 'Financeiro',
    actionType: 'navigate',
    target: 'finance-dashboard'
  },
  {
    id: 'cockpit-open-sac',
    module: 'cockpit',
    label: 'Atendimento / SAC',
    actionType: 'navigate',
    target: 'sac-hub'
  },

  // 2. Inventário
  {
    id: 'inventory-new-lot',
    module: 'inventory',
    label: 'Novo lote',
    actionType: 'modal',
    requiredContext: ['eventId']
  },
  {
    id: 'inventory-new-hold',
    module: 'inventory',
    label: 'Criar hold',
    actionType: 'modal',
    requiredContext: ['eventId']
  },
  {
    id: 'inventory-refresh',
    module: 'inventory',
    label: 'Atualizar inventário',
    actionType: 'api',
    requiredContext: ['eventId']
  },

  // 3. Customer 360
  {
    id: 'customer360-search',
    module: 'customer360',
    label: 'Pesquisar',
    actionType: 'api',
    requiredContext: ['eventId']
  },
  {
    id: 'customer360-open-profile',
    module: 'customer360',
    label: 'Investigar no Event OS',
    actionType: 'drawer',
    requiredContext: ['eventId', 'entityId']
  },
  {
    id: 'customer360-nav-sac',
    module: 'customer360',
    label: 'SAC',
    actionType: 'navigate',
    target: 'sac-hub'
  },
  {
    id: 'customer360-nav-finance',
    module: 'customer360',
    label: 'Financeiro',
    actionType: 'navigate',
    target: 'finance-dashboard'
  },

  // 4. Live Operations
  {
    id: 'liveops-refresh',
    module: 'live-operations',
    label: 'Atualizar',
    actionType: 'api',
    requiredContext: ['eventId']
  },
  {
    id: 'liveops-nav-sac',
    module: 'live-operations',
    label: 'SAC',
    actionType: 'navigate',
    target: 'sac-hub'
  },

  // 5. Incident Center
  {
    id: 'incidents-create',
    module: 'incidents',
    label: 'Abrir incidente',
    actionType: 'modal',
    requiredContext: ['eventId']
  },
  {
    id: 'incidents-nav-sac',
    module: 'incidents',
    label: 'SAC',
    actionType: 'navigate',
    target: 'sac-hub'
  },

  // 6. Day Command
  {
    id: 'daycommand-open-incidents',
    module: 'day-command',
    label: 'Abrir incidente',
    actionType: 'modal',
    requiredContext: ['eventId']
  },
  {
    id: 'daycommand-nav-sac',
    module: 'day-command',
    label: 'SAC',
    actionType: 'navigate',
    target: 'sac-hub'
  },

  // 7. Revenue Intelligence
  {
    id: 'revenue-nav-pricing-request',
    module: 'revenue-intel',
    label: 'Solicitar Mudança de Preço',
    actionType: 'modal',
    requiredContext: ['eventId']
  },

  // 8. Forecast Center
  {
    id: 'forecast-simulate',
    module: 'forecast-center',
    label: 'Simular Cenário',
    actionType: 'api',
    requiredContext: ['eventId']
  },
  {
    id: 'forecast-recalculate',
    module: 'forecast-center',
    label: 'Recalcular Previsão',
    actionType: 'api',
    requiredContext: ['eventId']
  },

  // 9. Disk Intelligence
  {
    id: 'intelligence-analyze',
    module: 'disk-intelligence',
    label: 'Analisar agora',
    actionType: 'api',
    requiredContext: ['eventId']
  },
  {
    id: 'intelligence-ask',
    module: 'disk-intelligence',
    label: 'Consultar Inteligência',
    actionType: 'api',
    requiredContext: ['eventId']
  },

  // 10. Executive Dashboard
  {
    id: 'executive-presentation-toggle',
    module: 'executive-dashboard',
    label: 'Modo TV',
    actionType: 'drawer',
    requiredContext: ['eventId']
  },
  {
    id: 'executive-export-pdf',
    module: 'executive-dashboard',
    label: 'PDF Executivo',
    actionType: 'download',
    requiredContext: ['eventId']
  },
  {
    id: 'executive-export-excel',
    module: 'executive-dashboard',
    label: 'Excel',
    actionType: 'download',
    requiredContext: ['eventId']
  },
  {
    id: 'executive-nav-finance',
    module: 'executive-dashboard',
    label: 'Centro Financeiro',
    actionType: 'navigate',
    target: 'finance-dashboard'
  },
  {
    id: 'executive-nav-refunds',
    module: 'executive-dashboard',
    label: 'Estornos',
    actionType: 'navigate',
    target: 'finance-refunds'
  },

  // 11. Estornos (Canônico & Protegido)
  {
    id: 'refunds-canonical-open',
    module: 'estornos',
    label: 'Estornos',
    actionType: 'navigate',
    target: '/app/finance-refunds'
  }
]
