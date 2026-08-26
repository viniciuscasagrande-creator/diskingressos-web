import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'context' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Height & padding classes based on size
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-xs gap-2', // Standard 40px height as per design system
    lg: 'h-11 px-5 text-sm gap-2.5',
  }[size];

  // Variant color & border styles
  const variantClasses = {
    primary: 'bg-[#1677FF] hover:bg-[#0F6DE8] text-white border border-[#1677FF] shadow-sm font-bold active:scale-[0.98]',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-[#CBD5E1] shadow-xs font-semibold active:scale-[0.98]',
    context: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent font-medium p-1.5 sm:px-2.5',
    danger: 'bg-[#EF4444] hover:bg-rose-600 text-white border border-[#EF4444] shadow-sm font-bold active:scale-[0.98]',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-btn transition-all duration-150 select-none ${sizeClasses} ${variantClasses} ${
        fullWidth ? 'w-full' : ''
      } ${disabled || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
