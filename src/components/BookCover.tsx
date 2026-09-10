import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

interface BookCoverProps {
  coverImage?: string;
  title: string;
  author?: string;
  className?: string;
}

// Deterministic rich leather/cloth color palettes for hardcover book jackets
const COVER_THEMES = [
  {
    bg: 'from-[#2e0f17] via-[#1a080d] to-[#0d0406]', // Royal Burgundy
    spine: 'bg-[#471522] border-amber-500/30',
    border: 'border-amber-400/40',
    accent: 'text-amber-300',
    sub: 'text-amber-200/80',
    badge: 'bg-amber-500/15 border-amber-400/30 text-amber-300'
  },
  {
    bg: 'from-[#0a2318] via-[#05150e] to-[#020a06]', // Deep Forest Emerald
    spine: 'bg-[#123827] border-emerald-400/30',
    border: 'border-emerald-400/40',
    accent: 'text-emerald-300',
    sub: 'text-emerald-200/80',
    badge: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
  },
  {
    bg: 'from-[#0d1f36] via-[#07111e] to-[#03070d]', // Midnight Royal Navy
    spine: 'bg-[#153257] border-sky-400/30',
    border: 'border-sky-400/40',
    accent: 'text-sky-300',
    sub: 'text-sky-200/80',
    badge: 'bg-sky-500/15 border-sky-400/30 text-sky-300'
  },
  {
    bg: 'from-[#2d1b06] via-[#190e03] to-[#0a0501]', // Aged Antique Amber Leather
    spine: 'bg-[#4a2e0c] border-amber-400/30',
    border: 'border-amber-400/40',
    accent: 'text-amber-300',
    sub: 'text-amber-200/80',
    badge: 'bg-amber-500/15 border-amber-400/30 text-amber-300'
  },
  {
    bg: 'from-[#1f1d24] via-[#121117] to-[#08070a]', // Obsidian Slate
    spine: 'bg-[#312e3b] border-amber-400/30',
    border: 'border-amber-400/30',
    accent: 'text-amber-200',
    sub: 'text-zinc-400',
    badge: 'bg-amber-500/15 border-amber-400/30 text-amber-300'
  }
];

export const BookCover: React.FC<BookCoverProps> = React.memo(({
  coverImage,
  title,
  author,
  className = 'w-full h-full'
}) => {
  const sanitizeUrl = (url?: string): string | undefined => {
    if (!url || typeof url !== 'string' || !url.trim()) return undefined;
    let clean = url.trim();
    if (clean.startsWith('http://')) {
      clean = clean.replace('http://', 'https://');
    }
    // Prevent OpenLibrary from returning 1x1 transparent GIFs
    if (clean.includes('covers.openlibrary.org') && !clean.includes('default=false')) {
      clean += clean.includes('?') ? '&default=false' : '?default=false';
    }
    return clean;
  };

  const [currentSrc, setCurrentSrc] = useState<string | undefined>(() => sanitizeUrl(coverImage));
  const [hasFailed, setHasFailed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const clean = sanitizeUrl(coverImage);
    setCurrentSrc(clean);
    setHasFailed(false);
    setIsLoaded(false);
  }, [coverImage]);

  const handleError = () => {
    setHasFailed(true);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Detect 1x1 transparent dummy spacer GIFs returned by OpenLibrary or empty placeholders
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      setHasFailed(true);
    } else {
      setIsLoaded(true);
    }
  };

  // Pick deterministic theme based on book title characters
  const themeIndex = Math.abs(
    (title || 'Kitap').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % COVER_THEMES.length;
  const theme = COVER_THEMES[themeIndex];

  if (currentSrc && !hasFailed) {
    return (
      <div className={`relative ${className} bg-zinc-950 overflow-hidden select-none`}>
        {/* Soft skeleton glow while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-zinc-700 animate-bounce" />
          </div>
        )}

        <img
          src={currentSrc}
          alt={title}
          referrerPolicy="no-referrer"
          loading="eager"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Realistic Book Spine Shadow on left edge */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
        {/* Subtle book edge gloss */}
        <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-[inherit]" />
      </div>
    );
  }

  // Museum-Grade Collector's Edition Hardcover Book Jacket Fallback
  return (
    <div
      className={`relative ${className} bg-gradient-to-br ${theme.bg} p-2 sm:p-2.5 flex flex-col justify-between select-none overflow-hidden shadow-2xl transition-transform`}
    >
      {/* 3D Book Spine Left Rib & Shadow */}
      <div className={`absolute inset-y-0 left-0 w-3 sm:w-3.5 ${theme.spine} border-r flex flex-col justify-around py-4 shadow-2xl`}>
        <div className="w-full h-[1.5px] bg-white/20" />
        <div className="w-full h-[1.5px] bg-white/20" />
        <div className="w-full h-[1.5px] bg-white/20" />
      </div>

      {/* Decorative Gold Foil Filigree Outer Frame */}
      <div className={`absolute inset-1.5 sm:inset-2 border ${theme.border} rounded-sm pointer-events-none`} />
      <div className="absolute inset-2 sm:inset-2.5 border border-white/5 pointer-events-none" />

      {/* Top Emblem / Monogram */}
      <div className="relative z-10 pl-3 sm:pl-3.5 flex items-center justify-between">
        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border ${theme.badge} flex items-center justify-center text-[10px] font-bold font-serif shadow-sm`}>
          {title.slice(0, 1).toUpperCase()}
        </div>
        <BookOpen className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${theme.accent} opacity-60 mr-1`} />
      </div>

      {/* Centerpiece Book Title & Author in High-End Serif */}
      <div className="relative z-10 pl-3 sm:pl-3.5 my-auto text-center px-1">
        <p className="text-[11px] sm:text-xs font-bold font-serif-display text-amber-100 tracking-tight leading-snug line-clamp-3 drop-shadow-md">
          {title}
        </p>
        <div className="w-6 h-0.5 bg-amber-400/40 mx-auto my-1.5 rounded-full" />
        {author && (
          <p className={`text-[9px] sm:text-[10px] font-medium tracking-wider uppercase line-clamp-2 ${theme.sub}`}>
            {author}
          </p>
        )}
      </div>

      {/* Bottom Classic Library Gold Seal */}
      <div className="relative z-10 pl-3 sm:pl-3.5 flex items-center justify-center">
        <span className="text-[8px] tracking-widest text-amber-300/60 uppercase font-semibold">
          KLASİK DİZİ
        </span>
      </div>
    </div>
  );
});
