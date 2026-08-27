import React from 'react';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';
import type { NavigationPage } from '../../types/producer';

interface ModuleTitleBarProps {
  currentPage: NavigationPage;
  customTitle?: string;
}

const pageTitles: Partial<Record<NavigationPage, string>> = {
  'dashboard': 'Dashboard Executivo',
  'produtora': 'Dados da Produtora',
  'eventos': 'Hub de Eventos',
  'nucleo-operacional': 'Núcleo Operacional',
  'novo-evento': 'Novo Evento',
  'editar-evento': 'Editar Evento',
  'lotes': 'Configurar Lotes',
  'participantes': 'Participantes & Portaria',
  'dashboard-evento': 'Dashboard do Evento',
  // Navegação Contextual por Evento (Fase 15)
  'evento-dashboard': 'Dashboard do Evento',
  'evento-ingressos': 'Consultar Ingressos',
  'evento-cortesias': 'Cortesias do Evento',
  'evento-relatorios': 'Relatórios de Vendas',
  'evento-detalhes': 'Detalhes do Evento',
  'evento-pixel': 'Pixel GA & Meta Ads',
  'evento-utm': 'Links UTM & QR Codes',
  'evento-analytics': 'Analytics GA4',
  'evento-trafego': 'Tráfego do Site',
  'evento-meta-ads': 'Campanhas Meta Ads',
  'evento-remarketing': 'Remarketing do Evento',
  'evento-lotes': 'Lotes & Setores',
  'evento-checkin': 'Check-in ao Vivo',
  'evento-usuarios': 'Usuários do Evento',
  'evento-logs': 'Logs do Evento',
  // Financeiro
  'financeiro': 'Hub Financeiro',
  'fin-hub': 'Hub Financeiro',
  'fin-saldo': 'Saldo Consolidado',
  'saldo': 'Saldo Consolidado',
  'fin-repasses': 'Solicitações de Repasse',
  'repasses': 'Solicitações de Repasse',
  'fin-antecipacoes': 'Antecipações de Recebíveis',
  'fin-extrato': 'Extrato Detalhado',
  'extrato': 'Extrato Detalhado',
  'vendas': 'Vendas & Recebimentos',
  'fluxo-caixa': 'Fluxo de Caixa',
  'fin-despesas': 'Gestão de Despesas',
  'fin-contas': 'Contas Bancárias & Pix',
  'fin-bordero': 'Borderô / Assinaturas Digitais',
  'fin-negociacoes': 'Negociações Comerciais',
  'fin-advanced': 'Financeiro Advanced',
  'fin-split': 'Split Financeiro Automatizado',
  'fin-inteligencia': 'Inteligência Financeira (IA)',
  'fin-conciliacao': 'Conciliação Bancária',
  'conciliacao': 'Conciliação Bancária',
  'fin-spread': 'Simulador de Spread & Lucro',
  // POS
  'terminais-pos': 'Hub POS / PDV',
  'pos-terminals': 'Gerenciamento de Terminais POS',
  'pos-sales': 'Vendas Presenciais',
  'pos-closing': 'Fechamento de Caixa',
  // Marketing (Fase 11)
  'marketing': 'Hub Marketing',
  'mkt-hub': 'Hub Marketing',
  'mkt-dashboard': 'Dashboard de Marketing',
  'mkt-campaigns': 'Campanhas',
  'mkt-new-campaign': 'Criar Campanha',
  'campanhas': 'Campanhas',
  'mkt-automations': 'Automações de Marketing',
  'mkt-whatsapp': 'WhatsApp Marketing',
  'mkt-email': 'E-mail Marketing',
  'mkt-coupons': 'Cupons e Promoções',
  'cupons': 'Cupons e Promoções',
  'mkt-links': 'Links, UTMs e QR Codes',
  'mkt-affiliates': 'Afiliados e Parceiros',
  'mkt-analytics': 'Pixel & Analytics (Herança)',
  'pixel-meta': 'Pixel & Analytics',
  'google-analytics': 'Pixel & Analytics',
  'mkt-comm-integrations': 'Integrações de Comunicação',
  'mkt-reports': 'Relatórios de Marketing',
  // Remarketing (Fase 11)
  'remarketing': 'Central de Remarketing',
  'rmk-hub': 'Hub de Remarketing',
  'rmk-dashboard': 'Dashboard Remarketing',
  'rmk-carts': 'Carrinhos Abandonados',
  'mkt-abandoned': 'Carrinhos Abandonados',
  'rmk-audiences': 'Gestão de Públicos',
  'rmk-segments': 'Segmentações Avançadas',
  'rmk-flows': 'Fluxos de Recuperação',
  'rmk-whatsapp': 'WhatsApp Remarketing',
  'rmk-email': 'E-mail Remarketing',
  'rmk-payments': 'Recuperação de Pagamentos',
  'rmk-inactive': 'Clientes Inativos',
  'rmk-postevent': 'Pós-Evento & Reengajamento',
  'rmk-automation': 'Remarketing Automático',
  'rmk-reports': 'Relatórios de Recuperação',
  // Atendimento / SAC (Fase 14 ITIL & Service Desk)
  'atendimento': 'Central de Atendimento & SAC',
  'sac-hub': 'Hub de Atendimento',
  'sac-dashboard': 'Dashboard SAC',
  'sac-tickets': 'Fila de Chamados',
  'sac-new': 'Abrir Novo Chamado',
  'sac-sla': 'Políticas de SLA & ITIL',
  'sac-integrations': 'Integrações Omnichannel',
  'sac-knowledge': 'Base de Conhecimento (KEDB)',
  'sac-reports': 'Relatórios de Atendimento',
  // Administração (Fase 8)
  'administracao': 'Central Administrativa',
  'admin-hub': 'Central Administrativa',
  'gerenciar-usuarios': 'Usuários e Acessos',
  'admin-users': 'Usuários e Acessos',
  'admin-producers': 'Produtoras Cadastradas',
  'admin-permissions': 'Perfis e Permissões (RBAC)',
  'logs-auditoria': 'Logs de Auditoria',
  'admin-audit': 'Logs de Auditoria',
  'admin-security': 'Configurações de Segurança',
};

