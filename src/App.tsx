import React, { useState, useMemo } from 'react';
import type { EventItem, MetaPixelConfig, TicketBatch } from './types/event';
import type { Producer, NavigationPage } from './types/producer';
import type { FinanceModuleKey } from './types/financeHub';
import type { Participant } from './data/participants';
import { mockEvents } from './data/events';
import { mockProducers } from './data/producers';
import { mockParticipants } from './data/participants';

// Auth & Security Provider
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';

// Operational Core (Fase 10)
import OperationsPage from './pages/OperationsPage';

// Marketing & Remarketing Modules (Fase 11)
import { MarketingHub, type MarketingSubTab } from './pages/marketing/MarketingHub';
import { RemarketingHub, type RemarketingSubTab } from './pages/remarketing/RemarketingHub';
import { SupportPage, type SupportMode } from './pages/support/SupportPage';

// Administration Module (Fase 8)
import { AdminHubPage } from './pages/admin/AdminHubPage';
import { UserManagerPage } from './pages/admin/UserManagerPage';
import { ProducersPage } from './pages/admin/ProducersPage';
import { PermissionsPage } from './pages/admin/PermissionsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SecurityPage } from './pages/admin/SecurityPage';

// Layout Components (Phase 6 Template)
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ModuleTitleBar } from './components/layout/ModuleTitleBar';
import { AppFooter } from './components/layout/AppFooter';
import { ScrollTop } from './components/layout/ScrollTop';

// Page Views
import { EventosPage } from './pages/Eventos';
import { EventFormPage } from './pages/EventFormPage';
import { LotsPage } from './pages/LotsPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { EventDashboardPage } from './pages/EventDashboardPage';
import { DashboardPage } from './pages/Dashboard';
import { ProdutoraPage } from './pages/Produtora';
import { StatusFaciaisPage } from './pages/StatusFaciais';
import { FinanceiroPage, type FinanceTab } from './pages/Financeiro';
import { POSPage, type POSTab } from './pages/POSPage';
import { GenericModulePage } from './pages/GenericModulePage';
import { CortesiasPage } from './pages/CortesiasPage';
import { MetaPixelModal } from './components/events/MetaPixelModal';
import { UtmLinksPage } from './pages/marketing/UtmLinksPage';
import { PixelInheritancePage } from './pages/marketing/PixelInheritancePage';
import { MarketingCampaignsPage } from './pages/marketing/MarketingCampaignsPage';
import { MarketingDashboardPage } from './pages/marketing/MarketingDashboardPage';
import { RecoveryCenterPage } from './pages/remarketing/RecoveryCenterPage';
import { Check } from 'lucide-react';

