import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Building, 
  Info, 
  Trash2, 
  Quote as QuoteIcon
} from 'lucide-react';
import { Book, AmbientSoundMode } from '../types';
import { BookCover } from './BookCover';
import { audioEngine } from '../utils/audioEngine';

interface CompactShowcaseProps {
  book: Book | null;
  onOpenDetailModal: (book: Book) => void;
  onRequestDelete: (book: Book) => void;
  isLatestAdded?: boolean;
  ambientMode?: AmbientSoundMode;
}

export const CompactShowcase: React.FC<CompactShowcaseProps> = ({
  book,
  onOpenDetailModal,
  onRequestDelete,
  ambientMode = 'off'
}) => {
  const [animating, setAnimating] = useState(false);

  // Trigger smooth highlight animation when showcased book changes
  useEffect(() => {
    if (book) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 500);
      return () => clearTimeout(t);
    }
  }, [book?.id]);

  if (!book) return null;

  const quote = book.quotes && book.quotes.length > 0 ? book.quotes[0] : null;

  // Mode-based accent highlights
  const getThemeGlow = () => {
    switch (ambientMode) {
      case 'rain':
        return { glow1: 'bg-sky-500', glow2: 'bg-indigo-500', border: 'border-sky-500/30' };
      case 'ocean':
        return { glow1: 'bg-teal-500', glow2: 'bg-cyan-500', border: 'border-teal-500/30' };
      case 'forest':
        return { glow1: 'bg-emerald-500', glow2: 'bg-lime-500', border: 'border-emerald-500/30' };
      default:
        return { glow1: 'bg-amber-500', glow2: 'bg-teal-500', border: 'border-amber-500/30' };
    }
  };

  const theme = getThemeGlow();

  return (
    <div 
      id="homepage-showcase"
      className={`relative rounded-2xl bg-gradient-to-r from-zinc-950/55 via-zinc-900/50 to-zinc-950/55 border transition-all duration-500 shadow-2xl backdrop-blur-md overflow-hidden p-4 sm:p-5 ${
        animating 
          ? 'border-amber-400/60 shadow-amber-500/20 scale-[1.008]' 
          : `border-white/[0.08] hover:${theme.border}`
      }`}
    >
      {/* Warm Ambient Glow Effects */}
      <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[70px] pointer-events-none opacity-20 ${theme.glow1} transition-opacity duration-700`} />
      <div className={`absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-[70px] pointer-events-none opacity-15 ${theme.glow2} transition-opacity duration-700`} />

      {/* Content Layout */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10 transition-all duration-300 ${
        animating ? 'opacity-90 translate-y-0.5' : 'opacity-100 translate-y-0'
      }`}>
        
        {/* Left: Compact Book Cover */}
        <div 
          onClick={() => {
            audioEngine.playPageTurn();
            onOpenDetailModal(book);
          }}
          className="relative group cursor-pointer flex-shrink-0 self-center sm:self-auto"
          title="Kitap detaylarını tam ekranda inceleyin"
        >
          <div className="w-20 sm:w-24 h-28 sm:h-34 rounded-xl overflow-hidden shadow-xl border border-white/15 bg-zinc-950 relative transition-transform duration-300 group-hover:scale-105 group-hover:shadow-amber-500/20">
            <BookCover
              coverImage={book.coverImage}
              title={book.title}
              author={book.author}
            />
            {/* Quick Inspect Hover Tint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="p-1.5 rounded-full bg-amber-500 text-zinc-950 shadow-md">
                <Info className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Center & Right: Title, Meta, Quote & Quick Actions */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <div className="min-w-0">
              <h3 
                onClick={() => onOpenDetailModal(book)}
                className="text-lg sm:text-xl font-bold font-serif-display text-white tracking-normal hover:text-amber-300 transition-colors cursor-pointer truncate"
              >
                {book.title}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-medium truncate">
                {book.author}
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1 sm:pt-0">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-white/[0.06] text-[11px] text-zinc-300">
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>{book.totalPages} Sayfa</span>
              </div>

              {book.originalYear && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-white/[0.06] text-[11px] text-zinc-300">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>{book.originalYear}</span>
                </div>
              )}

              {book.publisher && (
                <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-800/80 border border-white/[0.06] text-[11px] text-zinc-300">
                  <Building className="w-3 h-3 text-amber-400" />
                  <span className="truncate max-w-[140px]">{book.publisher}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quote or Description Excerpt */}
          {quote ? (
            <div className="p-2.5 px-3 rounded-xl bg-zinc-950/60 border border-amber-500/15 relative flex items-start gap-2">
              <QuoteIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-200 font-serif italic leading-relaxed line-clamp-2">
                "{quote}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2 font-light">
              {book.description}
            </p>
          )}

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playPageTurn();
                  onOpenDetailModal(book);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Detayları İncele</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(book);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                title="Bu kitabı kütüphaneden sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sil</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
