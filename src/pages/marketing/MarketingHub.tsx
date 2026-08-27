import React, { useState } from 'react';
import { 
  LayoutDashboard, Megaphone, ShoppingCart, Link, 
  Tag, Sliders, MessageCircle, Mail, Users, 
  TrendingUp, Layers3, Sparkles, Plus, FileText, ArrowUpRight
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { MarketingDashboardPage } from './MarketingDashboardPage';
import { MarketingCampaignsPage } from './MarketingCampaignsPage';
import { UtmLinksPage } from './UtmLinksPage';
import { PixelInheritancePage } from './PixelInheritancePage';
import { CouponsPromoPage } from './CouponsPromoPage';

export type MarketingSubTab = 
  | 'mkt-hub'
  | 'mkt-dashboard'
  | 'mkt-campaigns'
  | 'mkt-new-campaign'
  | 'mkt-automations'
  | 'mkt-whatsapp'
  | 'mkt-email'
  | 'mkt-coupons'
  | 'mkt-links'
  | 'mkt-affiliates'
  | 'mkt-analytics'
  | 'mkt-reports';

interface MarketingHubProps {
  events: EventItem[];
  initialTab?: MarketingSubTab;
  notify?: (msg: string) => void;
}

export const MarketingHub: React.FC<MarketingHubProps> = ({
  events,
  initialTab = 'mkt-dashboard',
  notify,
}) => {
  const [activeTab, setActiveTab] = useState<MarketingSubTab>(initialTab);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const modules = [
    { id: 'mkt-dashboard', title: 'Dashboard', desc: 'KPIs, funil de conversão e desempenho geral.', icon: LayoutDashboard, color: 'text-[#7C3AED]' },
    { id: 'mkt-campaigns', title: 'Campanhas', desc: 'Criação, agendamento e métricas de anúncios.', icon: Megaphone, color: 'text-purple-600' },
    { id: 'mkt-automations', title: 'Automações', desc: 'Fluxos automáticos de comunicação e gatilhos.', icon: Sparkles, color: 'text-blue-500' },
    { id: 'mkt-whatsapp', title: 'WhatsApp', desc: 'Campanhas diretas e mensagens transacionais.', icon: MessageCircle, color: 'text-[#25D366]' },
    { id: 'mkt-email', title: 'E-mail Marketing', desc: 'Disparos em massa e newsletters segmentadas.', icon: Mail, color: 'text-blue-600' },
    { id: 'mkt-coupons', title: 'Cupons e Promoções', desc: 'Ofertas, vouchers e descontos progressivos.', icon: Tag, color: 'text-emerald-600' },
    { id: 'mkt-links', title: 'Links, UTMs e QR Codes', desc: 'Rastreamento de origem, totens e atribuição.', icon: Link, color: 'text-amber-500' },
    { id: 'mkt-affiliates', title: 'Afiliados e Parceiros', desc: 'Performance de parceiros e comissionamento.', icon: Users, color: 'text-indigo-600' },
    { id: 'mkt-analytics', title: 'Pixel & Analytics', desc: 'Sistema de herança: Meta, GA4, GTM e TikTok.', icon: Sliders, color: 'text-pink-600' },
    { id: 'mkt-reports', title: 'Relatórios', desc: 'ROI, ROAS, canais e exportação de dados.', icon: FileText, color: 'text-slate-600' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-card p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mkt-hub')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mkt-hub'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Megaphone size={15} />
          <span>Hub Marketing</span>
        </button>

        <button
          onClick={() => setActiveTab('mkt-dashboard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mkt-dashboard'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('mkt-campaigns')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mkt-campaigns'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Megaphone size={15} />
          <span>Campanhas</span>
        </button>

        <button
          onClick={() => setActiveTab('mkt-coupons')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mkt-coupons'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Tag size={15} />
          <span>Cupons & Promoções</span>
        </button>

        <button
          onClick={() => setActiveTab('mkt-links')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mkt-links'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Link size={15} />
          <span>Links & UTMs</span>
        </button>

        <button
          onClick={() => setActiveTab('mkt-analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-btn text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mkt-analytics'
              ? 'bg-[#7C3AED] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sliders size={15} />
          <span>Pixel & Analytics</span>
        </button>
      </div>

      {/* 1. Hub View */}
      {activeTab === 'mkt-hub' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                MARKETING
              </span>
            </div>
            <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
              Central de Marketing & Crescimento
            </h2>
            <p className="text-[12px] text-[#718096] mt-0.5">
              Centralize aquisição de clientes, campanhas de mídia, automações, promoções e mensuração de ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(({ id, title, desc, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => {
                  if (['mkt-dashboard', 'mkt-campaigns', 'mkt-coupons', 'mkt-links', 'mkt-analytics'].includes(id)) {
                    setActiveTab(id as MarketingSubTab);
                  } else if (notify) {
                    notify(`Módulo ${title} selecionado.`);
                  }
                }}
                className="flex items-start justify-between p-4 rounded-card bg-white border border-[#E2E8F0] hover:border-purple-400 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-btn bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#0E1726] block group-hover:text-[#7C3AED] transition-colors">
                      {title}
                    </strong>
                    <span className="text-[11px] text-[#718096] block mt-0.5">
                      {desc}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Dashboard View */}
      {activeTab === 'mkt-dashboard' && (
        <MarketingDashboardPage
          events={events}
          selectedEventId={selectedEventId}
          onSelectEventId={setSelectedEventId}
          onOpenCreateCampaign={() => setActiveTab('mkt-campaigns')}
          onNavigateToTab={(tab) => setActiveTab(tab as MarketingSubTab)}
          notify={notify}
        />
      )}

      {/* 3. Campaigns View */}
      {activeTab === 'mkt-campaigns' && (
        <MarketingCampaignsPage events={events} notify={notify} />
      )}

      {/* 4. Links & UTMs */}
      {activeTab === 'mkt-links' && (
        <UtmLinksPage notify={notify} />
      )}

      {/* 5. Coupons */}
      {activeTab === 'mkt-coupons' && (
        <CouponsPromoPage events={events} notify={notify} />
      )}

      {/* 6. Pixel & Analytics */}
      {activeTab === 'mkt-analytics' && (
        <PixelInheritancePage events={events} notify={notify} />
      )}

      {/* 7. Other views placeholder */}
      {activeTab !== 'mkt-hub' && activeTab !== 'mkt-dashboard' && activeTab !== 'mkt-campaigns' && activeTab !== 'mkt-links' && activeTab !== 'mkt-coupons' && activeTab !== 'mkt-analytics' && (
        <div className="bg-white p-8 rounded-card border border-[#E2E8F0] text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-[#7C3AED] mx-auto">
            <Megaphone size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Módulo de Marketing Integrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Estrutura configurada com escopo multi-produtor e relatórios em tempo real.
          </p>
        </div>
      )}
    </div>
  );
};
