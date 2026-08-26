import React, { useState } from 'react';
import type { EventItem, MetaPixelConfig, TicketBatch } from './types/event';
import type { Producer, NavigationPage } from './types/producer';
import type { Participant } from './data/participants';
import { mockEvents } from './data/events';
import { mockProducers } from './data/producers';
import { mockParticipants } from './data/participants';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { EventosPage } from './pages/Eventos';
import { EventFormPage } from './pages/EventFormPage';
import { LotsPage } from './pages/LotsPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { EventDashboardPage } from './pages/EventDashboardPage';
import { DashboardPage } from './pages/Dashboard';
import { ProdutoraPage } from './pages/Produtora';
import { StatusFaciaisPage } from './pages/StatusFaciais';
import { FinanceiroPage, type FinanceTab } from './pages/Financeiro';
import { MarketingPage } from './pages/Marketing';
import { GenericModulePage } from './pages/GenericModulePage';
import { MetaPixelModal } from './components/events/MetaPixelModal';
import { Check } from 'lucide-react';

export default function App() {
  // Global Data State
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [producers] = useState<Producer[]>(mockProducers);
  const [selectedProducer, setSelectedProducer] = useState<Producer>(mockProducers[0]);
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  
  // Navigation & Search State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('eventos');
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

  const getFinanceTab = (page: NavigationPage): FinanceTab => {
    switch (page) {
      case 'vendas': return 'sales';
      case 'repasses': return 'payouts';
      case 'fluxo-caixa': return 'cashflow';
      case 'extrato': return 'statement';
      case 'financeiro':
      case 'saldo':
      case 'recebimentos':
      case 'conciliacao':
      default:
        return 'overview';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0E1726] flex flex-col font-sans selection:bg-[#1677FF] selection:text-white relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-btn border border-[#10B981]/40 bg-[#1E2530] px-5 py-3 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981] text-white">
            <Check size={16} />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        query={globalSearchQuery}
        onQueryChange={(q) => {
          setGlobalSearchQuery(q);
          if (currentPage !== 'eventos') setCurrentPage('eventos');
        }}
        selectedProducer={selectedProducer}
        producers={producers}
        onSelectProducer={(prod) => setSelectedProducer(prod)}
        onOpenNewEvent={handleNavigateToNewEvent}
        onOpenAdvancedFilters={() => {
          if (currentPage !== 'eventos') setCurrentPage('eventos');
        }}
      />

      {/* Main Layout Container (Sidebar + Content) */}
      <div className="flex flex-1 min-w-0">
        {/* Collapsible Main Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            if (page === 'novo-evento') {
              handleNavigateToNewEvent();
            } else {
              setCurrentPage(page);
            }
          }}
          onOpenNewEvent={handleNavigateToNewEvent}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1720px] mx-auto w-full">
          {/* 1. Flagship Events List */}
          {currentPage === 'eventos' && (
            <EventosPage
              events={events}
              setEvents={setEvents}
              selectedProducer={selectedProducer}
              producers={producers}
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
              selectedProducer={selectedProducer}
              producers={producers}
              onCancel={() => setCurrentPage('eventos')}
              onSave={handleSaveEvent}
            />
          )}

          {/* 4. Edit Event Dedicated Page */}
          {currentPage === 'editar-evento' && (
            <EventFormPage
              mode="edit"
              event={selectedEventForEdit}
              selectedProducer={selectedProducer}
              producers={producers}
              onCancel={() => setCurrentPage('eventos')}
              onSave={handleSaveEvent}
            />
          )}

          {/* 5. Configure Lots Dedicated Page */}
          {currentPage === 'lotes' && (
            <LotsPage
              events={events}
              selectedEvent={selectedEventForLots}
              onSelectEvent={(ev) => setSelectedEventForLots(ev)}
              onBack={() => setCurrentPage('eventos')}
              onSaveBatches={handleSaveBatches}
            />
          )}

          {/* 6. Participants Dedicated Page */}
          {currentPage === 'participantes' && (
            <ParticipantsPage
              events={events}
              participants={participants}
              selectedEvent={selectedEventForParticipants}
              onSelectEvent={(ev) => setSelectedEventForParticipants(ev)}
              onToggleCheckin={handleToggleCheckin}
            />
          )}

          {/* 7. Executive General Dashboard */}
          {currentPage === 'dashboard' && (
            <DashboardPage
              events={events}
              selectedProducer={selectedProducer}
              onNavigateToEvents={() => setCurrentPage('eventos')}
              onOpenNewEvent={handleNavigateToNewEvent}
            />
          )}

          {/* 8. Producer Page */}
          {currentPage === 'produtora' && (
            <ProdutoraPage selectedProducer={selectedProducer} />
          )}

          {/* 9. Status Faciais Page */}
          {currentPage === 'status-faciais' && (
            <StatusFaciaisPage
              events={events}
              participants={participants}
            />
          )}

          {/* 10. Financial Module (Fase 4) */}
          {(currentPage === 'financeiro' || currentPage === 'saldo' || currentPage === 'vendas' || currentPage === 'recebimentos' || currentPage === 'repasses' || currentPage === 'extrato' || currentPage === 'conciliacao' || currentPage === 'fluxo-caixa') && (
            <FinanceiroPage
              key={currentPage}
              events={events}
              initialTab={getFinanceTab(currentPage)}
              notify={triggerToast}
            />
          )}

          {/* 11. Marketing Pages */}
          {(currentPage === 'marketing' || currentPage === 'campanhas' || currentPage === 'pixel-meta' || currentPage === 'google-analytics') && (
            <MarketingPage
              events={events}
              onOpenMetaModal={(ev) => setMarketingModalEvent(ev)}
            />
          )}

          {/* 12. Generic Module Pages */}
          {(currentPage === 'terminais-pos' || currentPage === 'atendimento' || currentPage === 'remarketing' || currentPage === 'gerenciar-acessos' || currentPage === 'administracao' || currentPage === 'clube-beneficios' || currentPage === 'cupons' || currentPage === 'cortesias' || currentPage === 'categorias-setores' || currentPage === 'mensagens') && (
            <GenericModulePage
              page={currentPage}
              onNavigateToEvents={() => setCurrentPage('eventos')}
            />
          )}
        </main>
      </div>

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
