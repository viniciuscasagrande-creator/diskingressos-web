import React, { useEffect, useState } from 'react';
import { 
  MessageCircle, Mail, Clock3, CheckCircle2, 
  AlertTriangle, RefreshCw, ShieldCheck, Webhook, 
  Send, Layers, ArrowUpRight
} from 'lucide-react';
import { 
  getCommunicationChannels, getCommunicationQueue, getCommunicationSummary, 
  getContactConsents, updateCommunicationChannel,
  type CommunicationChannel, type CommunicationSummary, type ContactConsent 
} from '../../services/api';
import { Button } from '../../components/ui/Button';

interface CommunicationPageProps {
  producerId: number | null;
  producerName?: string;
  notify?: (msg: string) => void;
}

export const CommunicationPage: React.FC<CommunicationPageProps> = ({
  producerId,
  producerName = 'DiskIngressos Produções',
  notify,
}) => {
  const [summary, setSummary] = useState<CommunicationSummary>({
    channels: 0,
    activeChannels: 0,
    queued: 0,
    sent: 0,
    failed: 0,
    optOuts: 0,
  });
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [consents, setConsents] = useState<ContactConsent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c, q, cs] = await Promise.all([
        getCommunicationSummary(producerId || undefined),
        getCommunicationChannels(producerId || undefined),
        getCommunicationQueue(producerId || undefined),
        getContactConsents(producerId || undefined),
      ]);
      setSummary(s);
      setChannels(c);
      setQueue(q);
      setConsents(cs);
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao carregar integrações de comunicação.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [producerId]);

  const handleToggleChannel = async (channel: CommunicationChannel) => {
    try {
      const nextStatus = channel.status === 'ativo' ? 'inativo' : 'ativo';
      await updateCommunicationChannel(channel.id, {
        status: nextStatus,
        producerId: producerId || undefined,
      });
      if (notify) notify(`Canal "${channel.type}" alterado para ${nextStatus}.`);
      loadData();
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao atualizar canal.');
    }
  };

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              INTEGRAÇÕES DE COMUNICAÇÃO
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">• Omnichannel + Fila + Webhooks + LGPD</span>
          </div>
          <h2 className="text-[20px] font-black text-[#0E1726] tracking-tight">
            WhatsApp Business, E-mail & Gestão de Consentimento
          </h2>
          <p className="text-[12px] text-[#718096]">
            Monitore provedores conectados, filas de disparos com retries automáticos e bases de opt-in/opt-out.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadData} icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}>
          Atualizar
        </Button>
      </div>

      {/* 4 KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Canais Ativos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-emerald-50 text-emerald-600">
              <MessageCircle size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary.activeChannels} / {summary.channels}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            Provedores configurados
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Mensagens na Fila</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-blue-50 text-blue-600">
              <Clock3 size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary.queued}
          </span>
          <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">
            Aguardando janela de envio
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disparos Concluídos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-purple-50 text-purple-600">
              <Send size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary.sent.toLocaleString('pt-BR')}
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
            Histórico auditado
          </span>
        </div>

        <div className="rounded-card bg-white p-4 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Opt-outs (LGPD)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-slate-100 text-slate-700">
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className="text-[22px] font-extrabold text-slate-900 block mt-2">
            {summary.optOuts}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
            Bloqueios respeitados
          </span>
        </div>
      </div>

      {/* Connected Channels Cards */}
      <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-[16px] font-bold text-slate-900">Provedores de Comunicação Conectados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((ch) => (
            <div key={ch.id} className="p-4 rounded-card bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-btn ${ch.type === 'whatsapp' ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-blue-100 text-blue-600'}`}>
                  {ch.type === 'whatsapp' ? <MessageCircle size={22} /> : <Mail size={22} />}
                </div>
                <div>
                  <strong className="text-sm font-bold text-slate-900 block">
                    {ch.type === 'whatsapp' ? 'WhatsApp Business API' : 'E-mail Transacional / Marketing'}
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    Provedor: {ch.provider} • Remetente: {ch.sender || 'Pendente'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    Modo: {ch.webhookMode}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant={ch.status === 'ativo' ? 'primary' : 'secondary'}
                onClick={() => handleToggleChannel(ch)}
                className={ch.status === 'ativo' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {ch.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Table + LGPD Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Queue Table */}
        <div className="lg:col-span-7 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-[16px] font-bold text-slate-900">Fila de Mensagens & Status de Entrega</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                  <th className="p-2.5">Automação</th>
                  <th className="p-2.5">Canal</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Destinatário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.slice(0, 6).map((q) => (
                  <tr key={q.id}>
                    <td className="p-2.5 font-bold text-slate-900">{q.flow?.name || 'Disparo Automático'}</td>
                    <td className="p-2.5 uppercase font-semibold text-slate-700">{q.channel}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-500">{q.destination || 'destinatario-demo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LGPD & Consent */}
        <div className="lg:col-span-5 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-[16px] font-bold text-slate-900">Diretrizes de Privacidade (LGPD)</h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Opt-in obrigatório no checkout e formulários</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>Cancelamento imediato de inscrição (Opt-out)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <Webhook size={16} className="text-blue-600 shrink-0" />
              <span>Webhooks de confirmação de entrega e leitura</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
              <RefreshCw size={16} className="text-purple-600 shrink-0" />
              <span>Retentativas com backoff exponencial para falhas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
