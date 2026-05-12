'use client';

import { useState, useEffect } from 'react';

const schumacherQuotes = [
  "I've always believed that you should never, ever give up and you should always keep fighting.",
  "Once something is a passion, the motivation is there.",
  "I always thought that records were there to be broken.",
  "You win a race, the next race it's a question mark. Are you still the best or not?",
  "When you start out in a team, you have to get the teamwork going and then you get something back.",
  "I am not a legend. I am just a guy who does what he loves.",
  "Just being a mediocre driver has never been my ambition. That's not my style.",
  "Every time I go out, I want to win. That is my motivation.",
  "What happened in the past is not important. It's what happens in the future that counts.",
  "You have to be physically perfectly fit to be able to focus entirely on the driving.",
  "I know what I am and what I have to do in my profession, so I can handle the pressure.",
  "Those who have come to know me know that I'm someone who loves his job."
];

const mscStats = [
  { label: 'Titles', value: '7' },
  { label: 'Wins', value: '91' },
  { label: 'Poles', value: '68' },
  { label: 'Podiums', value: '155' }
];

export default function IdentityAnchor() {
  const [quote, setQuote] = useState(schumacherQuotes[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateQuote = () => {
      // Divide current Unix time into 3-hour blocks
      const threeHourBlock = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
      // Cycle through the quotes based on the current block
      const index = threeHourBlock % schumacherQuotes.length;
      setQuote(schumacherQuotes[index]);
    };

    updateQuote();
    // Check quietly in the background every 60 seconds
    const interval = setInterval(updateQuote, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full animate-pulse transition-colors duration-700">
        <div className="h-4 w-24 bg-black/5 dark:bg-white/5 rounded-full mb-4"></div>
        <div className="h-16 w-full bg-black/5 dark:bg-white/5 rounded-xl mb-6"></div>
        <div className="grid grid-cols-4 gap-2 mt-auto">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-black/5 dark:bg-white/5 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between group transition-colors duration-700">
      
      {/* HEADER BADGE */}
      <div className="flex items-center gap-2 mb-4">
        <div className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-transparent dark:border-white/5 flex items-center gap-2 transition-colors duration-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest transition-colors duration-700">
            Michael Schumacher
          </span>
        </div>
      </div>

      {/* ROTATING QUOTE */}
      <div className="flex-1 flex items-center mb-6">
        <p className="text-[15px] sm:text-[17px] font-medium text-neutral-600 dark:text-neutral-300 italic leading-relaxed group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-500 tracking-tight">
          "{quote}"
        </p>
      </div>

      {/* CAREER TELEMETRY GRID */}
      <div className="grid grid-cols-4 gap-2 mt-auto pt-4 border-t border-black/5 dark:border-white/5 transition-colors duration-700">
        {mscStats.map((stat) => (
          <div 
            key={stat.label}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300 border border-transparent dark:border-white/5"
          >
            <span className="text-[20px] font-black tabular-nums tracking-tighter text-[#00A598] drop-shadow-[0_0_12px_rgba(0,165,152,0.2)] dark:drop-shadow-[0_0_15px_rgba(0,165,152,0.4)] transition-all duration-700">
              {stat.value}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 transition-colors duration-700">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}