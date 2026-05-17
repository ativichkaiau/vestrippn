export default function Loading() {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#FAFAFA] dark:bg-[#050505] transition-colors duration-700">
      <div className="flex flex-col items-center gap-7">
        <div className="w-16 h-16 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center text-[30px] font-black animate-loader-pulse shadow-[0_0_40px_rgba(0,165,152,0.25)]">
          V
        </div>
        <div className="h-[3px] w-40 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-[#00A598] to-blue-400 rounded-full animate-loader-sweep" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500 animate-loader-pulse">
          Syncing Uplink
        </div>
      </div>
    </div>
  );
}
