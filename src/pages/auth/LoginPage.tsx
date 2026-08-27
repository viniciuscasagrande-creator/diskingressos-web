import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, KeyRound, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@diskingressos.com.br');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = login(email, password);
    if (!success) {
      setError('Credenciais inválidas ou conta desativada.');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string = 'Admin@123') => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    login(demoEmail, demoPass);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#222A36] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Background Decor Ambient */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#1677FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Box */}
      <div className="w-full max-w-[460px] bg-white rounded-card border border-[#E2E8F0] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="pt-8 pb-4 text-center px-6">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-btn bg-[#1677FF] text-white shadow-md">
              <span className="font-extrabold text-[20px] tracking-tight">Di</span>
            </div>
            <span className="text-[26px] font-black tracking-tight text-[#0E1726]">
              DiskIngressos
            </span>
          </div>
          <h2 className="text-[17px] font-bold text-[#0E1726] mt-4">
            Acesse sua conta
          </h2>
          <p className="text-[12px] text-[#718096] mt-0.5">
            Plataforma de Gestão de Eventos e Hub Financeiro Multi-Tenant
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-btn bg-[#FEE2E2] border border-[#EF4444]/30 text-[12px] font-bold text-[#991B1B]">
              {error}
            </div>
          )}

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@email.com"
                required
                className="w-full h-[44px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-[14px] font-medium text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
              />
              <Mail size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full h-[44px] rounded-input border border-[#CBD5E1] bg-[#F8FAFC] px-3.5 text-[14px] font-medium text-[#0E1726] outline-none transition focus:border-[#1677FF] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[12px]">
            <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded accent-[#1677FF]"
              />
              <span>Lembrar acesso</span>
            </label>

            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-[#1677FF] font-bold hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full h-[46px] rounded-btn bg-[#1677FF] text-white font-bold text-[14px] hover:bg-[#1366DB] active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Entrar no sistema</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </form>

        {/* Quick Role Tester Bar */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
            Acessos Rápidos de Demonstração:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => handleQuickLogin('admin@diskingressos.com.br', 'Admin@123')}
              className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-[#1677FF] hover:bg-blue-100 transition"
              title="Admin Master (Visão Global)"
            >
              👑 Admin Master
            </button>

            <button
              onClick={() => handleQuickLogin('vinicius@diskingressos.com.br', 'Produtor@123')}
              className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-[#10B981] hover:bg-emerald-100 transition"
              title="Produtor Admin (DiskIngressos)"
            >
              🏢 Vinicius (DiskIngressos)
            </button>

            <button
              onClick={() => handleQuickLogin('financeiro@fep.com.br', 'Financeiro@123')}
              className="rounded-full bg-orange-50 border border-orange-200 px-2.5 py-1 text-[11px] font-bold text-[#EA580C] hover:bg-orange-100 transition"
              title="Produtor Financeiro (FEP)"
            >
              💳 Financeiro (FEP)
            </button>

            <button
              onClick={() => handleQuickLogin('operador@prime.com.br', 'demo123456')}
              className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-bold text-[#7C3AED] hover:bg-purple-100 transition"
              title="Operador Evento"
            >
              🎫 Operador Evento
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-card p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-blue-50 text-[#1677FF]">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[#0E1726]">Recuperação de Senha</h3>
                <p className="text-[12px] text-[#718096]">Enviaremos um link de redefinição para o seu e-mail.</p>
              </div>
            </div>

            {forgotSent ? (
              <div className="p-4 rounded-btn bg-emerald-50 border border-emerald-200 text-center text-xs font-bold text-[#15803D] flex items-center justify-center gap-2">
                <Check size={16} /> Link de redefinição enviado com sucesso!
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <Input
                  label="E-mail de Cadastro"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu-email@produtora.com.br"
                  required
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setIsForgotModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    Enviar Instruções
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* System Version Footnote */}
      <div className="mt-6 text-center text-[12px] text-slate-400">
        <span>© 2026 DiskIngressos • Plataforma Multi-Tenant • Versão 0.12.0</span>
      </div>
    </div>
  );
};
