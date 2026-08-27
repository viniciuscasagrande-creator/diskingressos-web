import React, { useState } from 'react';
import { LockKeyhole, TimerReset, ShieldAlert, KeyRound, Shield, Check, Save } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface SecurityPageProps {
  notify?: (msg: string) => void;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ notify }) => {
  const [strongPassword, setStrongPassword] = useState(true);
  const [requireMfa, setRequireMfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [autoLock, setAutoLock] = useState(true);
  const [auditCritical, setAuditCritical] = useState(true);

  const handleSave = () => {
    if (notify) notify('Políticas de segurança globais salvas com sucesso!');
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="PROTEÇÃO DA PLATAFORMA"
        title="Configurações de Segurança"
        subtitle="Políticas corporativas de autenticação, expiração de sessão, MFA e rastreabilidade."
        actions={
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<Save size={16} />}
          >
            Salvar Políticas
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Autenticação */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 border-b border-[#EDF0F4] pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF]">
              <KeyRound size={20} />
            </div>
            <div>
              <strong className="block text-sm font-bold text-[#0E1726]">Autenticação</strong>
              <span className="text-[11px] text-[#718096]">Regras de credenciais</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start justify-between gap-3 p-2.5 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-[#0E1726]">Senha forte obrigatória</strong>
                <span className="text-[11px] text-[#718096]">Mínimo 8 caracteres, números e símbolos</span>
              </div>
              <input
                type="checkbox"
                checked={strongPassword}
                onChange={(e) => setStrongPassword(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1677FF] mt-0.5"
              />
            </label>

            <label className="flex items-start justify-between gap-3 p-2.5 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-[#0E1726]">MFA para Administradores</strong>
                <span className="text-[11px] text-[#718096]">Exigir segundo fator (TOTP/SMS) para perfis Admin</span>
              </div>
              <input
                type="checkbox"
                checked={requireMfa}
                onChange={(e) => setRequireMfa(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1677FF] mt-0.5"
              />
            </label>
          </div>
        </Card>

        {/* Card 2: Sessões */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 border-b border-[#EDF0F4] pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-orange-50 text-[#F97316]">
              <TimerReset size={20} />
            </div>
            <div>
              <strong className="block text-sm font-bold text-[#0E1726]">Sessões & Tentativas</strong>
              <span className="text-[11px] text-[#718096]">Tempo de vida e bloqueios</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-2.5 rounded">
              <label className="block text-xs font-bold text-[#0E1726] mb-1">
                Expiração de sessão (minutos de inatividade)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full h-[38px] rounded border border-[#CBD5E1] px-3 text-xs font-semibold"
              />
            </div>

            <div className="p-2.5 rounded">
              <label className="block text-xs font-bold text-[#0E1726] mb-1">
                Máximo de tentativas de login incorretas
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full h-[38px] rounded border border-[#CBD5E1] px-3 text-xs font-semibold"
              />
            </div>

            <label className="flex items-start justify-between gap-3 p-2.5 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-[#0E1726]">Bloqueio automático temporário</strong>
                <span className="text-[11px] text-[#718096]">Suspender conta por 15min após exceder tentativas</span>
              </div>
              <input
                type="checkbox"
                checked={autoLock}
                onChange={(e) => setAutoLock(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1677FF] mt-0.5"
              />
            </label>
          </div>
        </Card>

        {/* Card 3: Auditoria & Isolamento */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 border-b border-[#EDF0F4] pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-emerald-50 text-[#10B981]">
              <ShieldAlert size={20} />
            </div>
            <div>
              <strong className="block text-sm font-bold text-[#0E1726]">Auditoria & Multi-Tenant</strong>
              <span className="text-[11px] text-[#718096]">Rastreabilidade & Isolamento</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start justify-between gap-3 p-2.5 rounded hover:bg-slate-50 cursor-pointer">
              <div>
                <strong className="block text-xs font-bold text-[#0E1726]">Registrar operações críticas</strong>
                <span className="text-[11px] text-[#718096]">Gravar IP, data/hora e operador em repasses e lotes</span>
              </div>
              <input
                type="checkbox"
                checked={auditCritical}
                onChange={(e) => setAuditCritical(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1677FF] mt-0.5"
              />
            </label>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-btn text-xs text-blue-900 flex items-start gap-2.5">
              <LockKeyhole size={18} className="text-[#1677FF] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                O <strong>producer_id</strong> é injetado a partir da sessão autenticada no backend, impedindo que requisições adulteradas acessem dados de outras produtoras.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
