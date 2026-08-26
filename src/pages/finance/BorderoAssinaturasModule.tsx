import React, { useState } from 'react';
import { ArrowLeft, FileCheck, Download, CheckCircle2, Shield, Printer, LockKeyhole, FileSpreadsheet } from 'lucide-react';
import type { EventItem } from '../../types/event';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';

interface BorderoAssinaturasModuleProps {
  events: EventItem[];
  onBack: () => void;
}

export const BorderoAssinaturasModule: React.FC<BorderoAssinaturasModuleProps> = ({ events, onBack }) => {
  const [selectedEventId, setSelectedEventId] = useState<number>(events[0]?.id || 1);
  const [isSigned, setIsSigned] = useState(false);

  const activeEvent = events.find(e => e.id === selectedEventId) || events[0];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const grossRevenue = activeEvent.totalRevenue || 148750.00;
  const issTax = grossRevenue * 0.05; // 5% ISS
  const diskFee = grossRevenue * 0.08; // 8% DiskIngressos
  const paymentGateway = grossRevenue * 0.025; // 2.5% Gateway
  const netPayable = grossRevenue - issTax - diskFee - paymentGateway;

  const handleSign = () => {
    setIsSigned(true);
    alert(`Borderô #${activeEvent.code} assinado digitalmente com sucesso!\nHash SHA-256 gerado e arquivado.`);
  };

  return (
    <div className="w-full space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-[#1677FF] hover:underline"
      >
        <ArrowLeft size={16} />
        Voltar para o Hub Financeiro
      </button>

      <PageHeader
        eyebrow="SIMULADORES, MÉTODOS & LIQUIDAÇÕES"
        title="Borderô Oficial & Assinatura Digital"
        subtitle="Fechamento fiscal e contábil com cálculo de impostos municipais e liquidação oficial."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => alert('Download do borderô oficial em formato PDF.')}
              icon={<Download size={15} />}
            >
              Exportar PDF Oficial
            </Button>
            <Button
              variant="primary"
              disabled={isSigned}
              onClick={handleSign}
              icon={<CheckCircle2 size={16} />}
            >
              {isSigned ? 'Borderô Assinado' : 'Assinar Digitalmente'}
            </Button>
          </div>
        }
      />

      {/* Event Picker */}
      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Evento Selecionado para Fechamento
          </span>
          <strong className="text-[16px] font-bold text-[#0E1726]">
            {activeEvent.title}
          </strong>
        </div>

        <div className="min-w-[280px]">
          <Select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(Number(e.target.value));
              setIsSigned(false);
            }}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                #{e.code} — {e.title}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Official Bordero Document Preview */}
      <Card padding="lg" className="border-2 border-slate-300 shadow-md font-sans space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-black text-slate-900">DiskIngressos</span>
              <span className="rounded bg-slate-900 text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                BORDERÔ OFICIAL DE FECHAMENTO
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">Disk Ingressos Entretenimento S/A • CNPJ 07.410.892/0001-33</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Borderô Documento nº</span>
            <strong className="font-mono text-sm font-black text-slate-900">#BORD-2026-{activeEvent.code}</strong>
          </div>
        </div>

        {/* Event Details Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-btn bg-[#F8FAFC] border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Evento</span>
            <strong className="text-slate-900 font-bold block truncate">{activeEvent.title}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Local</span>
            <strong className="text-slate-900 font-bold block">{activeEvent.venue}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Data da Realização</span>
            <strong className="text-slate-900 font-bold block">{activeEvent.date}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Produtora</span>
            <strong className="text-slate-900 font-bold block">{activeEvent.producerName || 'Live Entretenimento'}</strong>
          </div>
        </div>

        {/* Batches Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Demonstrativo de Ingressos & Arrecadação
          </h3>
          <div className="overflow-x-auto rounded-btn border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Setor / Categoria</th>
                  <th className="py-2.5 px-3 text-center">Emitidos</th>
                  <th className="py-2.5 px-3 text-center">Vendidos</th>
                  <th className="py-2.5 px-3 text-right">Valor Unitário</th>
                  <th className="py-2.5 px-3 text-right">Subtotal Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {(activeEvent.batches || []).map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 px-3 font-bold">{b.name}</td>
                    <td className="py-2 px-3 text-center">{b.totalQuantity || b.qty || 0}</td>
                    <td className="py-2 px-3 text-center font-bold text-[#1677FF]">{b.soldQuantity || b.sold || 0}</td>
                    <td className="py-2 px-3 text-right">R$ {b.price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      {formatCurrency((b.soldQuantity || b.sold || 0) * b.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deductions & Financial Net Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Deductions List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Retenções Tributárias & Taxas Contratuais
            </h3>
            <div className="space-y-2 text-xs border border-slate-200 rounded-btn p-3 bg-slate-50">
              <div className="flex items-center justify-between text-slate-700">
                <span>Imposto Sobre Serviços (ISS Municipal - 5.0%)</span>
                <strong className="text-[#EF4444]">- {formatCurrency(issTax)}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Comissão Operacional DiskIngressos (8.0%)</span>
                <strong className="text-[#EF4444]">- {formatCurrency(diskFee)}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Taxa de Processamento TEF / Adquirente (2.5%)</span>
                <strong className="text-[#EF4444]">- {formatCurrency(paymentGateway)}</strong>
              </div>
            </div>
          </div>

          {/* Final Net Calculation */}
          <div className="p-4 rounded-btn bg-[#DCFCE7] border border-[#15803D]/30 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#15803D] block">
                3. Total Líquido a Liquidar à Produtora
              </span>
              <strong className="text-[26px] font-black text-[#15803D] block mt-1">
                {formatCurrency(netPayable)}
              </strong>
            </div>

            <div className="text-xs text-emerald-800 mt-4 pt-3 border-t border-emerald-300/60 flex items-center justify-between">
              <span>Status Fiscal:</span>
              <span className="font-bold">Aprovado pelo Departamento Contábil</span>
            </div>
          </div>
        </div>

        {/* Digital Signature Footer */}
        <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#10B981]" />
            <div>
              <span className="font-bold block text-slate-800">Autenticidade e Assinatura Digital</span>
              <span className="font-mono text-[10px] text-slate-400">
                HASH: sha256-8a901f4c78d02e89b41a7f01c900e234bc89f001
              </span>
            </div>
          </div>

          <Badge status={isSigned ? 'confirmado' : 'pendente'}>
            {isSigned ? 'Assinado Digitalmente' : 'Aguardando Assinatura'}
          </Badge>
        </div>
      </Card>
    </div>
  );
};
