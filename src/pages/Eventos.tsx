import React, { useState, useMemo } from 'react';
import type { EventItem, EventFilterState, MetaPixelConfig } from '../types/event';
import type { Producer } from '../types/producer';
import { EventSummaryKPIs } from '../components/events/EventSummaryKPIs';
import { EventFilters } from '../components/events/EventFilters';
import { EventCardHorizontal } from '../components/events/EventCardHorizontal';
import { EventCardGrid } from '../components/events/EventCardGrid';
import { EventTableView } from '../components/events/EventTableView';
import { CompareEventsModal } from '../components/events/CompareEventsModal';
import { MetaPixelModal } from '../components/events/MetaPixelModal';
import { EventDetailDrawer } from '../components/events/EventDetailDrawer';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Search, Plus } from 'lucide-react';

interface EventosPageProps {
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  selectedProducer: Producer;
  producers: Producer[];
  searchQuery: string;
  onNavigateToNewEvent: () => void;
  onNavigateToEditEvent: (event: EventItem) => void;
  onNavigateToLots: (event: EventItem) => void;
  onNavigateToParticipants: (event: EventItem) => void;
  onNavigateToEventDashboard: (event: EventItem) => void;
}

export const EventosPage: React.FC<EventosPageProps> = ({
  events,
  setEvents,
  searchQuery,
  onNavigateToNewEvent,
  onNavigateToEditEvent,
  onNavigateToLots,
  onNavigateToParticipants,
  onNavigateToEventDashboard,
}) => {
  // Filter States
  const [filters, setFilters] = useState<EventFilterState>({
    searchQuery: '',
    statusFilter: 'todos',
    cityFilter: '',
    categoryFilter: '',
    producerFilter: '',
    periodFilter: 'todos',
    sortBy: 'dateAsc',
    viewMode: 'horizontal',
  });

  // Selected Events for Comparison
  const [selectedCompareIds, setSelectedCompareIds] = useState<number[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Selected Event for Meta Pixel Modal & Drawer
  const [activeEventForPixel, setActiveEventForPixel] = useState<EventItem | null>(null);
  const [activeEventForDrawer, setActiveEventForDrawer] = useState<EventItem | null>(null);

  // Update specific filter property
  const handleFilterChange = (key: keyof EventFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      statusFilter: 'todos',
      cityFilter: '',
      categoryFilter: '',
      producerFilter: '',
      periodFilter: 'todos',
      sortBy: 'dateAsc',
      viewMode: filters.viewMode,
    });
  };

  // Toggle selection for comparison
  const handleToggleCompare = (id: number) => {
    setSelectedCompareIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllForTable = (select: boolean) => {
    if (select) {
      setSelectedCompareIds(filteredEvents.map((e) => e.id));
    } else {
      setSelectedCompareIds([]);
    }
  };

  // Save Meta Pixel update
  const handleSaveMetaPixel = (eventId: number, config: MetaPixelConfig) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, metaPixel: config } : ev))
    );
  };

  // Filtered and Sorted Events
  const filteredEvents = useMemo(() => {
    const combinedQuery = (searchQuery || filters.searchQuery).toLowerCase().trim();

    return events
      .filter((ev) => {
        // Global search query
        if (combinedQuery) {
          const matchTitle = ev.title.toLowerCase().includes(combinedQuery);
          const matchVenue = ev.venue.toLowerCase().includes(combinedQuery);
          const matchCode = ev.code.toLowerCase().includes(combinedQuery);
          const matchCity = (ev.city || '').toLowerCase().includes(combinedQuery);
          const matchProd = (ev.producerName || ev.producer || '').toLowerCase().includes(combinedQuery);
          if (!matchTitle && !matchVenue && !matchCode && !matchCity && !matchProd) {
            return false;
          }
        }

        // Status Filter
        if (filters.statusFilter === 'ativos' && ev.status !== 'ativo') return false;
        if (filters.statusFilter === 'inativos' && ev.status !== 'encerrado' && ev.status !== 'inativo') return false;
        if (filters.statusFilter === 'rascunhos' && ev.status !== 'rascunho') return false;

        // Category Filter
        if (filters.categoryFilter && ev.category !== filters.categoryFilter) return false;

        // City Filter
        if (filters.cityFilter && ev.city !== filters.cityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'revenueDesc') return b.totalRevenue - a.totalRevenue;
        if (filters.sortBy === 'salesDesc') return b.salesCount - a.salesCount;
        if (filters.sortBy === 'occupancyDesc') return b.occupancyRate - a.occupancyRate;
        if (filters.sortBy === 'nameAsc') return a.title.localeCompare(b.title);
        return 0; // default order
      });
  }, [events, searchQuery, filters]);

  // Total counts for tabs
  const totalCounts = useMemo(() => ({
    todos: events.length,
    ativos: events.filter((e) => e.status === 'ativo').length,
    inativos: events.filter((e) => e.status === 'encerrado' || e.status === 'inativo').length,
    rascunhos: events.filter((e) => e.status === 'rascunho').length,
  }), [events]);

  const selectedEventsForCompare = useMemo(() => {
    return events.filter((e) => selectedCompareIds.includes(e.id));
  }, [events, selectedCompareIds]);

  return (
    <div className="w-full">
      {/* Official Page Header */}
      <PageHeader
        eyebrow="GESTÃO DE EVENTOS"
        title="Eventos"
        subtitle="Gerencie eventos, vendas, ocupação e operações em tempo real."
        actions={
          <Button
            variant="primary"
            onClick={onNavigateToNewEvent}
            icon={<Plus size={16} />}
          >
            Novo Evento
          </Button>
        }
      />

      {/* Summary KPIs Strip */}
      <EventSummaryKPIs events={filteredEvents} />

      {/* Filters Toolbar */}
      <EventFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        selectedCompareCount={selectedCompareIds.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenNewEvent={onNavigateToNewEvent}
        totalCounts={totalCounts}
      />

      {/* Events View Render (Horizontal, Grid, Table) */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="Nenhum evento encontrado"
          description="Não encontramos nenhum evento correspondente aos filtros aplicados. Tente limpar os filtros ou realizar outra busca."
          action={
            <Button variant="secondary" onClick={handleResetFilters}>
              Limpar Todos os Filtros
            </Button>
          }
        />
      ) : filters.viewMode === 'horizontal' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredEvents.map((event) => (
            <EventCardHorizontal
              key={event.id}
              event={event}
              isSelectedForCompare={selectedCompareIds.includes(event.id)}
              onToggleCompare={handleToggleCompare}
              onEventDashboard={onNavigateToEventDashboard}
              onEdit={onNavigateToEditEvent}
              onManageLots={onNavigateToLots}
              onMetaPixel={(ev) => setActiveEventForPixel(ev)}
              onReports={(ev) => setActiveEventForDrawer(ev)}
              onParticipants={onNavigateToParticipants}
              onCheckin={onNavigateToParticipants}
              onQuickView={onNavigateToEventDashboard}
            />
          ))}
        </div>
      ) : filters.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCardGrid
              key={event.id}
              event={event}
              isSelectedForCompare={selectedCompareIds.includes(event.id)}
              onToggleCompare={handleToggleCompare}
              onEventDashboard={onNavigateToEventDashboard}
              onEdit={onNavigateToEditEvent}
              onManageLots={onNavigateToLots}
              onMetaPixel={(ev) => setActiveEventForPixel(ev)}
              onReports={(ev) => setActiveEventForDrawer(ev)}
              onParticipants={onNavigateToParticipants}
              onQuickView={onNavigateToEventDashboard}
            />
          ))}
        </div>
      ) : (
        <EventTableView
          events={filteredEvents}
          selectedIds={selectedCompareIds}
          onToggleSelect={handleToggleCompare}
          onSelectAll={handleSelectAllForTable}
          onEventDashboard={onNavigateToEventDashboard}
          onEdit={onNavigateToEditEvent}
          onManageLots={onNavigateToLots}
          onMetaPixel={(ev) => setActiveEventForPixel(ev)}
          onReports={(ev) => setActiveEventForDrawer(ev)}
          onParticipants={onNavigateToParticipants}
          onQuickView={onNavigateToEventDashboard}
        />
      )}

      {/* Comparison Modal */}
      <CompareEventsModal
        events={selectedEventsForCompare}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveFromCompare={(id) => setSelectedCompareIds((prev) => prev.filter((i) => i !== id))}
      />

      {/* Meta Pixel Modal */}
      <MetaPixelModal
        event={activeEventForPixel}
        isOpen={!!activeEventForPixel}
        onClose={() => setActiveEventForPixel(null)}
        onSave={handleSaveMetaPixel}
      />

      {/* Event Details Slide-over Drawer */}
      <EventDetailDrawer
        event={activeEventForDrawer}
        isOpen={!!activeEventForDrawer}
        onClose={() => setActiveEventForDrawer(null)}
        onEdit={(ev) => {
          setActiveEventForDrawer(null);
          onNavigateToEditEvent(ev);
        }}
        onManageLots={(ev) => {
          setActiveEventForDrawer(null);
          onNavigateToLots(ev);
        }}
        onMetaPixel={(ev) => {
          setActiveEventForDrawer(null);
          setActiveEventForPixel(ev);
        }}
      />
    </div>
  );
};
