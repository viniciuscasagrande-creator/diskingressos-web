import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type KpiAccent = 'green' | 'blue' | 'cyan' | 'orange' | 'purple' | 'red' | 'slate';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  note?: string;
  accent?: KpiAccent;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendDirection = 'up',
  note,
  accent = 'blue',
  className = '',
}) => {
  const accentStyles = {
    green: { bg: 'bg-emerald-50 text-[#10B981]', border: 'bg-[#10B981]' },
    blue: { bg: 'bg-blue-50 text-[#1677FF]', border: 'bg-[#1677FF]' },
    cyan: { bg: 'bg-cyan-50 text-[#06B6D4]', border: 'bg-[#06B6D4]' },
    orange: { bg: 'bg-orange-50 text-[#F97316]', border: 'bg-[#F97316]' },
    purple: { bg: 'bg-purple-50 text-[#7C3AED]', border: 'bg-[#7C3AED]' },
    red: { bg: 'bg-rose-50 text-[#EF4444]', border: 'bg-[#EF4444]' },
    slate: { bg: 'bg-slate-100 text-[#64748B]', border: 'bg-[#64748B]' },
  }[accent];

  return (
    <div className={`rounded-card border border-[#E2E8F0] bg-white p-4 sm:p-5 shadow-card transition-all duration-200 hover:shadow-cardHover hover:-translate-y-[1px] flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
          {label}
        </span>
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg p-1.5 shrink-0 ${accentStyles.bg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <strong className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[#0E1726] block leading-tight">
          {value}
        </strong>

        {trend && (
          <div className="mt-1.5 flex items-center gap-1 text-[12px] font-semibold">
            {trendDirection === 'up' && (
              <span className="text-[#10B981] flex items-center gap-1">
                <TrendingUp size={13} />
                {trend}
              </span>
            )}
            {trendDirection === 'down' && (
              <span className="text-[#EF4444] flex items-center gap-1">
                <TrendingDown size={13} />
                {trend}
              </span>
            )}
            {trendDirection === 'neutral' && (
              <span className="text-[#64748B]">{trend}</span>
            )}
            {note && <span className="text-[#718096] font-normal text-[11px] ml-1">{note}</span>}
          </div>
        )}

        {!trend && note && (
          <span className="mt-1 block text-[11px] text-[#718096] font-medium">
            {note}
          </span>
        )}
      </div>
    </div>
  );
};
