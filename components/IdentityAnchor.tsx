'use client';

import { useState, useEffect } from 'react';

const schumacherQuotes = [
  "I've always believed that you should never, ever give up and you should always keep fighting.",
  "Once something is a passion, the motivation is there.",
  "I always thought that records were there to be broken.",
  "You win a race, the next race it's a question mark. Are you still the best or not?",
  "When you start out in a team, you have to get the teamwork going and then you get something back.",
  "I am not a legend. I am just a guy who does what he loves.",
  "Just being a mediocre driver has never been my ambition. That's not my style."
];

export default function IdentityAnchor() {
  const [quote, setQuote] = useState(schumacherQuotes[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateQuote = () => {
      // Divide current Unix time into 3-hour blocks (1000ms * 60s * 60m * 3h)
      const threeHourBlock = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
      
      // Cycle through the quotes based on the current block
      const index = threeHourBlock % schumacherQuotes.length;
      setQuote(schumacherQuotes[index]);
    };

    // Set the initial quote
    updateQuote();

    // Check quietly in the background every 60 seconds to see if the 3-hour block has rolled over
    const interval = setInterval(updateQuote, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return (
      <div className="bg-surface border border-borderline border-dashed rounded-lg p-5 shadow-sm mt-auto h-[62px] animate-pulse" />
    );
  }

  return (
    <div className="bg-surface border border-borderline border-dashed rounded-lg p-5 shadow-sm mt-auto group">
      <div className="text-[13px] text-textSec italic text-center px-4 transition-all duration-1000 group-hover:text-textPri">
        "{quote}"
      </div>
    </div>
  );
}