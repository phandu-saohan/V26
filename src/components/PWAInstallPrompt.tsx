import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96 transition-all duration-500 transform translate-y-0 shadow-2xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-white backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">VSAPS 2026</h4>
            <p className="text-xs text-slate-400">Cài đặt ứng dụng di động để check-in và nhận thông báo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-indigo-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Cài đặt
          </button>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-1.5 rounded-lg transition duration-150"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