function getModuleName(page: NavigationPage): string {
  if (page.startsWith('evento-') || page === 'dashboard-evento') {
    return 'Painel do Evento';
  }
  if (['eventos', 'novo-evento', 'editar-evento', 'lotes', 'participantes', 'nucleo-operacional'].includes(page)) {
    return 'Eventos';
  }
  if (page.startsWith('fin-') || ['financeiro', 'saldo', 'vendas', 'recebimentos', 'repasses', 'conciliacao', 'fluxo-caixa', 'extrato'].includes(page)) {
    return 'Financeiro';
  }
  if (page.startsWith('pos-') || page === 'terminais-pos') {
    return 'Terminais POS';
  }
  if (page.startsWith('mkt-') || ['marketing', 'campanhas', 'pixel-meta', 'google-analytics', 'cupons'].includes(page)) {
    return 'Marketing';
  }
  if (page.startsWith('rmk-') || ['remarketing', 'mkt-abandoned'].includes(page)) {
    return 'Remarketing';
  }
  if (page.startsWith('sac-') || page === 'atendimento') {
    return 'Atendimento / SAC';
  }
  if (page.startsWith('admin-') || ['administracao', 'gerenciar-usuarios', 'logs-auditoria'].includes(page)) {
    return 'Administração';
  }
  return 'Gestão';
}

export const ModuleTitleBar: React.FC<ModuleTitleBarProps> = ({ currentPage, customTitle }) => {
  const title = customTitle || pageTitles[currentPage] || 'DiskIngressos Gestão';
  const moduleName = getModuleName(currentPage);

  return (
    <div className="w-full bg-white border-b border-[#CBD5E1]/80 px-6 py-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
      {/* Limitless Page Title + Breadcrumbs */}
      <div>
        {/* Breadcrumb row */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-0.5">
          <span className="flex items-center gap-1 hover:text-slate-600 transition">
            <Home size={12} />
            <span>Home</span>
          </span>
          <ChevronRight size={11} className="text-slate-300" />
          <span className="text-slate-500 hover:text-slate-700 transition">{moduleName}</span>
          <ChevronRight size={11} className="text-slate-300" />
          <span className="text-[#1677FF] font-bold">{title}</span>
        </div>

        {/* Big Bold Title */}
        <h1 className="text-[20px] sm:text-[22px] font-black tracking-tight text-[#0E1726]">
          {title}
        </h1>
      </div>

      {/* Right-side Limitless info badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
          <ShieldCheck size={13} className="text-[#1677FF]" />
          <span>Ambiente Seguro Multi-Tenant</span>
        </span>
      </div>
    </div>
  );
};
