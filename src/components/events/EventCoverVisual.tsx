import React from 'react';
import type { EventItem } from '../../types/event';
import { Music, Mic2, Sparkles, Flame, TreePine, BookOpen, Radio } from 'lucide-react';

interface EventCoverVisualProps {
  event: EventItem;
  className?: string;
  horizontal?: boolean;
}

export const EventCoverVisual: React.FC<EventCoverVisualProps> = ({
  event,
  className = '',
  horizontal = false,
}) => {
  // Render styling based on coverType
  const getCoverStyles = () => {
    const coverType = event.coverType || event.cover || 'festival';
    switch (coverType) {
      case 'nature':
        return {
          bg: 'bg-gradient-to-b from-[#2d472c] via-[#4d6938] to-[#1e301b]',
          pattern: (
            <div className="absolute inset-0 opacity-40 mix-blend-overlay">
              <div className="absolute top-4 left-4 h-24 w-24 rounded-full bg-[#a9c37b]/30 blur-xl" />
              <div className="absolute bottom-6 right-4 h-20 w-20 rounded-full bg-[#576c3a]/40 blur-lg" />
            </div>
          ),
          icon: TreePine,
          accent: 'from-emerald-400 to-green-600'
        };
      case 'maiden':
        return {
          bg: 'bg-gradient-to-br from-[#121826] via-[#3b1d16] to-[#0a0d14]',
          pattern: (
            <div className="absolute inset-0 opacity-50">
              <div className="absolute top-6 left-8 h-28 w-28 rounded-full bg-amber-500/25 blur-2xl" />
              <div className="absolute bottom-4 right-6 h-24 w-24 rounded-full bg-rose-600/30 blur-xl" />
            </div>
          ),
          icon: Flame,
          accent: 'from-amber-400 to-rose-600'
        };
      case 'conference':
      case 'conference2':
        return {
          bg: 'bg-gradient-to-b from-[#1e6f9f] via-[#c6895d] to-[#8a4e32]',
          pattern: (
            <div className="absolute inset-0 opacity-45 mix-blend-soft-light">
              <div className="absolute top-3 right-4 h-32 w-32 rounded-full bg-sky-300/30 blur-2xl" />
            </div>
          ),
          icon: BookOpen,
          accent: 'from-sky-300 to-amber-500'
        };
      case 'festival':
        return {
          bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#831843]',
          pattern: (
            <div className="absolute inset-0 opacity-60">
              <div className="absolute top-4 right-4 h-24 w-24 rounded-full bg-pink-500/30 blur-xl" />
              <div className="absolute bottom-2 left-3 h-20 w-20 rounded-full bg-indigo-400/30 blur-lg" />
            </div>
          ),
          icon: Music,
          accent: 'from-purple-400 to-pink-500'
        };
      case 'standup':
        return {
          bg: 'bg-gradient-to-tr from-[#18181b] via-[#27272a] to-[#3f3f46]',
          pattern: (
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-6 left-1/3 h-20 w-20 rounded-full bg-yellow-500/20 blur-xl" />
            </div>
          ),
          icon: Mic2,
          accent: 'from-amber-400 to-yellow-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]',
          pattern: null,
          icon: Radio,
          accent: 'from-blue-400 to-cyan-500'
        };
    }
  };

  const cover = getCoverStyles();
  const IconComponent = cover.icon;
  const coverType = event.coverType || event.cover || 'festival';

  return (
    <div className={`relative overflow-hidden ${cover.bg} ${className}`}>
      {/* Background patterns */}
      {cover.pattern}

      {/* Dark gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />

      {/* Top Left Badge */}
      {event.badge && (
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1 rounded bg-[#ff6d00] px-2 py-0.8 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
            <Sparkles size={10} />
            {event.badge}
          </span>
        </div>
      )}

      {/* Top Right Category Pill */}
      <div className="absolute top-3 right-3 z-20">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-slate-200 border border-white/10">
          <IconComponent size={11} />
          {event.category}
        </span>
      </div>

      {/* Event Title & Subtitle Overlay in Card Cover */}
      <div className="absolute left-3.5 right-3.5 bottom-11 z-20 text-white">
        {coverType.startsWith('conference') ? (
          <div>
            <strong className="block text-sm font-extrabold italic tracking-tight drop-shadow-md">
              O Espiritismo
            </strong>
            <span className="block text-[11px] text-slate-200 font-medium drop-shadow-sm">
              Luz em nossas vidas.
            </span>
          </div>
        ) : coverType === 'nature' ? (
          <div>
            <strong className="block text-sm font-extrabold italic tracking-tight drop-shadow-md">
              Música e natureza
            </strong>
            <span className="block text-[11px] text-slate-200 font-medium drop-shadow-sm">
              fazendo arte.
            </span>
          </div>
        ) : coverType === 'maiden' ? (
          <div>
            <strong className="block text-sm font-extrabold uppercase tracking-tight text-amber-300 drop-shadow-md">
              IRON MAIDEN SYMPHONIC
            </strong>
            <span className="block text-[10px] font-bold tracking-widest text-slate-300 uppercase drop-shadow-sm">
              THE BEAST EXPERIENCE
            </span>
          </div>
        ) : (
          <div>
            <strong className="block text-xs font-bold line-clamp-1 text-slate-100 drop-shadow-md">
              {event.title}
            </strong>
            {event.subtitle && (
              <span className="block text-[10px] text-slate-300 line-clamp-1 drop-shadow-sm">
                {event.subtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Event ID Badge on Bottom Left of Cover */}
      <div className="absolute bottom-2.5 left-3.5 z-20">
        <span className="inline-flex items-center rounded-md bg-[#0f172a]/90 backdrop-blur-md px-2 py-0.5 font-mono text-[11px] font-black text-slate-100 border border-slate-700 shadow-sm">
          #{event.code}
        </span>
      </div>

      {/* Facial Recognition Indicator on Bottom Right of Cover if active */}
      {event.facialRecognition?.enabled && (
        <div className="absolute bottom-2.5 right-3.5 z-20">
          <span className="inline-flex items-center gap-1 rounded bg-cyan-950/80 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
            Facial {event.facialRecognition.validationRate}%
          </span>
        </div>
      )}
    </div>
  );
};
