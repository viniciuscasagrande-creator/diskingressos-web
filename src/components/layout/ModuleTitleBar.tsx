import React from 'react';
import type { NavigationPage } from '../../types/producer';

interface ModuleTitleBarProps {
  currentPage: NavigationPage;
  customTitle?: string;
}

const pageTitles: Partial<Record<NavigationPage, string>> = {
  'dashboard': 'Dashboard Executivo',
  'produtora': 'Dados da Produtora',
  'status-faciais': 'Status Faciais & Biometria',
  'eventos': 'Hub de Eventos',
  'nucleo-operacional': 'Núcleo Operacional',
  'novo-evento': 'Novo Evento',
  'editar-evento': 'Editar Evento',
  'lotes': 'Configurar Lotes',
  'participantes': 'Participantes & Portaria',
  'dashboard-evento': 'Dashboard do Evento',
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
  'mkt-reports': 'Relatórios de Marketing',
  // Remarketing (Fase 11)
  'remarketing': 'Hub Remarketing',
  'rmk-hub': 'Hub Remarketing',
  'rmk-dashboard': 'Dashboard de Remarketing',
  'rmk-carts': 'Carrinhos Abandonados',
  'mkt-abandoned': 'Carrinhos Abandonados',
  'rmk-audiences': 'Públicos & Audiências',
  'rmk-segments': 'Segmentações Inteligentes',
  'rmk-flows': 'Fluxos de Recuperação',
  'rmk-whatsapp': 'WhatsApp Remarketing',
  'rmk-email': 'E-mail Remarketing',
  'rmk-payments': 'Recuperação de Pagamento',
  'rmk-inactive': 'Clientes Inativos & Reativação',
  'rmk-postevent': 'Pós-Evento & Reengajamento',
  'rmk-automation': 'Remarketing Automático',
  'rmk-reports': 'Relatórios de Recuperação',
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
  // Outros
  'atendimento': 'Atendimento & SAC',
};

export const ModuleTitleBar: React.FC<ModuleTitleBarProps> = ({ currentPage, customTitle }) => {
  const title = customTitle || pageTitles[currentPage] || 'DiskIngressos Gestão';

  return (
    <div className="w-full bg-white border-b border-[#CBD5E1]/70 px-6 py-4 shadow-xs flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight text-[#0E1726]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider hidden md:inline">
          Painel de Gestão & Governança
        </span>
      </div>
    </div>
  );
};
