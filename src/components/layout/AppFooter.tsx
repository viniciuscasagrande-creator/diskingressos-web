import React from 'react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="w-full min-h-[56px] bg-white border-t border-[#CBD5E1]/70 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px] text-[#1E293B] select-none">
      <div className="flex items-center gap-1.5 font-medium">
        <span>© 2026</span>
        <strong className="text-[#1677FF] font-bold">DiskIngressos</strong>
        <span className="text-[#64748B] text-[12px] ml-2 hidden sm:inline">• Todos os direitos reservados</span>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
        <span>Versão</span>
        <strong className="text-[#1677FF] font-bold">0.12.0</strong>
        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] ml-1" title="Ambiente de Produção Conectado" />
      </div>
    </footer>
  );
};
