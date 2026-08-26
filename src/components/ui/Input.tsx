import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={generatedId} className="text-[12px] font-bold text-slate-700 select-none">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0">
            {icon}
          </span>
        )}

        <input
          id={generatedId}
          className={`h-[42px] rounded-input border bg-white px-3.5 text-[14px] text-[#0E1726] placeholder:text-slate-400 transition-all duration-150 outline-none ${
            error
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : 'border-[#CBD5E1] focus:border-[#1677FF] focus:shadow-[0_0_0_3px_rgba(22,119,255,0.10)]'
          } ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${
            icon && iconPosition === 'right' ? 'pr-10' : ''
          } ${fullWidth ? 'w-full' : ''} ${className}`}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <span className="absolute right-3.5 text-slate-400 pointer-events-none shrink-0">
            {icon}
          </span>
        )}
      </div>

      {error && <span className="text-[11px] font-semibold text-[#EF4444]">{error}</span>}
      {!error && helperText && <span className="text-[11px] text-[#718096]">{helperText}</span>}
    </div>
  );
};
