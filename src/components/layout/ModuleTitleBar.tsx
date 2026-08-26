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
  // Outros
  'atendimento': 'Atendimento & SAC',
  'marketing': 'Marketing & Campanhas',
  'campanhas': 'Campanhas de Tráfego',
  'pixel-meta': 'Pixel Meta & Rastreamento',
  'remarketing': 'Remarketing & Recuperação de Vendas',
  'administracao': 'Administração & Acessos',
  'gerenciar-acessos': 'Gerenciar Acessos',
};

export const ModuleTitleBar: React.FC<ModuleTitleBarProps> = ({ currentPage, customTitle }) => {
  const title = customTitle || pageTitles[currentPage] || 'DiskIngressos Gestão';

  return (
    <div className="w-full bg-white border-b border-[#CBD5E1]/70 px-6 py-4 shadow-xs flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight text-[#0D1726]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider hidden md:inline">
          Painel do Produtor
        </span>
      </div>
    </div>
  );
};
