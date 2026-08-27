import React from 'react';
import { 
  Building2, ShieldCheck, UserCog, ScrollText, LockKeyhole, 
  ArrowRight, Shield, KeyRound, Sliders, Users, FileText
} from 'lucide-react';
import type { NavigationPage } from '../../types/producer';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

interface AdminHubPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AdminHubPage: React.FC<AdminHubPageProps> = ({ onNavigate }) => {
  const cards = [
    {
      key: 'gerenciar-usuarios' as NavigationPage,
      title: 'Usuários e Acessos',
      subtitle: 'Controle de contas & vínculos',
      desc: 'Crie usuários, vincule produtoras, defina perfis de acesso e controle o status das contas.',
      icon: UserCog,
      badge: 'Multi-Tenant',
      accent: 'blue',
    },
    {
      key: 'admin-producers' as NavigationPage,
      title: 'Produtoras Cadastradas',
      subtitle: 'Organizações e Tenants PJ',
      desc: 'Cadastre novas produtoras, consulte CNPJ/documento e acompanhe a situação de cada conta.',
      icon: Building2,
      badge: 'Isolamento de Dados',
      accent: 'green',
    },
    {
      key: 'admin-permissions' as NavigationPage,
      title: 'Perfis e Permissões (RBAC)',
      subtitle: 'Matriz Granular de Acesso',
      desc: 'Configure o que cada perfil de usuário pode visualizar, criar, editar e excluir em cada módulo.',
      icon: ShieldCheck,
      badge: 'Matriz Visual',
      accent: 'orange',
    },
    {
      key: 'logs-auditoria' as NavigationPage,
      title: 'Logs de Auditoria & Compliance',
      subtitle: 'Rastreabilidade Operacional',
      desc: 'Rastreie operações sensíveis, repasses, fechamentos e acessos com registro de IP e data/hora.',
      icon: ScrollText,
      badge: 'Trilha Imutável',
      accent: 'purple',
    },
    {
      key: 'admin-security' as NavigationPage,
      title: 'Configurações de Segurança',
      subtitle: 'Políticas Globais de Proteção',
      desc: 'Defina regras de senha forte, MFA para administradores, tempo de expiração de sessão e bloqueio.',
      icon: LockKeyhole,
      badge: 'Proteção Global',
      accent: 'cyan',
    },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow="GOVERNANÇA & SEGURANÇA"
        title="Central Administrativa"
        subtitle="Gerencie a estrutura organizacional, acessos, permissões e segurança do ambiente multi-produtor."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="group relative flex flex-col justify-between rounded-card border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#1677FF] hover:shadow-card cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-btn bg-[#EFF6FF] text-[#1677FF] transition group-hover:scale-105">
                    <Icon size={24} />
                  </div>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-[17px] font-bold text-[#0E1726] group-hover:text-[#1677FF] transition-colors">
                  {card.title}
                </h3>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mt-0.5">
                  {card.subtitle}
                </span>

                <p className="text-[12px] text-[#718096] mt-2.5 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#EDF0F4] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B] font-semibold">
                  Acessar Módulo
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-[#1677FF] group-hover:underline">
                  Configurar <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
