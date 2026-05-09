'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginControl() {
  const { data: session, status } = useSession();

  // STATE 1: LOADING (Sleek pulse indicator)
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 bg-surface border border-borderline px-3 py-1.5 rounded">
        <div className="w-2 h-2 bg-[#f59e0b] rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]"></div>
        <span className="text-[10px] text-textSec font-mono tracking-widest uppercase">SYS.LINK</span>
      </div>
    );
  }

  // STATE 2: AUTHENTICATED (Operator ID + Logout)
  if (session && session.user) {
    return (
      <div className="flex items-center gap-3 bg-surface border border-[#06b6d4]/30 px-2 py-1 rounded group transition-all hover:border-[#06b6d4]/80">
        <img 
          src={session.user.image || ''} 
          alt="Profile" 
          className="w-6 h-6 rounded border border-[#06b6d4]/50 grayscale group-hover:grayscale-0 transition-all" 
        />
        <div className="hidden sm:flex flex-col pr-2">
          <span className="text-[8px] text-[#06b6d4] font-mono leading-none tracking-widest uppercase mb-0.5">AUTH.GRANTED</span>
          <span className="text-[11px] text-textPri font-bold leading-none truncate max-w-[100px]">
            {session.user.name?.split(' ')[0] || 'OPERATOR'}
          </span>
        </div>
        <button 
          onClick={() => signOut()} 
          className="px-2 py-1 text-[9px] text-textMuted hover:text-[#ef4444] font-mono tracking-wider border-l border-borderline transition-colors"
        >
          [END]
        </button>
      </div>
    );
  }

  // STATE 3: DISCONNECTED (Ignition Button - NOW GLOWING CYAN)
  return (
    <button 
      onClick={() => signIn('google')} 
      className="flex items-center gap-2 bg-transparent border border-[#06b6d4] text-[#06b6d4] px-4 py-1.5 rounded transition-all duration-300 hover:bg-[#06b6d4] hover:text-black hover:shadow-[0_0_15px_#06b6d4]"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] animate-pulse"></div>
      <span className="text-[11px] font-mono font-bold uppercase tracking-widest">CONNECT</span>
    </button>
  );
}