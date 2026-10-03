'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/lib/toast-bus';
import { useHydrated } from './system/hooks';

// Minimal beforeinstallprompt typing (not in the standard DOM lib).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'vest_pwa_install_dismissed';

// PWA heads-up display: a livery-accented "Install" chip (A2HS) and an offline
// pill. The service-worker update prompt lives in ServiceWorkerRegister (toast).
export default function PwaHud() {
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [offline, setOffline] = useState(false);
  const mounted = useHydrated();

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      /* ignore */
    }

    const onBIP = (e: Event) => {
      e.preventDefault(); // suppress the default mini-infobar; we show our own chip
      if (!dismissed) setInstallEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvt(null);
      toast({ title: 'Installed', message: 'VESTRIPPN is on your home screen.', variant: 'success', icon: '📲' });
    };

    const syncNet = () => setOffline(!navigator.onLine);
    const onOnline = () => {
      setOffline(false);
      toast({ id: 'net', title: 'Back online', message: 'Live data restored.', variant: 'success', icon: '📶' });
    };
    const onOffline = () => setOffline(true);

    syncNet();
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    await installEvt.userChoice.catch(() => undefined);
    setInstallEvt(null);
  };

  const dismissInstall = () => {
    setInstallEvt(null);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Offline pill — slim banner under the header */}
        {offline && (
          <div
            key="offline"
            className="sys-pop-in pointer-events-none fixed inset-x-0 top-[84px] z-[190] flex justify-center px-4"
          >
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-600 shadow-sm dark:text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Offline · showing cached data
            </div>
          </div>
        )}

      {/* Install chip — bottom-left, livery-accented */}
        {installEvt && (
          <div
            key="install"
            className="sys-pop-in fixed bottom-24 left-4 z-[190] sm:bottom-6 sm:left-6"
          >
            <div
              className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-white/85 py-2 pl-2.5 pr-2 dark:border-white/10 dark:bg-[#0d0f12]/90"
              style={{ boxShadow: '0 0 0 1px rgba(var(--hub-accent-rgb), 0.18), 0 18px 44px -18px rgba(0,0,0,0.4)' }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[15px]"
                style={{ background: 'rgba(var(--hub-accent-rgb), 0.14)' }}
                aria-hidden
              >
                📲
              </span>
              <div className="mr-1">
                <div className="text-[12px] font-bold leading-tight tracking-tight text-neutral-900 dark:text-white">
                  Install VESTRIPPN
                </div>
                <div className="text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">
                  Home-screen app · works offline
                </div>
              </div>
              <button
                onClick={install}
                className="rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest text-[#0a0a0a] transition-transform active:scale-95"
                style={{ background: 'var(--hub-accent)' }}
              >
                Install
              </button>
              <button
                onClick={dismissInstall}
                aria-label="Dismiss install prompt"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-black/5 hover:text-neutral-700 dark:hover:bg-white/10 dark:hover:text-neutral-200"
              >
                <span className="text-[12px] leading-none">✕</span>
              </button>
            </div>
          </div>
        )}
    </>
  );
}
