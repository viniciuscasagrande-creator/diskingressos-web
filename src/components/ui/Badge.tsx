import React from 'react';

export type BadgeStatus = 
  | 'ativo' 
  | 'inativo' 
  | 'rascunho' 
  | 'confirmado' 
  | 'pendente' 
  | 'cancelado' 
  | 'pago' 
  | 'processando' 
  | 'presente' 
  | 'agendado' 
  | 'esgotado'
  | 'encerrado'
  | 'aprovado'
  | 'nao-cadastrado';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'cyan';

interface BadgeProps {
  children?: React.ReactNode;
  status?: BadgeStatus | string;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  variant,
  dot = true,
  className = '',
}) => {
  // Normalize status text
  const normalized = (status || '').toLowerCase().trim();

  const getStyles = () => {
    if (variant) {
      switch (variant) {
        case 'success':
          return { bg: 'bg-[#DCFCE7] text-[#15803D]', dot: 'bg-[#15803D]' };
        case 'warning':
          return { bg: 'bg-[#FFF7ED] text-[#C2410C]', dot: 'bg-[#C2410C]' };
        case 'danger':
          return { bg: 'bg-[#FEE2E2] text-[#991B1B]', dot: 'bg-[#991B1B]' };
        case 'info':
          return { bg: 'bg-[#E0F2FE] text-[#0369A1]', dot: 'bg-[#0369A1]' };
        case 'cyan':
          return { bg: 'bg-[#ECFEFF] text-[#0E7490]', dot: 'bg-[#06B6D4]' };
        case 'purple':
          return { bg: 'bg-[#F3E8FF] text-[#6B21A8]', dot: 'bg-[#7C3AED]' };
        default:
          return { bg: 'bg-[#EEF2F7] text-[#64748B]', dot: 'bg-[#64748B]' };
      }
    }

    switch (normalized) {
      case 'ativo':
      case 'confirmado':
      case 'pago':
      case 'presente':
      case 'aprovado':
        return { bg: 'bg-[#DCFCE7] text-[#15803D]', dot: 'bg-[#15803D]', label: status || 'Ativo' };
      case 'rascunho':
      case 'pendente':
      case 'agendado':
        return { bg: 'bg-[#FFF7ED] text-[#C2410C]', dot: 'bg-[#C2410C]', label: status || 'Pendente' };
      case 'cancelado':
      case 'esgotado':
        return { bg: 'bg-[#FEE2E2] text-[#991B1B]', dot: 'bg-[#991B1B]', label: status || 'Cancelado' };
      case 'processando':
        return { bg: 'bg-[#E0F2FE] text-[#0369A1]', dot: 'bg-[#0369A1]', label: 'Processando' };
      case 'inativo':
      case 'encerrado':
      case 'nao-cadastrado':
      default:
        return { 
          bg: 'bg-[#EEF2F7] text-[#64748B]', 
          dot: 'bg-[#64748B]', 
          label: normalized === 'nao-cadastrado' ? 'Não Cadastrado' : status || 'Inativo' 
        };
    }
  };

  const current = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider select-none ${current.bg} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${current.dot}`} />}
      <span>{children || current.label || status}</span>
    </span>
  );
};
