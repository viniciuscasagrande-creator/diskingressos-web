import React, { useState, useMemo } from 'react';
import type { EventItem, MetaPixelConfig, TicketBatch } from './types/event';
import type { Producer, NavigationPage } from './types/producer';
import type { FinanceModuleKey } from './types/financeHub';
import type { Participant } from './data/participants';
import { mockEvents } from './data/events';
import { mockProducers } from './data/producers';
import { mockParticipants } from './data/participants';

// Auth & Security Provider (Fase 7)
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { UserManagerPage } from './pages/admin/UserManagerPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

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
import { MarketingPage } from './pages/Marketing';
import { GenericModulePage } from './pages/GenericModulePage';
import { MetaPixelModal } from './components/events/MetaPixelModal';
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
  const [currentPage, setCurrentPage] = useState<NavigationPage>('fin-hub');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Subpage Contexts
  const [activeEventForDashboard, setActiveEventForDashboard] = useState<EventItem>(mockEvents[0]);
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
    setCurrentPage('dashboard-evento');
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

  return (
    <div className="min-h-screen bg-[#F1F4F8] text-[#0E1726] flex flex-col font-sans selection:bg-[#1677FF] selection:text-white relative">
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
          onNavigate={(page) => {
            if (page === 'novo-evento') {
              handleNavigateToNewEvent();
            } else {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onOpenNewEvent={handleNavigateToNewEvent}
          onBackToHome={() => setCurrentPage('eventos')}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Área Principal (Barra de Título + Conteúdo + Footer) */}
        <div className="flex-1 flex flex-col min-w-0">
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

            {/* 2. Individual Event Dashboard Page */}
            {currentPage === 'dashboard-evento' && (
              <EventDashboardPage
                event={activeEventForDashboard}
                participants={participants}
                onBack={() => setCurrentPage('eventos')}
                onNavigateToParticipants={() => {
                  setSelectedEventForParticipants(activeEventForDashboard);
                  setCurrentPage('participantes');
                }}
                onNavigateToLots={() => {
                  setSelectedEventForLots(activeEventForDashboard);
                  setCurrentPage('lotes');
                }}
                onNavigateToEdit={() => {
                  setSelectedEventForEdit(activeEventForDashboard);
                  setCurrentPage('editar-evento');
                }}
              />
            )}

            {/* 3. Create Event Dedicated Page */}
            {currentPage === 'novo-evento' && (
              <EventFormPage
                mode="new"
                selectedProducer={activeProducer || allProducers[0]}
                producers={allProducers}
                onCancel={() => setCurrentPage('eventos')}
                onSave={handleSaveEvent}
              />
            )}

            {/* 4. Edit Event Dedicated Page */}
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

            {/* 5. Configure Lots Dedicated Page */}
            {currentPage === 'lotes' && (
              <LotsPage
                events={scopedEvents}
                selectedEvent={selectedEventForLots}
                onSelectEvent={(ev) => setSelectedEventForLots(ev)}
                onBack={() => setCurrentPage('eventos')}
                onSaveBatches={handleSaveBatches}
              />
            )}

            {/* 6. Participants Dedicated Page */}
            {currentPage === 'participantes' && (
              <ParticipantsPage
                events={scopedEvents}
                participants={participants}
                selectedEvent={selectedEventForParticipants}
                onSelectEvent={(ev) => setSelectedEventForParticipants(ev)}
                onToggleCheckin={handleToggleCheckin}
              />
            )}

            {/* 7. Executive General Dashboard */}
            {currentPage === 'dashboard' && (
              <DashboardPage
                events={scopedEvents}
                selectedProducer={activeProducer || allProducers[0]}
                onNavigateToEvents={() => setCurrentPage('eventos')}
                onOpenNewEvent={handleNavigateToNewEvent}
              />
            )}

            {/* 8. Producer Page */}
            {currentPage === 'produtora' && (
              <ProdutoraPage selectedProducer={activeProducer || allProducers[0]} />
            )}

            {/* 9. Status Faciais Page */}
            {currentPage === 'status-faciais' && (
              <StatusFaciaisPage
                events={scopedEvents}
                participants={participants}
              />
            )}

            {/* 10. Official Hub Financeiro & Modules */}
            {isFinancePage && (
              <FinanceiroPage
                key={currentPage}
                events={scopedEvents}
                initialTab={getFinanceConfig(currentPage).tab}
                initialSubModule={getFinanceConfig(currentPage).module}
                notify={triggerToast}
              />
            )}

            {/* 11. POS / PDV Module */}
            {(currentPage === 'terminais-pos' || currentPage === 'pos-terminals' || currentPage === 'pos-sales' || currentPage === 'pos-closing') && (
              <POSPage
                key={currentPage}
                events={scopedEvents}
                initialTab={getPOSTab(currentPage)}
                notify={triggerToast}
              />
            )}

            {/* 12. User Management (Fase 7) */}
            {(currentPage === 'gerenciar-usuarios' || currentPage === 'gerenciar-acessos') && (
              <UserManagerPage />
            )}

            {/* 13. Audit Logs (Fase 7) */}
            {currentPage === 'logs-auditoria' && (
              <AuditLogsPage />
            )}

            {/* 14. Marketing Pages */}
            {(currentPage === 'marketing' || currentPage === 'campanhas' || currentPage === 'pixel-meta' || currentPage === 'google-analytics') && (
              <MarketingPage
                events={scopedEvents}
                onOpenMetaModal={(ev) => setMarketingModalEvent(ev)}
              />
            )}

            {/* 15. Generic Module Pages */}
            {(currentPage === 'atendimento' || currentPage === 'remarketing' || currentPage === 'administracao' || currentPage === 'clube-beneficios' || currentPage === 'cupons' || currentPage === 'cortesias' || currentPage === 'categorias-setores' || currentPage === 'mensagens') && (
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
