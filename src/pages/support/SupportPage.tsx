import React, { useEffect, useMemo, useState, type FormEvent } from 'react';
import { 
  Headphones, BarChart3, Clock3, Plus, ShieldCheck, 
  Link2, BookOpen, TicketCheck, RefreshCw, AlertTriangle, 
  CheckCircle2, MessageCircle, Mail, Phone, ExternalLink,
  Layers, ArrowUpRight, Flame, Sparkles, Filter
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { 
  getSupportSummary, getSupportTickets, createSupportTicket, updateSupportTicket,
  getSlaPolicies, getSupportIntegrations,
  type SupportSummary, type SupportTicket, type SlaPolicy, type SupportIntegration 
} from '../../services/api';
import { Button } from '../../components/ui/Button';

export type SupportMode = 
  | 'sac-hub'
  | 'sac-dashboard'
  | 'sac-tickets'
  | 'sac-new'
  | 'sac-sla'
  | 'sac-integrations'
  | 'sac-knowledge'
  | 'sac-reports';

interface SupportPageProps {
  mode: SupportMode;
  producerId: number | null;
  producerName: string;
  events: EventItem[];
  notify?: (msg: string) => void;
  onNavigate?: (key: SupportMode) => void;
}

const minutesToHuman = (m: number) =>
  m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} horas` : `${Math.round(m / 1440)} dias`;

export const SupportPage: React.FC<SupportPageProps> = ({
  mode,
  producerId,
  producerName,
  events,
  notify,
  onNavigate,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [summary, setSummary] = useState<SupportSummary>({
    total: 0,
    open: 0,
    p1: 0,
    overdue: 0,
    resolved: 0,
    slaCompliance: 100,
  });
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [integrations, setIntegrations] = useState<SupportIntegration[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    subject: '',
    description: '',
    category: 'incidente',
    impact: 'medio',
    urgency: 'media',
    channel: 'portal',
    eventId: '',
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    assignedTo: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, s, p, i] = await Promise.all([
        getSupportTickets(producerId || undefined),
        getSupportSummary(producerId || undefined),
        getSlaPolicies(producerId || undefined),
        getSupportIntegrations(producerId || undefined),
      ]);
      setTickets(t);
      setSummary(s);
      setPolicies(p);
      setIntegrations(i);
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao carregar dados do SAC.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [producerId]);

  const openTickets = tickets.filter(t => !['resolvido', 'fechado'].includes(t.status));
  const byPriority = useMemo(
    () => ['P1', 'P2', 'P3', 'P4'].map(p => ({ p, count: openTickets.filter(t => t.priority === p).length })),
    [tickets]
  );

  const handleCreateTicket = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createSupportTicket({
        ...form,
        eventId: form.eventId ? Number(form.eventId) : null,
        producerId: producerId || undefined,
      });
      if (notify) notify('Chamado aberto com SLA calculado automaticamente pela matriz ITIL!');
      setForm({
        ...form,
        subject: '',
        description: '',
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
      });
      await loadData();
      if (onNavigate) onNavigate('sac-tickets');
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao abrir chamado.');
    }
  };

  const handleStatusChange = async (t: SupportTicket, nextStatus: string) => {
    try {
      await updateSupportTicket(t.id, {
        status: nextStatus,
        producerId: producerId || undefined,
      });
      if (notify) notify(`Chamado ${t.code} atualizado para "${nextStatus}".`);
      await loadData();
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao atualizar chamado.');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'P1':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs animate-pulse">P1 • Crítico</span>;
      case 'P2':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white">P2 • Alto</span>;
      case 'P3':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">P3 • Moderado</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500 text-white">P4 • Baixo</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'resolvido':
      case 'fechado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolvido</span>;
      case 'em-atendimento':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Em Atendimento</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Aberto</span>;
    }
  };

  // 1. Hub View
  if (mode === 'sac-hub') {
    const modules = [
      { id: 'sac-dashboard', title: 'Dashboard SAC', desc: 'Indicadores, SLA, prioridades e backlog.', icon: BarChart3, color: 'text-purple-600' },
      { id: 'sac-tickets', title: 'Fila de Chamados', desc: 'Gestão do ciclo de vida e atendimento omnichannel.', icon: Headphones, color: 'text-blue-600' },
      { id: 'sac-new', title: 'Abrir Chamado', desc: 'Registro com impacto, urgência e evento.', icon: Plus, color: 'text-emerald-600' },
      { id: 'sac-sla', title: 'SLA & ITIL', desc: 'Políticas P1–P4, prazos e boas práticas ITIL.', icon: Clock3, color: 'text-orange-500' },
      { id: 'sac-integrations', title: 'Integrações', desc: 'WhatsApp, e-mail, vendas, financeiro e eventos.', icon: Link2, color: 'text-indigo-600' },
      { id: 'sac-knowledge', title: 'Base de Conhecimento', desc: 'Artigos, procedimentos operacionais e FAQ.', icon: BookOpen, color: 'text-teal-600' },
      { id: 'sac-reports', title: 'Relatórios', desc: 'FCR, MTTA, MTTR, CSAT e produtividade.', icon: TicketCheck, color: 'text-slate-700' },
    ];

    return (
      <div className="w-full space-y-6 select-none font-sans">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              ATENDIMENTO / SAC
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">• Service Desk ITIL Multi-Produtor</span>
          </div>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">
            Central de Atendimento & Gestão de Nível de Serviço (SLA)
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Centralize incidentes, requisições de serviço, políticas de SLA P1–P4 e resoluções para participantes e produtores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(({ id, title, desc, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => onNavigate?.(id as SupportMode)}
              className="flex items-start justify-between p-4 rounded-card bg-white border border-[#E2E8F0] hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-btn bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <strong className="text-sm font-bold text-[#0E1726] block group-hover:text-[#1677FF] transition-colors">
                    {title}
                  </strong>
                  <span className="text-[11px] text-[#718096] block mt-0.5">
                    {desc}
                  </span>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#1677FF] transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Open New Ticket View
  if (mode === 'sac-new') {
    return (
      <div className="w-full space-y-6 select-none font-sans">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">Abrir Novo Chamado</h2>
          <p className="text-[12px] text-[#718096]">
            A prioridade é calculada pela matriz ITIL de <strong>Impacto × Urgência</strong> e o SLA inicia automaticamente no banco.
          </p>
        </div>

        <div className="bg-white p-6 rounded-card border border-[#E2E8F0] shadow-xs max-w-4xl">
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Solicitante *
                </label>
                <input
                  type="text"
                  required
                  value={form.requesterName}
                  onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                  placeholder="Nome do cliente ou produtor"
                  className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.requesterEmail}
                  onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                  placeholder="cliente@email.com"
                  className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={form.requesterPhone}
                  onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })}
                  placeholder="(41) 99999-0000"
                  className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Evento Relacionado
                </label>
                <select
                  value={form.eventId}
                  onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                  className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#1677FF]"
                >
                  <option value="">Sem evento específico</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Categoria ITIL
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#1677FF]"
                >
                  <option value="incidente">Incidente</option>
                  <option value="requisicao">Requisição de Serviço</option>
                  <option value="problema">Problema</option>
                  <option value="acesso">Gestão de Acesso</option>
                  <option value="financeiro">Financeiro / Estorno</option>
                  <option value="ingresso">Ingresso / Check-in</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Impacto
                </label>
                <select
                  value={form.impact}
                  onChange={(e) => setForm({ ...form, impact: e.target.value })}
                  className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#1677FF]"
                >
                  <option value="baixo">Baixo (Usuário único)</option>
                  <option value="medio">Médio (Grupo restrito)</option>
                  <option value="alto">Alto (Evento / Lote)</option>
                  <option value="critico">Crítico (Sistema global)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Urgência
                </label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#1677FF]"
                >
                  <option value="baixa">Baixa (Pode aguardar)</option>
                  <option value="media">Média (Atenção normal)</option>
                  <option value="alta">Alta (Evento próximo)</option>
                  <option value="critica">Crítica (Evento acontecendo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Assunto do Chamado *
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Ex.: Ingresso não chegou por e-mail após pagamento via PIX"
                className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Descrição Detalhada *
              </label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes completos do ocorrido, código da transação, comprovantes informados..."
                className="w-full p-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <Button type="button" variant="secondary" onClick={() => onNavigate?.('sac-tickets')}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" icon={<Plus size={16} />}>
                Abrir Chamado
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. SLA & ITIL Policies View
  if (mode === 'sac-sla') {
    return (
      <div className="w-full space-y-6 select-none font-sans">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            GESTÃO DE NÍVEL DE SERVIÇO (SLA)
          </span>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight mt-1">
            Políticas de SLA & Práticas ITIL
          </h2>
          <p className="text-[12px] text-[#718096]">
            Metas de tempo para primeira resposta e resolução definitiva calculadas por prioridade.
          </p>
        </div>

        {/* 4 SLA Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {policies.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  p.priority === 'P1' ? 'bg-rose-600 text-white' : p.priority === 'P2' ? 'bg-orange-500 text-white' : p.priority === 'P3' ? 'bg-blue-500 text-white' : 'bg-slate-500 text-white'
                }`}>
                  {p.priority}
                </span>
                <span className="text-[11px] font-bold text-slate-500">{p.businessHours}</span>
              </div>
              <strong className="text-sm font-bold text-slate-900 block">{p.name}</strong>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Primeira Resposta:</span>
                  <strong className="text-slate-900">{minutesToHuman(p.responseMinutes)}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Resolução:</span>
                  <strong className="text-slate-900">{minutesToHuman(p.resolutionMinutes)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ITIL Best Practices Framework */}
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-[16px] font-bold text-slate-900">Práticas ITIL Incorporadas na Plataforma</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {[
              'Gestão de Incidentes',
              'Requisição de Serviço',
              'Gestão de Problemas',
              'Gestão de Acesso',
              'Base KEDB / FAQ',
              'Escalonamento Funcional',
              'Escalonamento Hierárquico',
              'Auditoria de SLA',
              'Histórico Imutável',
              'Melhoria Contínua',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-card bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. Integrations View
  if (mode === 'sac-integrations') {
    return (
      <div className="w-full space-y-6 select-none font-sans">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            INTEGRAÇÕES OMNICHANNEL
          </span>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight mt-1">
            Conexões e Correlações do Service Desk
          </h2>
          <p className="text-[12px] text-[#718096]">
            Um chamado de suporte pode se correlacionar diretamente com qualquer entidade do sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((i) => (
            <div key={i.id} className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs flex items-start gap-3">
              <div className="p-2.5 rounded-btn bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Link2 size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-slate-900">{i.name}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {i.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{i.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-[16px] font-bold text-slate-900">Correlação com o Ecossistema DiskIngressos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[
              'Eventos e Lotes',
              'Pedidos e Pagamentos PIX',
              'Ingressos / QR Codes',
              'Participantes e Check-ins',
              'Terminais POS e Transações',
              'Repasses e Estornos',
              'Campanhas de Marketing',
              'Automações e Remarketing',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-card bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                <RefreshCw size={14} className="text-[#1677FF] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Knowledge Base View
  if (mode === 'sac-knowledge') {
    return (
      <div className="w-full space-y-6 select-none font-sans">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">Base de Conhecimento (KEDB)</h2>
          <p className="text-[12px] text-[#718096]">
            Procedimentos operacionais padronizados, erros conhecidos e artigos para resolução rápida (FCR).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Como reenviar ingresso por WhatsApp/E-mail', cat: 'Procedimento Operacional', badge: 'Revisado' },
            { title: 'Pagamento PIX não identificado na compensação', cat: 'Falha Conhecida (KEDB)', badge: 'Crítico' },
            { title: 'Alteração de titularidade e transferência', cat: 'Regra de Negócio', badge: 'Ativo' },
            { title: 'Solicitação e fluxo de estorno financeiro', cat: 'Procedimento Financeiro', badge: 'Revisado' },
            { title: 'Instruções para falha de leitura no Check-in', cat: 'Operação de Campo', badge: 'Ativo' },
            { title: 'Configuração de herança de Pixel Meta/GA4', cat: 'Marketing & Tech', badge: 'Ativo' },
          ].map((kb, idx) => (
            <div key={idx} className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-xs flex items-start gap-3 hover:border-blue-300 transition">
              <div className="p-2.5 rounded-btn bg-teal-50 text-teal-600 border border-teal-100">
                <BookOpen size={20} />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">{kb.title}</strong>
                <span className="text-[11px] text-slate-500 block mt-0.5">{kb.cat}</span>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {kb.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. Reports View
  if (mode === 'sac-reports') {
    return (
      <div className="w-full space-y-6 select-none font-sans">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">Relatórios de Atendimento & SLA</h2>
          <p className="text-[12px] text-[#718096]">
            Desempenho consolidado do Service Desk, volume de chamados e conformidade contratual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Backlog por Nível de Prioridade</h3>
            <div className="space-y-3">
              {byPriority.map(({ p, count }) => (
                <div key={p} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-bold text-slate-700">{p}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        p === 'P1' ? 'bg-rose-600' : p === 'P2' ? 'bg-orange-500' : p === 'P3' ? 'bg-blue-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.min(100, count * 25)}%` }}
                    />
                  </div>
                  <strong className="w-8 text-right font-bold text-slate-900">{count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Indicadores Chave de ITIL & SAC</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-card border border-slate-200">
                <span className="text-slate-500 block text-[11px]">FCR (First Contact Resolution)</span>
                <strong className="text-base text-slate-900 block mt-1">78.4%</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-card border border-slate-200">
                <span className="text-slate-500 block text-[11px]">MTTA (Tempo Médio de Atendimento)</span>
                <strong className="text-base text-slate-900 block mt-1">12 min</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-card border border-slate-200">
                <span className="text-slate-500 block text-[11px]">MTTR (Tempo Médio de Resolução)</span>
                <strong className="text-base text-slate-900 block mt-1">2.4 horas</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-card border border-slate-200">
                <span className="text-slate-500 block text-[11px]">CSAT (Satisfação do Cliente)</span>
                <strong className="text-base text-emerald-600 block mt-1">4.9 / 5.0</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. Dashboard SAC & 8. Tickets List
  const isDashboard = mode === 'sac-dashboard';

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1677FF] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              SERVICE DESK ITIL
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">• {producerName}</span>
          </div>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">
            {isDashboard ? 'Dashboard de Atendimento & SLA' : 'Fila Geral de Chamados'}
          </h2>
          <p className="text-[12px] text-[#718096]">
            {isDashboard
              ? 'Visão operacional em tempo real de SLA, prioridades P1–P4, backlog e conformidade.'
              : 'Gerencie incidentes e requisições de serviço com prazos auditados pelo banco.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={loadData} icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}>
            Atualizar
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigate?.('sac-new')} icon={<Plus size={14} />}>
            Abrir Chamado
          </Button>
        </div>
      </div>

      {/* 4 KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Chamados Abertos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-blue-50 text-blue-600">
              <Headphones size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary.open}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            Backlog em atendimento
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Críticos (P1)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-rose-50 text-rose-600">
              <Flame size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-rose-600 block mt-2">
            {summary.p1}
          </span>
          <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
            Atendimento imediato (15 min)
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">SLA Vencido</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-amber-50 text-amber-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-amber-600 block mt-2">
            {summary.overdue}
          </span>
          <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
            Exigem escalonamento
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Conformidade de SLA</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-emerald-600 block mt-2">
            {summary.slaCompliance}%
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
            Meta operacional ≥ 95%
          </span>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">Fila de Chamados Registrados</h3>
            <span className="text-[11px] text-slate-500">{tickets.length} chamados no banco</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                <th className="p-3">Código</th>
                <th className="p-3">Assunto</th>
                <th className="p-3">Solicitante</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Status</th>
                <th className="p-3">SLA Resolução</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-400">
                    Nenhum chamado registrado no momento.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const isOverdue = new Date(t.resolutionDueAt).getTime() < Date.now() && !['resolvido', 'fechado'].includes(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{t.code}</td>
                      <td className="p-3 font-bold text-slate-900 max-w-[200px] truncate" title={t.subject}>
                        {t.subject}
                      </td>
                      <td className="p-3">
                        <strong className="block text-slate-900">{t.requesterName}</strong>
                        <span className="text-[10px] text-slate-500 block">{t.requesterEmail || t.requesterPhone || 'Sem contato'}</span>
                      </td>
                      <td className="p-3 capitalize font-semibold text-slate-700">{t.category}</td>
                      <td className="p-3">{getPriorityBadge(t.priority)}</td>
                      <td className="p-3">{getStatusBadge(t.status)}</td>
                      <td className="p-3">
                        <span className="block font-medium text-slate-800">
                          {new Date(t.resolutionDueAt).toLocaleString('pt-BR')}
                        </span>
                        <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isOverdue ? '⚠ SLA Vencido' : 'Dentro do Prazo'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === 'aberto' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStatusChange(t, 'em-atendimento')}
                            >
                              Atender
                            </Button>
                          )}
                          {!['resolvido', 'fechado'].includes(t.status) && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleStatusChange(t, 'resolvido')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Resolver
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
