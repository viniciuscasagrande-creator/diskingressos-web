import React from 'react';
import { 
  Smartphone, MessageCircle, RefreshCcw, LockKeyhole, 
  ShieldCheck, Crown, Tag, Gift, Sliders, Layers, 
  CheckCircle, Plus, Sparkles, ExternalLink
} from 'lucide-react';
import type { NavigationPage } from '../types/producer';

interface GenericModulePageProps {
  page: NavigationPage;
  onNavigateToEvents: () => void;
}

export const GenericModulePage: React.FC<GenericModulePageProps> = ({ page, onNavigateToEvents }) => {
  const getPageDetails = () => {
    switch (page) {
      case 'terminais-pos':
        return {
          category: 'PONTOS DE VENDA FÍSICOS',
          title: 'Terminais POS & Bilheteria Presencial',
          description: 'Gestão de maquininhas DiskIngressos POS para venda de ingressos na bilheteria do local e pontos credenciados.',
          icon: Smartphone,
          badge: '5 Terminais Ativos',
          color: 'blue'
        };
      case 'atendimento':
        return {
          category: 'SUPORTE AO CLIENTE',
          title: 'Atendimento / SAC DiskIngressos',
          description: 'Acompanhe chamados de participantes, dúvidas sobre meia-entrada, cancelamentos e estornos.',
          icon: MessageCircle,
          badge: '98% Satisfação',
          color: 'emerald'
        };
      case 'remarketing':
        return {
          category: 'RECUPERAÇÃO DE VENDAS',
          title: 'Campanhas de Remarketing & Carrinho Abandonado',
          description: 'Disparos automáticos via WhatsApp e E-mail para clientes que iniciaram compra e não finalizaram.',
          icon: RefreshCcw,
          badge: 'R$ 48.900 Recuperados',
          color: 'purple'
        };
      case 'gerenciar-acessos':
        return {
          category: 'SEGURANÇA & EQUIPE',
          title: 'Gerenciar Acessos & Operadores',
          description: 'Controle quais membros da produtora podem ver relatórios, editar eventos ou operar o check-in.',
          icon: LockKeyhole,
          badge: '4 Operadores',
          color: 'slate'
        };
      case 'administracao':
        return {
          category: 'GESTÃO CENTRAL',
          title: 'Painel de Administração do Sistema',
          description: 'Configurações de taxas, contratos de exclusividade, logs de auditoria e credenciais da API.',
          icon: ShieldCheck,
          badge: 'Nível Master',
          color: 'slate'
        };
      case 'clube-beneficios':
        return {
          category: 'FIDELIDADE & PARCERIAS',
          title: 'Clube Rua da Música / Benefícios',
          description: 'Parcerias com Clube Gazeta do Povo, Curitiba Cult e descontos exclusivos para associados.',
          icon: Crown,
          badge: 'Programa VIP Ativo',
          color: 'amber'
        };
      case 'cupons':
        return {
          category: 'PROMOÇÕES',
          title: 'Gestão de Cupons de Desconto',
          description: 'Crie cupons promocionais percentuais ou nominais com limite de uso por CPF.',
          icon: Tag,
          badge: '12 Cupons Ativos',
          color: 'blue'
        };
      case 'cortesias':
        return {
          category: 'INGRESSOS ESPECIAIS',
          title: 'Emissão & Gestão de Cortesias',
          description: 'Emita lotes de cortesia nominal para patrocinadores, imprensa, convidados VIP e artistas.',
          icon: Gift,
          badge: '734 Emitidas',
          color: 'purple'
        };
      default:
        return {
          category: 'MÓDULO DE GESTÃO',
          title: 'Módulo Operacional',
          description: 'Configurações avançadas do sistema DiskIngressos.',
          icon: Sparkles,
          badge: 'Ativo',
          color: 'blue'
        };
    }
  };

  const details = getPageDetails();
  const IconComponent = details.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-500">
            {details.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            {details.title}
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            {details.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            {details.badge}
          </span>
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs text-center flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-sm">
          <IconComponent size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{details.title}</h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Este módulo está totalmente integrado com a infraestrutura DiskIngressos e seus eventos ativos.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => alert(`Ação disparada no módulo ${details.title}`)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
          >
            Adicionar Novo Registro
          </button>
          <button
            onClick={onNavigateToEvents}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Voltar para Todos os Eventos
          </button>
        </div>
      </div>
    </div>
  );
};
