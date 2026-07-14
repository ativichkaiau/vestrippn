'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { toast } from '@/lib/toast-bus';
import { useLowPower } from './useLowPower';

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
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const lowPower = useLowPower();
  const motionOff = Boolean(reduce || lowPower);

  useEffect(() => {
    setMounted(true);

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
  const t = motionOff ? { duration: 0 } : { type: 'spring' as const, stiffness: 380, damping: 30 };

  return (
    <>
      {/* Offline pill — slim banner under the header */}
      <AnimatePresence>
        {offline && (
          <motion.div
            key="offline"
            initial={motionOff ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={motionOff ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={t}
            className="pointer-events-none fixed inset-x-0 top-[84px] z-[190] flex justify-center px-4"
          >
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-600 shadow-sm backdrop-blur-xl dark:text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Offline · showing cached data
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install chip — bottom-left, livery-accented */}
      <AnimatePresence>
        {installEvt && (
          <motion.div
            key="install"
            initial={motionOff ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={motionOff ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={t}
            className="fixed bottom-24 left-4 z-[190] sm:bottom-6 sm:left-6"
          >
            <div
              className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-white/85 py-2 pl-2.5 pr-2 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0f12]/90"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
