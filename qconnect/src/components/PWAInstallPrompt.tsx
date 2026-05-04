import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  useEffect(() => {
    // Already installed — don't show
    if (isInStandaloneMode) return;

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) return;

    if (isIOS) {
      // Show iOS guide after a short delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: listen for the native browser prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('pwa_install_dismissed', 'true');
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  // iOS-specific guide
  if (isIOS) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#004D40] text-white rounded-3xl p-5 shadow-2xl shadow-[#00695C]/40 border border-white/10 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Smartphone size={22} className="text-[#AEEA00]" />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">Add QConnect to your Home Screen</p>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Tap <span className="inline-block bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">Share</span> then <span className="font-bold text-white">"Add to Home Screen"</span> for the full app experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android / Desktop prompt
  return (
    <div className="fixed bottom-24 left-4 right-4 z-[200] animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#004D40] text-white rounded-3xl p-5 shadow-2xl shadow-[#00695C]/40 border border-white/10 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <img src="/icons/icon-192.png" alt="QConnect" className="w-9 h-9 rounded-xl object-cover" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-black text-sm tracking-tight">Install QConnect</p>
            <p className="text-xs text-white/60 mt-0.5">Add to your home screen for a native app feel</p>
          </div>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="shrink-0 flex items-center gap-1.5 bg-[#AEEA00] text-[#004D40] px-4 py-2 rounded-2xl text-xs font-black shadow-lg active:scale-95 transition-all disabled:opacity-60"
          >
            <Download size={13} />
            {installing ? 'Installing…' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
