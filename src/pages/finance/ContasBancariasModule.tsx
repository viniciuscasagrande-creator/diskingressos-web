import React, { useState } from 'react';
import { ArrowLeft, Building2, Plus, CheckCircle2, Trash2, Key, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

export const ContasBancariasModule: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [accounts, setAccounts] = useState([
    { id: '1', bank: 'Banco Itaú Unibanco S/A (341)', agency: '0142', account: '89410-2', type: 'Conta Corrente PJ', cnpj: '08.921.442/0001-90', pix: 'financeiro@live.com.br', isPrimary: true },
    { id: '2', bank: 'Banco Bradesco S/A (237)', agency: '2210', account: '44012-9', type: 'Conta Corrente PJ', cnpj: '08.921.442/0001-90', pix: '08.921.442/0001-90', isPrimary: false },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [bank, setBank] = useState('Banco Santander (033)');
  const [agency, setAgency] = useState('');
  const [account, setAccount] = useState('');
  const [pix, setPix] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAccounts([
      ...accounts,
      {
        id: String(Date.now()),
        bank,
        agency,
        account,
        type: 'Conta Corrente PJ',
        cnpj: '08.921.442/0001-90',
        pix,
        isPrimary: false,
      }
    ]);
    setAgency('');
    setAccount('');
    setPix('');
    setShowAdd(false);
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
        title="Contas Bancárias & Chaves Pix"
        subtitle="Gerencie as contas bancárias da pessoa jurídica (PJ) para liquidação automática dos repasses de bilheteria."
        actions={
          <Button
            variant="primary"
            onClick={() => setShowAdd(!showAdd)}
            icon={<Plus size={16} />}
          >
            Adicionar Nova Conta
          </Button>
        }
      />

      {/* Add Account Modal / Form */}
      {showAdd && (
        <Card padding="md" className="border-[#1677FF]/40 animate-in fade-in duration-150">
          <h3 className="text-[16px] font-bold text-[#0E1726] mb-3">Nova Conta Bancária PJ</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <Select label="Instituição Bancária" value={bank} onChange={e => setBank(e.target.value)}>
                <option value="Banco Santander (033)">Banco Santander (033)</option>
                <option value="Banco do Brasil (001)">Banco do Brasil (001)</option>
                <option value="Banco Inter (077)">Banco Inter (077)</option>
                <option value="BTG Pactual (208)">BTG Pactual (208)</option>
              </Select>
            </div>
            <Input label="Agência" value={agency} onChange={e => setAgency(e.target.value)} placeholder="0000" required />
            <Input label="Conta Corrente" value={account} onChange={e => setAccount(e.target.value)} placeholder="00000-0" required />
            <div className="lg:col-span-2">
              <Input label="Chave Pix Vinculada à Conta" value={pix} onChange={e => setPix(e.target.value)} placeholder="CNPJ, E-mail ou Chave Aleatória" required />
            </div>
            <div className="lg:col-span-2 flex items-end justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Salvar e Validar Conta</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {accounts.map(acc => (
          <Card key={acc.id} padding="md" className={`flex flex-col justify-between ${acc.isPrimary ? 'border-[#10B981] bg-emerald-50/20' : ''}`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-white text-slate-900">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0E1726]">{acc.bank}</h3>
                    <span className="text-[12px] text-[#718096]">{acc.type}</span>
                  </div>
                </div>
                {acc.isPrimary ? (
                  <Badge status="ativo">Conta Principal</Badge>
                ) : (
                  <Badge status="inativo">Secundária</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#EDF0F4] text-xs">
                <div className="p-2 bg-white rounded border border-[#E2E8F0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Agência</span>
                  <strong className="text-slate-900 font-bold">{acc.agency}</strong>
                </div>
                <div className="p-2 bg-white rounded border border-[#E2E8F0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Conta Corrente</span>
                  <strong className="text-slate-900 font-bold">{acc.account}</strong>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-white rounded border border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[#64748B] flex items-center gap-1">
                  <Key size={13} className="text-[#1677FF]" /> Chave Pix:
                </span>
                <strong className="font-mono text-slate-800">{acc.pix}</strong>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EDF0F4] flex items-center justify-between text-xs">
              <span className="text-[#10B981] font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Titularidade Validada
              </span>
              {!acc.isPrimary && (
                <button
                  onClick={() => setAccounts(accounts.map(a => ({ ...a, isPrimary: a.id === acc.id })))}
                  className="text-[#1677FF] font-bold hover:underline"
                >
                  Tornar Principal
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
