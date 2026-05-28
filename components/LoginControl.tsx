'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function LoginControl() {
  const { data: session, status } = useSession();

  // STATE 1: LOADING (Glassmorphic Skeleton Pill)
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full border border-transparent dark:border-white/5 animate-pulse transition-colors duration-700 h-[40px] w-[130px]">
        <div className="w-2 h-2 bg-amber-400/50 rounded-full"></div>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-widest uppercase">Syncing...</span>
      </div>
    );
  }

  // STATE 2: AUTHENTICATED (Sleek Operator Pill)
  if (session && session.user) {
    return (
      <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 pl-1.5 pr-1.5 py-1.5 rounded-full border border-transparent dark:border-white/5 transition-colors duration-700 group">
        
        {/* Dynamic Avatar Ring */}
        {session.user.image ? (
          <Image 
            src={session.user.image} 
            alt="Profile Picture" 
            width={28} 
            height={28} 
            className="rounded-full ring-2 ring-white dark:ring-[#111111] shadow-sm transition-all duration-700"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors duration-700">
            {session.user.name?.charAt(0) || 'O'}
          </div>
        )}

        <div className="hidden sm:flex flex-col pr-3 pl-1">
          <span className="text-[9px] text-[#00A598] font-bold leading-none tracking-widest uppercase mb-0.5 transition-colors duration-700">
            Auth.Granted
          </span>
          <span className="text-[12px] text-neutral-900 dark:text-white font-bold leading-none truncate max-w-[100px] tracking-tight transition-colors duration-700">
            {session.user.name?.split(' ')[0] || 'Operator'}
          </span>
        </div>

        {/* Tactile Logout Button */}
        <button 
          onClick={() => signOut()} 
          title="Disconnect Session"
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 ml-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  }

  // STATE 3: DISCONNECTED (Interactive Lock/Ignition Button)
  return (
    <button 
      onClick={() => signIn()} 
      className="flex items-center justify-center bg-white/60 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 px-5 py-2 rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 group shadow-sm hover:shadow h-[40px] min-w-[110px]"
    >
      {/* DEFAULT STATE: LOCKED */}
      <div className="flex items-center gap-2.5 group-hover:hidden transition-all duration-300">
        <div className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest transition-colors duration-700">
          Locked
        </span>
      </div>

      {/* HOVER STATE: CONNECT */}
      <div className="hidden group-hover:flex items-center gap-2.5 transition-all duration-300">
        <div className="w-2 h-2 rounded-full bg-[#00A598] shadow-[0_0_8px_rgba(0,165,152,0.6)] animate-pulse"></div>
        <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest transition-colors duration-700">
          Connect
        </span>
      </div>
    </button>
  );
}
