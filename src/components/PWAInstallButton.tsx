import React, { useState } from 'react';
import { Smartphone, Download, Check, X, Share, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { haptics } from '../utils/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isWindows, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside installed standalone app or electron, don't clutter the UI
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    haptics.tap();
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        haptics.success();
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <Check className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Uygulama Yüklendi</span>
      </div>
    );
  }

  const getButtonLabel = () => {
    if (isAndroid) return "Android'e Yükle";
    if (isWindows) return "Windows'a Yükle";
    return "Uygulamayı Yükle";
  };

  const getButtonIcon = () => {
    if (isAndroid) return <Smartphone className="w-3.5 h-3.5 text-amber-400" />;
    if (isWindows) return <Monitor className="w-3.5 h-3.5 text-amber-400" />;
    return <Download className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 hover:from-amber-500/25 hover:to-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
        title="Kitaplığım uygulamasını telefonunuza veya bilgisayarınıza yükleyin"
      >
        {getButtonIcon()}
        <span>{getButtonLabel()}</span>
      </button>

      {/* Guided manual installation modal for browsers when automatic prompt isn't fired yet */}
      {showGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-[#121116] border border-white/10 p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                {isWindows ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                <span>{isWindows ? "Windows'a Yükleme" : "Telefona Yükleme Rehberi"}</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isWindows ? (
              <div className="space-y-3 text-xs text-zinc-300">
                <p>Uygulamayı Windows bilgisayarınızda bağımsız bir program gibi çalıştırmak için:</p>
                <ol className="space-y-2 list-decimal list-inside text-zinc-200">
                  <li>Tarayıcınızın sağ üstündeki <strong>adres çubuğundaki yükleme simgesine</strong> veya <strong>üç nokta (⋮)</strong> menüsüne tıklayın.</li>
                  <li><strong>"Kitaplığım Uygulamasını Yükle"</strong> seçeneğini seçin.</li>
                  <li>Masaüstünüze ve Başlat menünüze tek tıkla açılan bağımsız Windows programı olarak eklenecektir.</li>
                </ol>
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90">
                  💡 İsterseniz GitHub <strong>Releases</strong> sayfamızdan doğrudan <strong>.exe (Kurulum veya Taşınabilir Portable)</strong> dosyasını da indirebilirsiniz.
                </div>
              </div>
            ) : isIOS ? (
              <div className="space-y-3 text-xs text-zinc-300">
                <p>iPhone veya iPad üzerinde tek dokunuşla ana ekrana eklemek için:</p>
                <ol className="space-y-2 list-decimal list-inside text-zinc-200">
                  <li>Safari alt çubuğundaki <strong>Paylaş</strong> (<Share className="w-3 h-3 inline text-sky-400" />) simgesine dokunun.</li>
                  <li>Aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                  <li>Sağ üstteki <strong>"Ekle"</strong> butonuna basın.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-zinc-300">
                <p>Android Chrome veya diğer tarayıcılarda:</p>
                <ol className="space-y-2 list-decimal list-inside text-zinc-200">
                  <li>Tarayıcının sağ üstündeki <strong>üç nokta (⋮)</strong> menüsüne dokunun.</li>
                  <li><strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> butonuna basın.</li>
                  <li>Uygulama tam ekran ve internetsiz çalışacak şekilde telefonunuza yüklenecektir.</li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
};
