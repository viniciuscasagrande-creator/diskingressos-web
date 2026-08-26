import React from 'react';

interface DataTableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  children,
  empty = false,
  emptyMessage = 'Nenhum registro encontrado.',
  className = '',
}) => {
  return (
    <div className={`overflow-hidden rounded-card border border-[#E2E8F0] bg-white shadow-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#EDF0F4] bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider select-none">
              {headers.map((header, idx) => (
                <th key={idx} className="py-3.5 px-4 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF0F4] font-medium text-[#0E1726]">
            {empty ? (
              <tr>
                <td colSpan={headers.length} className="py-12 text-center text-[#718096]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
