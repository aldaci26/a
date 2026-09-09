import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Plus,
  CloudRain,
  Flame,
  Waves,
  Trees
} from 'lucide-react';
import { AmbientSoundMode } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface HeaderProps {
  onOpenSearchModal: () => void;
  soundMode: AmbientSoundMode;
  setSoundMode: (mode: AmbientSoundMode) => void;
  totalBooks: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearchModal,
  soundMode,
  setSoundMode,
  totalBooks
}) => {
  const [isSoundMenuOpen, setIsSoundMenuOpen] = useState(false);
  const soundMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (soundMenuRef.current && !soundMenuRef.current.contains(e.target as Node)) {
        setIsSoundMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSound = (mode: AmbientSoundMode) => {
    setSoundMode(mode);
    setIsSoundMenuOpen(false);

    if (mode === 'off') {
      audioEngine.stopAmbient();
    } else if (mode === 'fireplace') {
      audioEngine.playFireplace();
    } else if (mode === 'rain') {
      audioEngine.playRain();
    } else if (mode === 'ocean') {
      audioEngine.playOcean();
    } else if (mode === 'forest') {
      audioEngine.playForest();
    }
  };

  const getSoundLabel = () => {
    switch (soundMode) {
      case 'fireplace':
        return 'Şömine';
      case 'rain':
        return 'Fırtına';
      case 'ocean':
        return 'Okyanus';
      case 'forest':
        return 'Orman';
      default:
        return 'Sessiz';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#09090b]/60 backdrop-blur-md transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Left: Interactive Bespoke Literary Logo (Clicking searches and adds books) */}
        <button
          type="button"
          onClick={() => {
            audioEngine.playChime();
            onOpenSearchModal();
          }}
          className="group flex items-center gap-3 p-1.5 -ml-1.5 rounded-2xl hover:bg-white/[0.04] transition-all text-left cursor-pointer select-none"
          title="Kitap aramak ve eklemek için tıklayın"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.15)] group-hover:scale-105 group-hover:border-amber-400 transition-all">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-none stroke-current stroke-[1.75]"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M12 6v6" />
                <path d="M9 9h6" />
              </svg>
            </div>
            {/* Quick plus indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-serif-display tracking-wider text-white group-hover:text-amber-300 transition-colors">
                KİTAPLIK
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-amber-400/90 transition-colors flex items-center gap-1">
              <span>+ Kitap Ekle</span>
            </span>
          </div>
        </button>

        {/* Right: Real Ambient Sound Selector */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={soundMenuRef}>
            <button
              type="button"
              onClick={() => setIsSoundMenuOpen(!isSoundMenuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                soundMode !== 'off'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/[0.06] text-zinc-300 hover:text-white'
              }`}
              title="Ortam Sesleri"
            >
              {soundMode === 'off' ? (
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              )}
              <span className="hidden sm:inline">{getSoundLabel()}</span>
            </button>

            {/* Sound Dropdown Menu */}
            {isSoundMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#121116] border border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-white/[0.06] mb-1">
                  Doğal Ortam Sesi
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectSound('off')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                    soundMode === 'off'
                      ? 'bg-amber-500 text-zinc-950 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Sessiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSound('fireplace')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                    soundMode === 'fireplace'
                      ? 'bg-amber-500 text-zinc-950 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Şömine Ateşi</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSound('rain')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                    soundMode === 'rain'
                      ? 'bg-amber-500 text-zinc-950 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  <span>Fırtına</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSound('ocean')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                    soundMode === 'ocean'
                      ? 'bg-amber-500 text-zinc-950 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Okyanus Dalgaları</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSound('forest')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                    soundMode === 'forest'
                      ? 'bg-amber-500 text-zinc-950 font-medium'
                      : 'text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Orman</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
