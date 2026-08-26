import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`rounded-card border border-dashed border-[#CBD5E1] bg-white p-10 text-center flex flex-col items-center justify-center ${className}`}>
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#64748B] mb-3.5 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-[16px] font-bold text-[#0E1726]">{title}</h3>
      {description && (
        <p className="text-[13px] text-[#718096] max-w-md mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
