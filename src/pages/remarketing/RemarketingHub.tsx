import React, { useState } from 'react';
import { 
  Repeat2, LayoutDashboard, ShoppingCart, Users, 
  Layers, Zap, MessageCircle, Mail, Clock3, 
  UserX, PartyPopper, Sparkles, FileText, ArrowUpRight
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { RemarketingDashboardPage } from './RemarketingDashboardPage';
import { AbandonedCartPage } from '../marketing/AbandonedCartPage';

export type RemarketingSubTab = 
  | 'rmk-hub'
  | 'rmk-dashboard'
  | 'rmk-carts'
  | 'rmk-audiences'
  | 'rmk-segments'
  | 'rmk-flows'
  | 'rmk-whatsapp'
  | 'rmk-email'
  | 'rmk-payments'
  | 'rmk-inactive'
  | 'rmk-postevent'
  | 'rmk-automation'
  | 'rmk-reports';

interface RemarketingHubProps {
  events: EventItem[];
  producerName?: string;
  initialTab?: RemarketingSubTab;
  notify?: (msg: string) => void;
}

export const RemarketingHub: React.FC<RemarketingHubProps> = ({
  events,
  producerName = 'DiskIngressos Produções',
  initialTab = 'rmk-dashboard',
  notify,
}) => {
  const [activeTab, setActiveTab] = useState<RemarketingSubTab>(initialTab);

  const modules = [
    { id: 'rmk-dashboard', title: 'Dashboard', desc: 'Recuperação, receita e conversão em tempo real.', icon: LayoutDashboard, color: 'text-rose-600' },
    { id: 'rmk-carts', title: 'Carrinhos Abandonados', desc: 'Sessões interrompidas e disparos multicanal.', icon: ShoppingCart, color: 'text-orange-500' },
    { id: 'rmk-audiences', title: 'Públicos', desc: 'Audiências prontas para ativação e remarketing.', icon: Users, color: 'text-purple-600' },
    { id: 'rmk-segments', title: 'Segmentações', desc: 'Regras e grupos inteligentes de participantes.', icon: Layers, color: 'text-blue-600' },
    { id: 'rmk-flows', title: 'Fluxos de Recuperação', desc: 'Jornadas automatizadas por tempo e gatilho.', icon: Zap, color: 'text-amber-500' },
    { id: 'rmk-whatsapp', title: 'WhatsApp Remarketing', desc: 'Mensagens diretas de recuperação com 1 clique.', icon: MessageCircle, color: 'text-[#25D366]' },
    { id: 'rmk-email', title: 'E-mail Remarketing', desc: 'Jornadas e campanhas automáticas de retorno.', icon: Mail, color: 'text-blue-500' },
    { id: 'rmk-payments', title: 'Recuperação de Pagamento', desc: 'PIX pendente, boletos e recusa de cartão.', icon: Clock3, color: 'text-rose-500' },
    { id: 'rmk-inactive', title: 'Clientes Inativos', desc: 'Reativação e recorrência de compradores antigos.', icon: UserX, color: 'text-slate-600' },
    { id: 'rmk-postevent', title: 'Pós-Evento', desc: 'Pesquisas de satisfação e venda de próximos shows.', icon: PartyPopper, color: 'text-indigo-600' },
    { id: 'rmk-automation', title: 'Remarketing Automático', desc: 'Gatilhos contínuos e inteligência preditiva.', icon: Sparkles, color: 'text-purple-500' },
    { id: 'rmk-reports', title: 'Relatórios', desc: 'Performance consolidada e receita recuperada.', icon: FileText, color: 'text-emerald-600' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rmk-hub')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rmk-hub'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Repeat2 size={15} />
          <span>Hub Remarketing</span>
        </button>

        <button
          onClick={() => setActiveTab('rmk-dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rmk-dashboard'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('rmk-carts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rmk-carts'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShoppingCart size={15} />
          <span>Carrinhos Abandonados</span>
        </button>

        <button
          onClick={() => setActiveTab('rmk-flows')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rmk-flows'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Zap size={15} />
          <span>Fluxos & Automações</span>
        </button>
      </div>

      {/* 1. Hub View */}
      {activeTab === 'rmk-hub' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                REMARKETING & GROWTH
              </span>
            </div>
            <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
              Central de Remarketing & Reengajamento
            </h2>
            <p className="text-[12px] text-[#718096] mt-0.5">
              Recupere oportunidades de checkout e reengaje compradores com jornadas multicanal automatizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(({ id, title, desc, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => {
                  if (id === 'rmk-dashboard' || id === 'rmk-carts' || id === 'rmk-flows') {
                    setActiveTab(id as RemarketingSubTab);
                  } else if (notify) {
                    notify(`Módulo ${title} selecionado.`);
                  }
                }}
                className="flex items-start justify-between p-4 rounded-card bg-white border border-[#E2E8F0] hover:border-rose-400 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-btn bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#0E1726] block group-hover:text-rose-600 transition-colors">
                      {title}
                    </strong>
                    <span className="text-[11px] text-[#718096] block mt-0.5">
                      {desc}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-rose-600 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Dashboard View */}
      {activeTab === 'rmk-dashboard' && (
        <RemarketingDashboardPage
          events={events}
          producerName={producerName}
          onNavigateToTab={(tab) => setActiveTab(tab as RemarketingSubTab)}
          notify={notify}
        />
      )}

      {/* 3. Carts View */}
      {activeTab === 'rmk-carts' && (
        <AbandonedCartPage notify={notify} />
      )}

      {/* 4. Flows View / Other views placeholder */}
      {activeTab !== 'rmk-hub' && activeTab !== 'rmk-dashboard' && activeTab !== 'rmk-carts' && (
        <div className="bg-white p-8 rounded-card border border-[#E2E8F0] text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mx-auto">
            <Zap size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Módulo Ativo e Configurado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Jornadas e regras automatizadas vinculadas com isolamento por produtora e evento.
          </p>
        </div>
      )}
    </div>
  );
};
