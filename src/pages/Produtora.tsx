import React from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, CheckCircle, Edit, FileText } from 'lucide-react';
import type { Producer } from '../types/producer';

interface ProdutoraPageProps {
  selectedProducer: Producer;
}

export const ProdutoraPage: React.FC<ProdutoraPageProps> = ({ selectedProducer }) => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">
          CADASTRO INSTITUCIONAL
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Dados da Produtora
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Informações cadastrais, documentação fiscal e conta bancária para repasses automáticos.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedProducer.avatarColor} text-2xl font-black text-white shadow-md`}>
              {selectedProducer.logoInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{selectedProducer.name}</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verificada
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedProducer.legalName}</p>
            </div>
          </div>

          <button 
            onClick={() => alert('Edição de dados da produtora habilitada.')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit size={14} />
            Editar Dados
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Dados Jurídicos</h3>
            <div>
              <span className="text-slate-500 block">CNPJ</span>
              <span className="font-bold text-slate-800 font-mono text-sm">{selectedProducer.cnpj}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Inscrição Estadual</span>
              <span className="font-bold text-slate-800">90.412.839-01 (PR)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Endereço da Sede</span>
              <span className="font-semibold text-slate-800">Av. Cândido de Abreu, 526 - Centro Cívico, Curitiba - PR</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Conta Bancária Principal</h3>
            <div>
              <span className="text-slate-500 block">Banco</span>
              <span className="font-bold text-slate-800">341 — Banco Itaú Unibanco S.A.</span>
            </div>
            <div>
              <span className="text-slate-500 block">Agência / Conta Corrente</span>
              <span className="font-mono font-bold text-slate-800">Ag: 0914 | C/C: 48201-9</span>
            </div>
            <div>
              <span className="text-slate-500 block">Chave Pix de Repasse</span>
              <span className="font-mono font-bold text-emerald-600">{selectedProducer.cnpj}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
