import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, Ticket, Shield, 
  Sparkles, Check, Image as ImageIcon, Eye, Info, CheckCircle2
} from 'lucide-react';
import type { EventItem, TicketBatch } from '../types/event';
import type { Producer } from '../types/producer';
import { EventCoverVisual } from '../components/events/EventCoverVisual';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

interface EventFormPageProps {
  mode: 'new' | 'edit';
  event?: EventItem | null;
  selectedProducer: Producer;
  producers: Producer[];
  onCancel: () => void;
  onSave: (event: EventItem) => void;
}

export const EventFormPage: React.FC<EventFormPageProps> = ({
  mode,
  event,
  selectedProducer,
  producers,
  onCancel,
  onSave,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState(event?.category || 'Show & Concerto');
  const [producerId, setProducerId] = useState(event?.producer || selectedProducer.id);
  const [venue, setVenue] = useState(event?.venue || '');
  const [address, setAddress] = useState(event?.address || '');
  const [city, setCity] = useState(event?.city || 'Curitiba');
  const [state, setState] = useState(event?.state || 'PR');
  const [date, setDate] = useState(event?.date || '30/10/2026 20:00');
  const [endDate, setEndDate] = useState(event?.endDate || '');
  const [badgeText, setBadgeText] = useState(event?.badge || '');
  const [coverType, setCoverType] = useState<string>(event?.coverType || event?.cover || 'nature');
  const [description, setDescription] = useState(event?.description || '');
  const [status, setStatus] = useState<any>(event?.status || 'ativo');
  
  // Capacity and batches
  const [totalCapacity, setTotalCapacity] = useState(String(event?.totalCapacity || 1000));
  const [courtesyCount, setCourtesyCount] = useState(String(event?.courtesyCount || 50));
  const [facialEnabled, setFacialEnabled] = useState(event?.facialRecognition?.enabled ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProd = producers.find(p => p.id === producerId) || selectedProducer;
    const capacityNum = parseInt(totalCapacity, 10) || 1000;
    const courtesyNum = parseInt(courtesyCount, 10) || 0;

    const baseBatches: TicketBatch[] = event?.batches || [
      {
        id: `batch-${Date.now()}-1`,
        name: '1º Lote - Entrada Geral',
        type: 'Pista',
        price: 120.00,
        fee: 12.00,
        totalQuantity: Math.floor(capacityNum * 0.7),
        soldQuantity: event?.salesCount || 0,
        courtesyQuantity: courtesyNum,
        availableQuantity: Math.floor(capacityNum * 0.7) - (event?.salesCount || 0),
        status: 'ativo',
      }
    ];

    const savedEvent: EventItem = {
      id: event?.id || Date.now(),
      code: event?.code || String(Math.floor(1000 + Math.random() * 9000)),
      title: title.trim() || 'Novo Evento DiskIngressos',
      category: category as any,
      producer: selectedProd.id,
      producerName: selectedProd.name,
      venue: venue.trim() || 'Espaço de Eventos',
      address: address.trim() || 'Av. Principal, 1000',
      city: city.trim() || 'Curitiba',
      state: state.trim() || 'PR',
      date: date.trim() || '30/10/2026 20:00',
      endDate: endDate.trim() || undefined,
      badge: badgeText.trim() || undefined,
      coverType: coverType as any,
      cover: coverType,
      description: description.trim(),
      totalCapacity: capacityNum,
      salesCount: event?.salesCount || 0,
      courtesyCount: courtesyNum,
      availableCount: capacityNum - (event?.salesCount || 0) - courtesyNum,
      totalRevenue: event?.totalRevenue || 0,
      occupancyRate: event?.occupancyRate || 0,
      averageTicketPrice: event?.averageTicketPrice || 120,
      status,
      batches: baseBatches,
      facialRecognition: {
        enabled: facialEnabled,
        registeredCount: event?.facialRecognition?.registeredCount || 0,
        pendingCount: event?.facialRecognition?.pendingCount || 0,
        validationRate: event?.facialRecognition?.validationRate || 99,
      },
      metaPixel: event?.metaPixel || {
        pixelId: '',
      }
    };

    onSave(savedEvent);
  };

  // Mock Event for Live Preview
  const previewEvent: EventItem = {
    id: event?.id || 999,
    code: event?.code || 'NOVO',
    title: title || 'Título do Evento',
    category: category as any,
    producer: producerId,
    producerName: producers.find(p => p.id === producerId)?.name || selectedProducer.name,
    venue: venue || 'Local do Evento',
    address: address || 'Endereço',
    city: city || 'Curitiba',
    state: state || 'PR',
    date: date || 'Data do Evento',
    badge: badgeText || undefined,
    coverType: coverType as any,
    cover: coverType,
    totalCapacity: parseInt(totalCapacity, 10) || 1000,
    salesCount: event?.salesCount || 0,
    courtesyCount: parseInt(courtesyCount, 10) || 0,
    availableCount: (parseInt(totalCapacity, 10) || 1000) - (event?.salesCount || 0),
    totalRevenue: event?.totalRevenue || 0,
    occupancyRate: event?.occupancyRate || 0,
    status,
    batches: event?.batches || [],
    facialRecognition: {
      enabled: facialEnabled,
      registeredCount: 0,
      pendingCount: 0,
      validationRate: 100,
    }
  };

  const steps = [
    { num: 1, title: 'Informações Gerais' },
    { num: 2, title: 'Local e Data' },
    { num: 3, title: 'Capacidade & Lotes' },
    { num: 4, title: 'Publicação & Visual' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Back Link */}
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para Todos os Eventos
      </button>

      {/* Page Header */}
      <PageHeader
        eyebrow={mode === 'new' ? 'CADASTRO DE EVENTO' : 'EDIÇÃO DE EVENTO'}
        title={mode === 'new' ? 'Novo Evento' : `Editar: ${event?.title}`}
        subtitle="Preencha as informações para disponibilizar as vendas na plataforma DiskIngressos."
      />

      {/* Wizard Steps Bar */}
      <Card padding="sm" className="p-2">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-btn text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1677FF] text-white shadow-sm'
                    : isDone
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-[#718096] hover:bg-slate-100'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                  isActive ? 'bg-white text-[#1677FF]' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {isDone ? <Check size={11} /> : step.num}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Grid: Form Left (2 cols) + Live Preview Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* STEP 1: Informações Gerais */}
          {currentStep === 1 && (
            <Card padding="md" className="space-y-4">
              <h2 className="text-[17px] font-bold text-[#0E1726] border-b border-[#EDF0F4] pb-3">
                1. Informações Básicas do Evento
              </h2>

              <Input
                label="Nome Principal do Evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Curitiba Jazz Sessions 2026"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Categoria"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="Show & Concerto">Show & Concerto</option>
                  <option value="Congresso & Palestra">Congresso & Palestra</option>
                  <option value="Festival">Festival</option>
                  <option value="Stand-up Comedy">Stand-up Comedy</option>
                  <option value="Música Eletrônica">Música Eletrônica</option>
                  <option value="Teatro & Cultura">Teatro & Cultura</option>
                </Select>

                <Select
                  label="Produtora Responsável"
                  value={producerId}
                  onChange={(e) => setProducerId(e.target.value)}
                >
                  {producers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.cnpj})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Badge Promocional (Opcional)"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="Ex: ÚLTIMOS INGRESSOS"
                />

                <Select
                  label="Status do Evento"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="ativo">Ativo (Vendas Liberadas)</option>
                  <option value="rascunho">Rascunho (Oculto)</option>
                  <option value="inativo">Inativo / Encerrado</option>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" variant="primary" onClick={() => setCurrentStep(2)}>
                  Próxima Etapa: Local e Data →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2: Local e Data */}
          {currentStep === 2 && (
            <Card padding="md" className="space-y-4">
              <h2 className="text-[17px] font-bold text-[#0E1726] border-b border-[#EDF0F4] pb-3">
                2. Localização, Data e Horário
              </h2>

              <Input
                label="Nome do Espaço / Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Ex: Teatro Positivo - Grande Auditório"
                required
              />

              <Input
                label="Endereço Completo"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: R. Prof. Pedro Viriato Parigot de Souza, 5300"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cidade"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Curitiba"
                  required
                />
                <Input
                  label="Estado (UF)"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="PR"
                  maxLength={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Data e Hora de Início"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="Ex: 30/10/2026 20:00"
                  required
                />
                <Input
                  label="Data de Término (Opcional)"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Ex: 30/10/2026 23:30"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setCurrentStep(1)}>
                  ← Voltar
                </Button>
                <Button type="button" variant="primary" onClick={() => setCurrentStep(3)}>
                  Próxima Etapa: Capacidade →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: Capacidade & Lotes */}
          {currentStep === 3 && (
            <Card padding="md" className="space-y-4">
              <h2 className="text-[17px] font-bold text-[#0E1726] border-b border-[#EDF0F4] pb-3">
                3. Capacidade e Controle de Acesso
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Capacidade Total do Evento (Lotação)"
                  type="number"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  required
                />

                <Input
                  label="Cortesias Reservadas"
                  type="number"
                  value={courtesyCount}
                  onChange={(e) => setCourtesyCount(e.target.value)}
                />
              </div>

              <div className="rounded-btn border border-[#CBD5E1] bg-[#F8FAFC] p-4 flex items-center justify-between">
                <div>
                  <strong className="text-[14px] font-bold text-[#0E1726] block">
                    Validação por Biometria Facial Antifraude
                  </strong>
                  <p className="text-[12px] text-[#718096]">
                    Habilita captura de foto do comprador e liberação automática por catraca biométrica.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={facialEnabled}
                  onChange={(e) => setFacialEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-[#CBD5E1] text-[#1677FF] focus:ring-[#1677FF] cursor-pointer"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" onClick={() => setCurrentStep(2)}>
                  ← Voltar
                </Button>
                <Button type="button" variant="primary" onClick={() => setCurrentStep(4)}>
                  Próxima Etapa: Publicação →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: Publicação & Visual */}
          {currentStep === 4 && (
            <Card padding="md" className="space-y-4">
              <h2 className="text-[17px] font-bold text-[#0E1726] border-b border-[#EDF0F4] pb-3">
                4. Tema Visual & Publicação
              </h2>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-2">
                  Escolha o Estilo da Capa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'nature', label: 'Música & Natureza', color: 'from-[#2d472c] to-[#4d6938]' },
                    { id: 'maiden', label: 'Heavy Metal / Rock', color: 'from-[#121826] to-[#b26922]' },
                    { id: 'conference', label: 'Congresso & Palestra', color: 'from-[#1e6f9f] to-[#c6895d]' },
                    { id: 'festival', label: 'Festival / Eletrônico', color: 'from-[#1e1b4b] to-[#831843]' },
                    { id: 'standup', label: 'Stand-up Comedy', color: 'from-[#18181b] to-[#3f3f46]' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setCoverType(style.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-btn border text-center transition ${
                        coverType === style.id
                          ? 'border-[#1677FF] bg-blue-50/50 shadow-xs ring-2 ring-[#1677FF]/20'
                          : 'border-[#CBD5E1] bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`h-8 w-full rounded bg-gradient-to-r ${style.color} mb-2 shadow-2xs`} />
                      <span className="text-[12px] font-bold text-[#0E1726]">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-[#EDF0F4]">
                <Button type="button" variant="secondary" onClick={() => setCurrentStep(3)}>
                  ← Voltar
                </Button>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" icon={<Check size={16} />}>
                    {mode === 'new' ? 'Publicar Evento' : 'Salvar Alterações'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </form>

        {/* Live Preview Column Right */}
        <div className="space-y-4 sticky top-[90px]">
          <Card padding="none" className="overflow-hidden">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Eye size={14} className="text-[#1677FF]" />
                Pré-visualização em Tempo Real
              </span>
              <Badge status={status} />
            </div>

            <div className="p-4 space-y-4">
              <div className="h-40 w-full rounded-btn overflow-hidden shadow-xs bg-slate-900">
                <EventCoverVisual event={previewEvent} className="h-full w-full" />
              </div>

              <div>
                <h3 className="text-[17px] font-bold text-[#0E1726] line-clamp-1">{previewEvent.title}</h3>
                <p className="text-[12px] text-[#64748B] flex items-center gap-1 mt-1">
                  <MapPin size={13} className="text-[#EF4444]" />
                  {previewEvent.venue} — {previewEvent.city}/{previewEvent.state}
                </p>
                <p className="text-[12px] text-[#1677FF] font-semibold flex items-center gap-1 mt-1">
                  <Calendar size={13} />
                  {previewEvent.date}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EDF0F4] text-center text-[11px]">
                <div className="rounded bg-slate-50 p-2">
                  <span className="text-[#64748B] block">Capacidade</span>
                  <strong className="text-[#0E1726] text-[13px]">{totalCapacity}</strong>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <span className="text-[#64748B] block">Cortesias</span>
                  <strong className="text-[#0E1726] text-[13px]">{courtesyCount}</strong>
                </div>
                <div className="rounded bg-slate-50 p-2">
                  <span className="text-[#64748B] block">Biometria</span>
                  <strong className={facialEnabled ? 'text-[#06B6D4] text-[13px]' : 'text-slate-400'}>
                    {facialEnabled ? 'Ativa' : 'Não'}
                  </strong>
                </div>
              </div>
            </div>
          </Card>

          {/* Checklist Helper */}
          <Card padding="sm" className="bg-[#F8FAFC]">
            <strong className="text-[13px] font-bold text-[#0E1726] block mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              Checklist de Publicação
            </strong>
            <ul className="space-y-1.5 text-[12px] text-[#718096]">
              <li className={title.length > 3 ? 'text-emerald-700 font-semibold' : ''}>
                • Título do evento preenchido
              </li>
              <li className={venue.length > 2 ? 'text-emerald-700 font-semibold' : ''}>
                • Local e data configurados
              </li>
              <li className={parseInt(totalCapacity, 10) > 0 ? 'text-emerald-700 font-semibold' : ''}>
                • Capacidade informada
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
