import React, { useState } from 'react';
import { 
  ShoppingCart, MessageCircle, Mail, RotateCw, 
  CheckCircle2, AlertCircle, Send, DollarSign, 
  TrendingUp, Users, ArrowUpRight
} from 'lucide-react';
import type { AbandonedCart } from '../../types/marketing';
import { mockAbandonedCarts } from '../../data/marketingData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';

interface AbandonedCartPageProps {
  notify?: (msg: string) => void;
}

export const AbandonedCartPage: React.FC<AbandonedCartPageProps> = ({ notify }) => {
  const [carts, setCarts] = useState<AbandonedCart[]>(mockAbandonedCarts);

  const formatBrl = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleRecoverViaWhatsApp = (cart: AbandonedCart) => {
    setCarts(carts.map(c => c.id === cart.id ? { ...c, status: 'in_recovery', recoveryChannel: 'whatsapp' } : c));
    if (notify) notify(`Mensagem com link de checkout enviada via WhatsApp para ${cart.buyerName}!`);
  };

  const handleRecoverViaEmail = (cart: AbandonedCart) => {
    setCarts(carts.map(c => c.id === cart.id ? { ...c, status: 'in_recovery', recoveryChannel: 'email' } : c));
    if (notify) notify(`E-mail de recuperação de carrinho enviado para ${cart.buyerEmail}!`);
  };

  const handleMarkAsRecovered = (cartId: string) => {
    setCarts(carts.map(c => c.id === cartId ? { ...c, status: 'recovered' } : c));
    if (notify) notify('Carrinho marcado como RECUPERADO e venda contabilizada!');
  };

  const totalLost = carts.reduce((acc, c) => acc + (c.status === 'abandoned' ? c.totalValue : 0), 0);
  const totalRecovered = carts.reduce((acc, c) => acc + (c.status === 'recovered' ? c.totalValue : 0), 0);

  const headers = [
    'Cliente / Comprador',
    'Evento & Setor',
    <div key="vl" className="text-right">Valor do Carrinho</div>,
    <div key="tm" className="text-center">Tempo Decorrido</div>,
    <div key="st" className="text-center">Status</div>,
    <div key="ac" className="text-right pr-2">Ações de Recuperação</div>
  ];

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              RECUPERAÇÃO DE VENDAS
            </span>
          </div>
          <h2 className="text-[20px] font-extrabold text-[#0E1726] tracking-tight">
            Carrinho Abandonado & Remarketing Direto
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Recupere clientes que iniciaram o checkout mas não concluíram o pagamento com disparos inteligentes.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setCarts(carts.map(c => c.status === 'abandoned' ? { ...c, status: 'in_recovery', recoveryChannel: 'whatsapp' } : c));
            if (notify) notify('Disparo em lote via WhatsApp iniciado para todos os carrinhos pendentes!');
          }}
          icon={<Send size={14} />}
          className="bg-[#25D366] hover:bg-[#1EBE5D] text-white"
        >
          Disparo em Lote (WhatsApp)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
            Carrinhos em Aberto (Perdidos)
          </span>
          <strong className="text-[24px] font-extrabold text-rose-600 block mt-2">
            {formatBrl(totalLost)}
          </strong>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            {carts.filter(c => c.status === 'abandoned').length} clientes aguardando contato
          </span>
        </div>

        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
            Receita Recuperada com Automação
          </span>
          <strong className="text-[24px] font-extrabold text-emerald-600 block mt-2">
            {formatBrl(totalRecovered)}
          </strong>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
            ↑ 38,4% taxa de conversão do fluxo
          </span>
        </div>

        <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
            Canal Mais Eficiente
          </span>
          <strong className="text-[24px] font-extrabold text-slate-900 block mt-2">
            WhatsApp Direct (74%)
          </strong>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
            Tempo médio de resposta: 14 minutos
          </span>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <DataTable headers={headers} empty={carts.length === 0}>
        {carts.map((cart) => (
          <tr key={cart.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3.5 px-4">
              <strong className="block text-sm font-bold text-[#0E1726]">{cart.buyerName}</strong>
              <span className="text-[11px] text-[#718096]">{cart.buyerPhone} • {cart.buyerEmail}</span>
            </td>

            <td className="py-3.5 px-4">
              <span className="text-xs font-semibold text-slate-800 block">{cart.eventName}</span>
              <span className="text-[11px] text-slate-500">{cart.batchName} ({cart.ticketCount}x)</span>
            </td>

            <td className="py-3.5 px-4 text-right">
              <span className="block text-xs font-extrabold text-slate-900">{formatBrl(cart.totalValue)}</span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <span className="text-[11px] font-semibold text-slate-500">{cart.abandonedAt}</span>
            </td>

            <td className="py-3.5 px-4 text-center">
              <Badge variant={cart.status === 'recovered' ? 'success' : cart.status === 'in_recovery' ? 'warning' : 'danger'}>
                {cart.status === 'recovered' ? 'Recuperado' : cart.status === 'in_recovery' ? 'Em Recuperação' : 'Abandonado'}
              </Badge>
            </td>

            <td className="py-3.5 pr-4 pl-2 text-right">
              <div className="flex items-center justify-end gap-1.5">
                {cart.status !== 'recovered' && (
                  <>
                    <button
                      onClick={() => handleRecoverViaWhatsApp(cart)}
                      className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold transition"
                      title="Enviar WhatsApp"
                    >
                      <MessageCircle size={13} />
                      Zap
                    </button>
                    <button
                      onClick={() => handleRecoverViaEmail(cart)}
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded text-xs font-bold transition"
                      title="Enviar E-mail"
                    >
                      <Mail size={13} />
                      E-mail
                    </button>
                    <button
                      onClick={() => handleMarkAsRecovered(cart.id)}
                      className="flex items-center gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded text-xs font-semibold transition"
                      title="Marcar como Pago"
                    >
                      <CheckCircle2 size={13} />
                    </button>
                  </>
                )}
                {cart.status === 'recovered' && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Venda Concluída
                  </span>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
};
