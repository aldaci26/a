import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/90 border border-amber-400/30 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
      </span>
      <WifiOff className="w-4 h-4" />
      <span>Çevrimdışı Mod — Kütüphaneniz yerel cihazınızda kesintisiz çalışıyor.</span>
    </div>
  );
};
