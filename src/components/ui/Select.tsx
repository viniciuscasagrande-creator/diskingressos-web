import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  children,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={generatedId} className="text-[12px] font-bold text-slate-700 select-none">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={generatedId}
          className={`h-[42px] rounded-input border bg-white pl-3.5 pr-9 text-[14px] text-[#0E1726] transition-all duration-150 outline-none appearance-none cursor-pointer ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : 'border-[#CBD5E1] focus:border-[#1677FF] focus:shadow-[0_0_0_3px_rgba(22,119,255,0.10)]'
          } ${fullWidth ? 'w-full' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>

        <span className="absolute right-3 text-slate-400 pointer-events-none">
          <ChevronDown size={16} />
        </span>
      </div>

      {error && <span className="text-[11px] font-semibold text-[#EF4444]">{error}</span>}
      {!error && helperText && <span className="text-[11px] text-[#718096]">{helperText}</span>}
    </div>
  );
};
