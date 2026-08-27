import React, { useEffect, useState } from 'react';
import { 
  Bot, Mail, MessageCircle, Play, Plus, Send, 
  Workflow, Zap, CheckCircle2, PauseCircle, Clock, 
  Layers, ArrowUpRight, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import type { EventItem } from '../../types/event';
import { 
  getAutomationFlows, createAutomationFlow, updateAutomationFlow, testAutomationFlow,
  getMessageTemplates, createMessageTemplate, getAutomationExecutions,
  type AutomationFlow, type MessageTemplate, type AutomationExecution
} from '../../services/api';
import { Button } from '../../components/ui/Button';

interface AutomationCenterPageProps {
  producerId: number | null;
  events: EventItem[];
  mode: 'automations' | 'whatsapp' | 'email';
  notify?: (msg: string) => void;
}

const triggers = [
  ['cart_abandoned', 'Carrinho abandonado'],
  ['payment_pending', 'Pagamento PIX/Boleto pendente'],
  ['purchase_confirmed', 'Compra confirmada (Transacional)'],
  ['last_lot', 'Último lote / Escassez'],
  ['post_event', 'Pós-evento (+30 dias)'],
  ['birthday', 'Aniversariante'],
];

export const AutomationCenterPage: React.FC<AutomationCenterPageProps> = ({
  producerId,
  events,
  mode,
  notify,
}) => {
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [flowForm, setFlowForm] = useState({
    name: '',
    trigger: 'cart_abandoned',
    channel: (mode === 'email' ? 'email' : mode === 'whatsapp' ? 'whatsapp' : 'multicanal') as 'whatsapp' | 'email' | 'multicanal',
    audience: 'compradores',
    delayMinutes: '30',
    eventId: '',
  });

  const [tplForm, setTplForm] = useState({
    name: '',
    subject: '',
    body: '',
    eventId: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const channel = mode === 'automations' ? undefined : mode;
      const [f, t, e] = await Promise.all([
        getAutomationFlows(producerId || undefined),
        getMessageTemplates(producerId || undefined, undefined, channel),
        getAutomationExecutions(producerId || undefined),
      ]);
      setFlows(f);
      setTemplates(t);
      setExecutions(e);
    } catch (err: any) {
      if (notify) notify(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [producerId, mode]);

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAutomationFlow({
        ...flowForm,
        delayMinutes: Number(flowForm.delayMinutes || 0),
        producerId: producerId || undefined,
        eventId: flowForm.eventId ? Number(flowForm.eventId) : undefined,
        channel: mode === 'automations' ? flowForm.channel : mode,
      });
      setFlowForm({ ...flowForm, name: '' });
      if (notify) notify('Fluxo de automação criado e salvo no banco!');
      loadData();
    } catch (err: any) {
      if (notify) notify(`Falha ao criar fluxo: ${err.message}`);
    }
  };

  const handleToggleFlow = async (flow: AutomationFlow) => {
    try {
      const nextStatus = flow.status === 'ativo' ? 'pausado' : 'ativo';
      await updateAutomationFlow(flow.id, { status: nextStatus });
      if (notify) notify(`Fluxo "${flow.name}" ${nextStatus === 'ativo' ? 'ativado' : 'pausado'}.`);
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message);
    }
  };

  const handleTestFlow = async (flowId: number) => {
    try {
      await testAutomationFlow(flowId);
      if (notify) notify('Disparo de teste executado e registrado no histórico!');
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMessageTemplate({
        ...tplForm,
        channel: mode === 'email' ? 'email' : 'whatsapp',
        category: 'marketing',
        producerId: producerId || undefined,
        eventId: tplForm.eventId ? Number(tplForm.eventId) : undefined,
      });
      setTplForm({ name: '', subject: '', body: '', eventId: '' });
      if (notify) notify('Template de mensagem salvo com sucesso!');
      loadData();
    } catch (err: any) {
      if (notify) notify(`Falha ao salvar template: ${err.message}`);
    }
  };

  const triggerLabel = (val: string) => {
    const found = triggers.find(([k]) => k === val);
    return found ? found[1] : val;
  };

  if (mode === 'automations') {
    return (
      <div className="w-full space-y-6 select-none font-sans">
        {/* Intro Banner */}
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                AUTOMAÇÕES & JORNADAS
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">• Persistência Multi-Tenant</span>
            </div>
            <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">
              Jornadas Automáticas & Gatilhos Inteligentes
            </h2>
            <p className="text-[12px] text-[#718096]">
              Crie fluxos de WhatsApp, e-mail e multicanal acionados por eventos reais do checkout.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadData} icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}>
            Atualizar
          </Button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fluxos Ativos</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-purple-50 text-[#7C3AED]">
                <Workflow size={16} />
              </div>
            </div>
            <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
              {flows.filter(f => f.status === 'ativo').length} / {flows.length}
            </span>
          </div>

          <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mensagens Enviadas</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-blue-50 text-blue-600">
                <Send size={16} />
              </div>
            </div>
            <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
              {flows.reduce((a, f) => a + f.sentCount, 0).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Conversões Salvas</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-emerald-50 text-emerald-600">
                <Zap size={16} />
              </div>
            </div>
            <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
              {flows.reduce((a, f) => a + f.convertedCount, 0).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Execuções Recentes</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-orange-50 text-orange-600">
                <Play size={16} />
              </div>
            </div>
            <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
              {executions.length} disparos
            </span>
          </div>
        </div>

        {/* Create Flow Form + Flows List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
            <h3 className="text-[16px] font-bold text-slate-900 mb-1">Criar Nova Automação</h3>
            <p className="text-[12px] text-slate-500 mb-4">Defina o gatilho, canal e tempo de espera.</p>

            <form onSubmit={handleCreateFlow} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Nome do Fluxo
                </label>
                <input
                  type="text"
                  required
                  value={flowForm.name}
                  onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                  placeholder="Ex.: Carrinho Abandonado 30 min"
                  className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#7C3AED] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Gatilho
                  </label>
                  <select
                    value={flowForm.trigger}
                    onChange={(e) => setFlowForm({ ...flowForm, trigger: e.target.value })}
                    className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#7C3AED]"
                  >
                    {triggers.map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Canal
                  </label>
                  <select
                    value={flowForm.channel}
                    onChange={(e) => setFlowForm({ ...flowForm, channel: e.target.value as any })}
                    className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#7C3AED]"
                  >
                    <option value="multicanal">WhatsApp + E-mail</option>
                    <option value="whatsapp">WhatsApp Direct</option>
                    <option value="email">E-mail Marketing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Atraso (Minutos)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={flowForm.delayMinutes}
                    onChange={(e) => setFlowForm({ ...flowForm, delayMinutes: e.target.value })}
                    className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Evento
                  </label>
                  <select
                    value={flowForm.eventId}
                    onChange={(e) => setFlowForm({ ...flowForm, eventId: e.target.value })}
                    className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#7C3AED]"
                  >
                    <option value="">Todos os eventos</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" fullWidth icon={<Plus size={15} />} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
                  Salvar e Ativar Fluxo
                </Button>
              </div>
            </form>
          </div>

          {/* List of Flows */}
          <div className="lg:col-span-7 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Fluxos Persistidos no Banco</h3>
                <span className="text-[11px] text-slate-500">{flows.length} automações configuradas</span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {flows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Nenhum fluxo cadastrado.</div>
              ) : (
                flows.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3.5 rounded-card bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-slate-900">{f.name}</strong>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          f.status === 'ativo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {triggerLabel(f.trigger)} • {f.channel} • {f.event?.title || 'Todos os eventos'} • {f.delayMinutes} min
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Enviadas: {f.sentCount} | Conversões: {f.convertedCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleToggleFlow(f)}
                      >
                        {f.status === 'ativo' ? 'Pausar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleTestFlow(f.id)}
                        icon={<Play size={12} />}
                      >
                        Testar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Executions History Table */}
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-[16px] font-bold text-slate-900">Histórico de Execuções e Disparos</h3>
            <span className="text-[11px] text-slate-500">Registros em tempo real auditados no banco</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                  <th className="p-3">Fluxo</th>
                  <th className="p-3">Canal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Destinatário</th>
                  <th className="p-3">Horário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {executions.slice(0, 8).map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{ex.flow.name}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 uppercase text-[10px]">
                        {ex.channel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} /> {ex.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{ex.destination || 'contato-demo'}</td>
                    <td className="p-3 text-slate-500">{new Date(ex.scheduledAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Templates Mode (WhatsApp or E-mail)
  const isEmail = mode === 'email';

  return (
    <div className="w-full space-y-6 select-none font-sans">
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isEmail ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              {isEmail ? 'E-MAIL MARKETING' : 'WHATSAPP DIRECT'}
            </span>
          </div>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">
            {isEmail ? 'Templates & Campanhas de E-mail' : 'Templates de WhatsApp & Disparos'}
          </h2>
          <p className="text-[12px] text-[#718096]">
            Mensagens reutilizáveis com variáveis dinâmicas ({'{{nome}}'}, {'{{evento}}'}, {'{{link}}'}).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <h3 className="text-[16px] font-bold text-slate-900 mb-3">Novo Template</h3>

          <form onSubmit={handleCreateTemplate} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Nome do Template
              </label>
              <input
                type="text"
                required
                value={tplForm.name}
                onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })}
                placeholder="Ex.: Confirmação de Ingresso VIP"
                className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
              />
            </div>

            {isEmail && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  required
                  value={tplForm.subject}
                  onChange={(e) => setTplForm({ ...tplForm, subject: e.target.value })}
                  placeholder="Ex.: Seu ingresso para {{evento}} está pronto!"
                  className="w-full h-10 px-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-medium outline-none focus:border-[#1677FF] focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Evento Vinculado
              </label>
              <select
                value={tplForm.eventId}
                onChange={(e) => setTplForm({ ...tplForm, eventId: e.target.value })}
                className="w-full h-10 px-2.5 rounded-input border border-slate-300 bg-slate-50 text-xs font-bold outline-none focus:border-[#1677FF]"
              >
                <option value="">Todos os eventos</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Corpo da Mensagem
              </label>
              <textarea
                required
                rows={6}
                value={tplForm.body}
                onChange={(e) => setTplForm({ ...tplForm, body: e.target.value })}
                placeholder={
                  isEmail
                    ? 'Olá {{nome}},\n\nSeu ingresso para {{evento}} foi emitido com sucesso!\nAcesse pelo link: {{link_ingresso}}'
                    : 'Olá {{nome}}! 🎟️\nSeu ingresso para o {{evento}} está confirmado!\nLink: {{link}}'
                }
                className="w-full p-3 rounded-input border border-slate-300 bg-slate-50 text-xs font-mono outline-none focus:border-[#1677FF] focus:bg-white"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth icon={<Plus size={15} />}>
              Salvar Template
            </Button>
          </form>
        </div>

        {/* Templates List */}
        <div className="lg:col-span-7 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-[16px] font-bold text-slate-900">Templates Cadastrados</h3>
            <span className="text-[11px] text-slate-500">Prontos para uso em automações e disparos</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-card bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      isEmail ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {isEmail ? <Mail size={14} /> : <MessageCircle size={14} />}
                    </span>
                    <strong className="text-xs font-bold text-slate-900">{tpl.name}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {tpl.event?.title || 'Todos os eventos'}
                  </span>
                </div>

                {tpl.subject && (
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Assunto: {tpl.subject}
                  </span>
                )}

                <p className="text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded border border-slate-200/80 whitespace-pre-wrap">
                  {tpl.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