function AuthenticatedApp() {
  const { isAuthenticated, currentUser, activeProducer, allProducers, selectProducer } = useAuth();

  // If not logged in, render Login Page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

  // Global Data State
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  
  // Navigation & Search State
  const [currentPage, setCurrentPage] = useState<NavigationPage>(() => {
    if (currentUser.role === 'admin-master' || currentUser.role === 'admin') {
      return 'dashboard';
    }
    if (currentUser.role === 'produtor-marketing') {
      return 'mkt-dashboard';
    }
    if (currentUser.role === 'produtor-operacional') {
      return 'nucleo-operacional';
    }
    return 'eventos';
  });
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Subpage Contexts
  const [activeEventForDashboard, setActiveEventForDashboard] = useState<EventItem | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<EventItem | null>(null);
  const [selectedEventForLots, setSelectedEventForLots] = useState<EventItem | null>(null);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<EventItem | null>(null);
  const [marketingModalEvent, setMarketingModalEvent] = useState<EventItem | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // MULTI-TENANT ISOLATION: Filter events by active producer
  const scopedEvents = useMemo(() => {
    if (!activeProducer) {
      return events; // Admin Master seeing all producers
    }
    // Filter events strictly belonging to the active producer
    return events.filter(
      (ev) => ev.producerId === activeProducer.id || ev.producerName === activeProducer.name
    );
  }, [events, activeProducer]);

  // Navigation Handlers
  const handleNavigateToNewEvent = () => {
    setSelectedEventForEdit(null);
    setCurrentPage('novo-evento');
  };

  const handleNavigateToEditEvent = (event: EventItem) => {
    setSelectedEventForEdit(event);
    setCurrentPage('editar-evento');
  };

  const handleNavigateToLots = (event: EventItem) => {
    setSelectedEventForLots(event);
    setCurrentPage('lotes');
  };

  const handleNavigateToParticipants = (event: EventItem) => {
    setSelectedEventForParticipants(event);
    setCurrentPage('participantes');
  };

  const handleNavigateToEventDashboard = (event: EventItem) => {
    setActiveEventForDashboard(event);
    setCurrentPage('evento-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Checkin Handler
  const handleToggleCheckin = (participantId: number) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          const next = p.checkin === 'presente' ? 'pendente' : 'presente';
          const time = next === 'presente' ? 'Agora mesmo' : undefined;
          const gate = next === 'presente' ? (p.gate || 'Portão Principal') : undefined;

          return {
            ...p,
            checkin: next,
            checkinStatus: next === 'presente' ? 'realizado' : 'pendente',
            checkinTime: time,
            gate,
          };
        }
        return p;
      })
    );
  };

  // Save/Create Event Handler
  const handleSaveEvent = (savedEvent: EventItem) => {
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === savedEvent.id);
      if (exists) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      } else {
        return [savedEvent, ...prev];
      }
    });

    triggerToast(
      selectedEventForEdit
        ? `Evento "${savedEvent.title}" atualizado com sucesso!`
        : `Evento "${savedEvent.title}" criado e publicado!`
    );

    setSelectedEventForEdit(null);
    setCurrentPage('eventos');
  };

  // Save Lots Handler
  const handleSaveBatches = (eventId: number, updatedBatches: TicketBatch[]) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const totalCapacity = updatedBatches.reduce((a, b) => a + (b.totalQuantity || b.qty || 0), 0);
          const totalSold = updatedBatches.reduce((a, b) => a + (b.soldQuantity || b.sold || 0), 0);
          const totalAvailable = updatedBatches.reduce((a, b) => a + (b.availableQuantity || 0), 0);
          const totalRevenue = updatedBatches.reduce((a, b) => a + ((b.soldQuantity || b.sold || 0) * b.price), 0);
          const occupancyRate = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

          return {
            ...ev,
            batches: updatedBatches,
            totalCapacity,
            salesCount: totalSold,
            availableCount: totalAvailable,
            totalRevenue,
            occupancyRate,
          };
        }
        return ev;
      })
    );

    triggerToast('Configuração de lotes e ingressos atualizada com sucesso!');
  };

  // Save Meta Pixel
  const handleSaveMetaPixel = (eventId: number, config: MetaPixelConfig) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, metaPixel: config } : ev))
    );
    triggerToast('Configurações de rastreamento do Pixel Meta salvas!');
  };

  const getFinanceConfig = (page: NavigationPage): { tab: FinanceTab; module: FinanceModuleKey } => {
    switch (page) {
      case 'fin-saldo':
      case 'saldo':
        return { tab: 'overview', module: 'saldo-consolidado' };
      case 'vendas':
      case 'recebimentos':
        return { tab: 'sales', module: 'saldo-consolidado' };
      case 'fin-repasses':
      case 'repasses':
        return { tab: 'payouts', module: 'solicitar-repasse' };
      case 'fluxo-caixa':
        return { tab: 'cashflow', module: 'saldo-consolidado' };
      case 'fin-extrato':
      case 'extrato':
        return { tab: 'statement', module: 'extrato-geral' };
      case 'fin-antecipacoes':
        return { tab: 'hub', module: 'antecipacoes' };
      case 'fin-despesas':
        return { tab: 'hub', module: 'despesas' };
      case 'fin-contas':
        return { tab: 'hub', module: 'contas-bancarias' };
      case 'fin-bordero':
        return { tab: 'hub', module: 'bordero-assinaturas' };
      case 'fin-negociacoes':
        return { tab: 'hub', module: 'negociacoes' };
      case 'fin-advanced':
        return { tab: 'hub', module: 'financeiro-advanced' };
      case 'fin-split':
        return { tab: 'hub', module: 'split-financeiro' };
      case 'fin-inteligencia':
        return { tab: 'hub', module: 'inteligencia-financeira' };
      case 'fin-conciliacao':
      case 'conciliacao':
        return { tab: 'hub', module: 'conciliacao-bancaria' };
      case 'fin-spread':
        return { tab: 'hub', module: 'simulador-spread' };
      case 'financeiro':
      case 'fin-hub':
      default:
        return { tab: 'hub', module: 'hub' };
    }
  };

  const isFinancePage = [
    'financeiro', 'fin-hub', 'fin-saldo', 'fin-repasses', 
    'fin-antecipacoes', 'fin-extrato', 'fin-despesas', 
    'fin-contas', 'fin-bordero', 'fin-negociacoes', 
    'fin-advanced', 'fin-split', 'fin-inteligencia', 
    'fin-conciliacao', 'fin-spread', 'saldo', 'vendas', 
    'recebimentos', 'repasses', 'conciliacao', 'fluxo-caixa', 'extrato'
  ].includes(currentPage);

  const getPOSTab = (page: NavigationPage): POSTab => {
    switch (page) {
      case 'pos-terminals': return 'terminals';
      case 'pos-sales': return 'sales';
      case 'pos-closing': return 'closing';
      case 'terminais-pos':
      default:
        return 'overview';
    }
  };

  const getMarketingTab = (page: NavigationPage): MarketingSubTab => {
    switch (page) {
      case 'mkt-campaigns':
      case 'campanhas':
        return 'mkt-campaigns';
      case 'mkt-new-campaign':
        return 'mkt-new-campaign';
      case 'mkt-coupons':
      case 'cupons':
        return 'mkt-coupons';
      case 'mkt-links':
        return 'mkt-links';
      case 'mkt-analytics':
      case 'pixel-meta':
      case 'google-analytics':
        return 'mkt-analytics';
      case 'mkt-automations':
        return 'mkt-automations';
      case 'mkt-whatsapp':
        return 'mkt-whatsapp';
      case 'mkt-email':
        return 'mkt-email';
      case 'mkt-comm-integrations':
        return 'mkt-comm-integrations';
      case 'mkt-affiliates':
        return 'mkt-affiliates';
      case 'mkt-reports':
        return 'mkt-reports';
      case 'mkt-hub':
        return 'mkt-hub';
      case 'marketing':
      case 'mkt-dashboard':
      default:
        return 'mkt-dashboard';
    }
  };

  const isMarketingPage = [
    'marketing', 'mkt-hub', 'mkt-dashboard', 'mkt-campaigns', 'mkt-new-campaign', 
    'mkt-automations', 'mkt-whatsapp', 'mkt-email', 'mkt-coupons', 
    'mkt-links', 'mkt-affiliates', 'mkt-analytics', 'mkt-comm-integrations', 'mkt-reports', 'campanhas', 
    'pixel-meta', 'google-analytics', 'cupons'
  ].includes(currentPage);

  const getRemarketingTab = (page: NavigationPage): RemarketingSubTab => {
    switch (page) {
      case 'rmk-carts':
      case 'mkt-abandoned':
        return 'rmk-carts';
      case 'rmk-audiences':
        return 'rmk-audiences';
      case 'rmk-segments':
        return 'rmk-segments';
      case 'rmk-flows':
        return 'rmk-flows';
      case 'rmk-whatsapp':
        return 'rmk-whatsapp';
      case 'rmk-email':
        return 'rmk-email';
      case 'rmk-payments':
        return 'rmk-payments';
      case 'rmk-inactive':
        return 'rmk-inactive';
      case 'rmk-postevent':
        return 'rmk-postevent';
      case 'rmk-automation':
        return 'rmk-automation';
      case 'rmk-reports':
        return 'rmk-reports';
      case 'rmk-hub':
        return 'rmk-hub';
      case 'remarketing':
      case 'rmk-dashboard':
      default:
        return 'rmk-dashboard';
    }
  };

  const isRemarketingPage = [
    'remarketing', 'rmk-hub', 'rmk-dashboard', 'rmk-carts', 'rmk-audiences', 
    'rmk-segments', 'rmk-flows', 'rmk-whatsapp', 'rmk-email', 'rmk-payments', 
    'rmk-inactive', 'rmk-postevent', 'rmk-automation', 'rmk-reports', 'mkt-abandoned'
  ].includes(currentPage);

  const isSacPage = [
    'atendimento', 'sac-hub', 'sac-dashboard', 'sac-tickets', 
    'sac-new', 'sac-sla', 'sac-integrations', 'sac-knowledge', 'sac-reports'
  ].includes(currentPage);

  const getSupportMode = (page: NavigationPage): SupportMode => {
    switch (page) {
      case 'sac-dashboard':
        return 'sac-dashboard';
      case 'sac-tickets':
        return 'sac-tickets';
      case 'sac-new':
        return 'sac-new';
      case 'sac-sla':
        return 'sac-sla';
      case 'sac-integrations':
        return 'sac-integrations';
      case 'sac-knowledge':
        return 'sac-knowledge';
      case 'sac-reports':
        return 'sac-reports';
      case 'atendimento':
      case 'sac-hub':
      default:
        return 'sac-hub';
    }
  };

  // Event Contextual Navigation (Fase 15)
  const isEventContextActive = [
    'dashboard-evento', 'evento-dashboard', 'evento-ingressos', 'evento-cortesias', 
    'evento-relatorios', 'evento-detalhes', 'evento-pixel', 'evento-utm', 
    'evento-analytics', 'evento-trafego', 'evento-meta-ads', 'evento-remarketing', 
    'evento-lotes', 'evento-checkin', 'evento-usuarios', 'evento-logs'
  ].includes(currentPage);

  const currentEventContext = isEventContextActive
    ? activeEventForDashboard || selectedEventForEdit || selectedEventForLots || selectedEventForParticipants || scopedEvents[0]
    : null;

  // URL Synchronization for Contextual Navigation (Fase 15)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentEventContext) {
      const code = currentEventContext.code || currentEventContext.id;
      const subpathMap: Record<string, string> = {
        'evento-dashboard': 'dashboard',
        'dashboard-evento': 'dashboard',
        'evento-ingressos': 'tickets',
        'evento-cortesias': 'courtesy',
        'evento-relatorios': 'reports',
        'evento-detalhes': 'detalhes',
        'evento-pixel': 'pixel',
        'evento-utm': 'utm',
        'evento-analytics': 'ga4',
        'evento-trafego': 'traffic',
        'evento-meta-ads': 'meta-ads',
        'evento-remarketing': 'remarketing',
        'evento-lotes': 'lots',
        'evento-checkin': 'checkin',
        'evento-usuarios': 'users',
        'evento-logs': 'logs',
      };
      const sub = subpathMap[currentPage] || 'dashboard';
      const targetUrl = `/eventos/${code}/${sub}`;
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState({ page: currentPage, eventCode: code }, '', targetUrl);
      }
    } else {
      const pageMap: Record<string, string> = {
        'eventos': '/eventos',
        'dashboard': '/dashboard',
        'produtora': '/produtora',
        'financeiro': '/financeiro',
        'terminais-pos': '/pos',
        'marketing': '/marketing',
        'remarketing': '/remarketing',
        'atendimento': '/atendimento',
        'administracao': '/administracao',
      };
      const targetUrl = pageMap[currentPage] || `/${currentPage}`;
      if (window.location.pathname !== targetUrl) {
        window.history.replaceState({ page: currentPage }, '', targetUrl);
      }
    }
  }, [currentPage, currentEventContext]);

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#0E1726] flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-btn border border-[#10B981]/40 bg-[#1E2530] px-5 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981] text-white">
            <Check size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Global com Multi-Tenant Selector */}
      <Header
        query={globalSearchQuery}
        onQueryChange={(q) => {
          setGlobalSearchQuery(q);
          if (currentPage !== 'eventos') setCurrentPage('eventos');
        }}
        selectedProducer={activeProducer}
        producers={allProducers}
        onSelectProducer={(prod) => selectProducer(prod ? prod.id : null)}
        onOpenNewEvent={handleNavigateToNewEvent}
        onOpenAdvancedFilters={() => {
          if (currentPage !== 'eventos') setCurrentPage('eventos');
        }}
      />

      {/* 2. Main Layout Container (Sidebar Contextual + Área Principal) */}
      <div className="flex flex-1 min-w-0">
        {/* Sidebar Contextual */}
        <Sidebar
          currentPage={currentPage}
          selectedEvent={currentEventContext}
          onExitEventContext={() => {
            setActiveEventForDashboard(null);
            setCurrentPage('eventos');
          }}
          onNavigate={(page) => {
            if (page === 'novo-evento') {
              handleNavigateToNewEvent();
            } else {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onOpenNewEvent={handleNavigateToNewEvent}
          onBackToHome={() => {
            setActiveEventForDashboard(null);
            setCurrentPage('eventos');
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Área Principal (Barra de Título + Conteúdo + Footer) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Admin Master Impersonation Scope Banner */}
          {currentUser && (currentUser.role === 'admin-master' || currentUser.role === 'admin') && activeProducer && (
            <div className="bg-[#1E293B] border-b border-[#334155] px-4 sm:px-6 py-2 text-xs text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Você está visualizando: <strong className="text-[#7DD3FC]">{activeProducer.name}</strong></span>
              </div>
              <button
                onClick={() => selectProducer(null)}
                className="px-2.5 py-1 rounded bg-[#334155] hover:bg-[#475569] text-white font-bold text-[11px] transition cursor-pointer"
              >
                ← Voltar para visão global
              </button>
            </div>
          )}

          {/* Barra de Título Independente */}
          <ModuleTitleBar currentPage={currentPage} />

          {/* Viewport de Conteúdo */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1720px] w-full mx-auto">
            {/* 1. Flagship Events List (Multi-Tenant Scoped) */}
            {currentPage === 'eventos' && (
              <EventosPage
                events={scopedEvents}
                setEvents={setEvents}
                selectedProducer={activeProducer || allProducers[0]}
                producers={allProducers}
                searchQuery={globalSearchQuery}
                onNavigateToNewEvent={handleNavigateToNewEvent}
                onNavigateToEditEvent={handleNavigateToEditEvent}
                onNavigateToLots={handleNavigateToLots}
                onNavigateToParticipants={handleNavigateToParticipants}
                onNavigateToEventDashboard={handleNavigateToEventDashboard}
              />
            )}

            {/* 2. Núcleo Operacional Integrado com API (Fase 10) */}
            {currentPage === 'nucleo-operacional' && (
              <OperationsPage
                producerId={activeProducer ? (activeProducer.id === 'prod-1' ? 1 : activeProducer.id === 'prod-2' ? 2 : 1) : null}
                producerName={activeProducer?.name || 'Todas as Produtoras (Visão Global)'}
                notify={triggerToast}
              />
            )}

            {/* 3. Marketing Module (Fase 11-13) */}
            {isMarketingPage && (
              <MarketingHub
                key={currentPage}
                events={scopedEvents}
                producerId={activeProducer ? (activeProducer.id === 'prod-1' ? 1 : activeProducer.id === 'prod-2' ? 2 : 1) : null}
                initialTab={getMarketingTab(currentPage)}
                notify={triggerToast}
              />
            )}

            {/* 4. Remarketing Module (Fase 11-13) */}
            {isRemarketingPage && (
              <RemarketingHub
                key={currentPage}
                events={scopedEvents}
                producerId={activeProducer ? (activeProducer.id === 'prod-1' ? 1 : activeProducer.id === 'prod-2' ? 2 : 1) : null}
                producerName={activeProducer?.name || 'DiskIngressos Produções'}
                initialTab={getRemarketingTab(currentPage)}
                notify={triggerToast}
              />
            )}

            {/* 4.5. Atendimento / SAC Module (Fase 14 ITIL & Service Desk) */}
            {isSacPage && (
              <SupportPage
                key={currentPage}
                mode={getSupportMode(currentPage)}
                producerId={activeProducer ? (activeProducer.id === 'prod-1' ? 1 : activeProducer.id === 'prod-2' ? 2 : 1) : null}
                producerName={activeProducer?.name || 'DiskIngressos Produções'}
                events={scopedEvents}
                notify={triggerToast}
                onNavigate={(mode) => setCurrentPage(mode)}
              />
            )}

            {/* 5. Event Contextual Subpages (Fase 15) */}
            {(currentPage === 'dashboard-evento' || currentPage === 'evento-dashboard') && (
              <EventDashboardPage
                event={currentEventContext || activeEventForDashboard || scopedEvents[0]}
                participants={participants}
                onBack={() => {
                  setActiveEventForDashboard(null);
                  setCurrentPage('eventos');
                }}
                onNavigateToParticipants={() => {
                  setSelectedEventForParticipants(currentEventContext);
                  setCurrentPage('evento-ingressos');
                }}
                onNavigateToLots={() => {
                  setSelectedEventForLots(currentEventContext);
                  setCurrentPage('evento-lotes');
                }}
                onNavigateToEdit={() => {
                  setSelectedEventForEdit(currentEventContext);
                  setCurrentPage('evento-detalhes');
                }}
                onNavigateToSubpage={(sub) => setCurrentPage(sub as any)}
              />
            )}

            {/* Ingressos do Evento */}
            {currentPage === 'evento-ingressos' && (
              <ParticipantsPage
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                participants={participants}
                selectedEvent={currentEventContext}
                onSelectEvent={() => {}}
                onToggleCheckin={handleToggleCheckin}
              />
            )}

            {/* Cortesias do Evento */}
            {currentPage === 'evento-cortesias' && (
              <CortesiasPage
                event={currentEventContext || scopedEvents[0]}
                onBack={() => setCurrentPage('evento-dashboard')}
                notify={triggerToast}
              />
            )}

            {/* Relatórios de Vendas do Evento */}
            {currentPage === 'evento-relatorios' && (
              <FinanceiroPage
                key={`relatorios-${currentEventContext?.id}`}
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                initialTab="statement"
                initialSubModule="extrato-geral"
                notify={triggerToast}
              />
            )}

            {/* Detalhes do Evento */}
            {currentPage === 'evento-detalhes' && (
              <EventFormPage
                mode="edit"
                event={currentEventContext || selectedEventForEdit || scopedEvents[0]}
                selectedProducer={activeProducer || allProducers[0]}
                producers={allProducers}
                onCancel={() => setCurrentPage('evento-dashboard')}
                onSave={handleSaveEvent}
              />
            )}

            {/* Pixel GA & Meta do Evento */}
            {currentPage === 'evento-pixel' && (
              <PixelInheritancePage
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                producerId={activeProducer?.id ? Number(activeProducer.id) : null}
                producerName={activeProducer?.name}
                notify={triggerToast}
              />
            )}

            {/* Links UTM do Evento - Central UTM & Conversões */}
            {currentPage === 'evento-utm' && (
              <UtmLinksPage event={currentEventContext || scopedEvents[0]} notify={triggerToast} />
            )}

            {/* Analytics GA4 e Tráfego do Evento */}
            {(currentPage === 'evento-analytics' || currentPage === 'evento-trafego') && (
              <MarketingDashboardPage
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                selectedEventId={currentEventContext?.id || null}
                onSelectEventId={() => {}}
                onOpenCreateCampaign={() => setCurrentPage('evento-meta-ads')}
                onNavigateToTab={(tab) => {
                  if (tab === 'mkt-campaigns') setCurrentPage('evento-meta-ads');
                  else if (tab === 'mkt-links') setCurrentPage('evento-utm');
                  else if (tab === 'mkt-analytics') setCurrentPage('evento-pixel');
                }}
                notify={triggerToast}
              />
            )}

            {/* Campanhas Meta Ads do Evento */}
            {currentPage === 'evento-meta-ads' && (
              <MarketingCampaignsPage
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                notify={triggerToast}
              />
            )}

            {/* Remarketing do Evento */}
            {currentPage === 'evento-remarketing' && (
              <RecoveryCenterPage
                producerId={activeProducer ? (activeProducer.id === 'prod-1' ? 1 : activeProducer.id === 'prod-2' ? 2 : 1) : null}
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                mode="all"
                notify={triggerToast}
              />
            )}

            {/* Lotes do Evento */}
            {currentPage === 'evento-lotes' && (
              <LotsPage
                events={currentEventContext ? [currentEventContext] : scopedEvents}
                selectedEvent={currentEventContext}
                onSelectEvent={() => {}}
                onBack={() => setCurrentPage('evento-dashboard')}
                onSaveBatches={handleSaveBatches}
              />
            )}

            {/* Check-in ao Vivo do Evento */}
            {currentPage === 'evento-checkin' && (
              <OperationsPage
                producerId={activeProducer ? (activeProducer.id === 'prod-1' ? 1 : activeProducer.id === 'prod-2' ? 2 : 1) : null}
                producerName={activeProducer?.name || 'DiskIngressos Produções'}
                notify={triggerToast}
              />
            )}

            {/* Usuários do Evento */}
            {currentPage === 'evento-usuarios' && (
              <UserManagerPage />
            )}

            {/* Logs do Evento */}
            {currentPage === 'evento-logs' && (
              <AuditLogsPage />
            )}

            {/* 6. Create Event Dedicated Page */}
            {currentPage === 'novo-evento' && (
              <EventFormPage
                mode="new"
                selectedProducer={activeProducer || allProducers[0]}
                producers={allProducers}
                onCancel={() => setCurrentPage('eventos')}
                onSave={handleSaveEvent}
              />
            )}

            {/* 7. Edit Event Dedicated Page */}
            {currentPage === 'editar-evento' && (
              <EventFormPage
                mode="edit"
                event={selectedEventForEdit}
                selectedProducer={activeProducer || allProducers[0]}
                producers={allProducers}
                onCancel={() => setCurrentPage('eventos')}
                onSave={handleSaveEvent}
              />
            )}

            {/* 8. Configure Lots Dedicated Page */}
            {currentPage === 'lotes' && (
              <LotsPage
                events={scopedEvents}
                selectedEvent={selectedEventForLots}
                onSelectEvent={(ev) => setSelectedEventForLots(ev)}
                onBack={() => setCurrentPage('eventos')}
                onSaveBatches={handleSaveBatches}
              />
            )}

            {/* 9. Participants Dedicated Page */}
            {currentPage === 'participantes' && (
              <ParticipantsPage
                events={scopedEvents}
                participants={participants}
                selectedEvent={selectedEventForParticipants}
                onSelectEvent={(ev) => setSelectedEventForParticipants(ev)}
                onToggleCheckin={handleToggleCheckin}
              />
            )}

            {/* 10. Executive General Dashboard */}
            {currentPage === 'dashboard' && (
              <DashboardPage
                events={scopedEvents}
                selectedProducer={activeProducer}
                allProducers={allProducers}
                onSelectProducer={(prodId) => {
                  selectProducer(prodId);
                  setCurrentPage('eventos');
                }}
                onNavigateToEvents={() => setCurrentPage('eventos')}
                onOpenNewEvent={handleNavigateToNewEvent}
              />
            )}

            {/* 11. Producer Page */}
            {currentPage === 'produtora' && (
              <ProdutoraPage selectedProducer={activeProducer || allProducers[0]} />
            )}

            {/* 12. Status Faciais Page */}
            {currentPage === 'status-faciais' && (
              <StatusFaciaisPage
                events={scopedEvents}
                participants={participants}
              />
            )}

            {/* 13. Official Hub Financeiro & Modules */}
            {isFinancePage && (
              <FinanceiroPage
                key={currentPage}
                events={scopedEvents}
                initialTab={getFinanceConfig(currentPage).tab}
                initialSubModule={getFinanceConfig(currentPage).module}
                notify={triggerToast}
              />
            )}

            {/* 14. POS / PDV Module */}
            {(currentPage === 'terminais-pos' || currentPage === 'pos-terminals' || currentPage === 'pos-sales' || currentPage === 'pos-closing') && (
              <POSPage
                key={currentPage}
                events={scopedEvents}
                initialTab={getPOSTab(currentPage)}
                notify={triggerToast}
              />
            )}

            {/* 15. Administração — Central Administrativa (Fase 8) */}
            {(currentPage === 'administracao' || currentPage === 'admin-hub') && (
              <AdminHubPage onNavigate={(p) => setCurrentPage(p)} />
            )}

            {/* 16. Administração — Usuários e Acessos (Fase 8) */}
            {(currentPage === 'gerenciar-usuarios' || currentPage === 'admin-users' || currentPage === 'gerenciar-acessos') && (
              <UserManagerPage />
            )}

            {/* 17. Administração — Produtoras Cadastradas (Fase 8) */}
            {currentPage === 'admin-producers' && (
              <ProducersPage notify={triggerToast} />
            )}

            {/* 18. Administração — Perfis e Permissões RBAC (Fase 8) */}
            {currentPage === 'admin-permissions' && (
              <PermissionsPage notify={triggerToast} />
            )}

            {/* 19. Administração — Logs de Auditoria (Fase 8) */}
            {(currentPage === 'logs-auditoria' || currentPage === 'admin-audit') && (
              <AuditLogsPage />
            )}

            {/* 20. Administração — Configurações de Segurança (Fase 8) */}
            {currentPage === 'admin-security' && (
              <SecurityPage notify={triggerToast} />
            )}

            {/* 21. Generic Module Pages */}
            {(currentPage === 'clube-beneficios' || currentPage === 'cortesias' || currentPage === 'categorias-setores' || currentPage === 'mensagens') && (
              <GenericModulePage
                page={currentPage}
                onNavigateToEvents={() => setCurrentPage('eventos')}
              />
            )}
          </main>

          {/* Footer Global Oficial */}
          <AppFooter />
        </div>
      </div>

      {/* Floating Scroll to Top */}
      <ScrollTop />

      {/* Meta Pixel Modal */}
      <MetaPixelModal
        event={marketingModalEvent}
        isOpen={!!marketingModalEvent}
        onClose={() => setMarketingModalEvent(null)}
        onSave={handleSaveMetaPixel}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
