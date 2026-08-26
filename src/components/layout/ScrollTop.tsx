import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed right-6 bottom-16 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#1887AA] text-white shadow-xl hover:brightness-110 active:scale-95 transition-all duration-200"
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      <ArrowUp size={20} />
    </button>
  );
};
