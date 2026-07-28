'use client';
import { useState, useEffect } from 'react';

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Target next Tuesday 9 AM
      const nextTuesday = new Date();
      nextTuesday.setDate(now.getDate() + ((2 + 7 - now.getDay()) % 7 || 7));
      nextTuesday.setHours(9, 0, 0, 0);

      const diff = nextTuesday.getTime() - now.getTime();

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-12 border-y border-border bg-zinc-900/20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h3 className="font-serif text-3xl text-white mb-2">Next Publication</h3>
          <p className="font-mono text-sm text-zinc-400">A new essay drops every Tuesday at 9 AM.</p>
        </div>
        <div className="flex space-x-6 text-center">
          <div className="bg-background border border-zinc-800 rounded-lg p-4 min-w-[80px]">
            <div className="text-4xl font-serif text-accent-amber">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-2">Days</div>
          </div>
          <div className="bg-background border border-zinc-800 rounded-lg p-4 min-w-[80px]">
            <div className="text-4xl font-serif text-accent-amber">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-2">Hours</div>
          </div>
          <div className="bg-background border border-zinc-800 rounded-lg p-4 min-w-[80px]">
            <div className="text-4xl font-serif text-accent-amber">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-2">Mins</div>
          </div>
          <div className="bg-background border border-zinc-800 rounded-lg p-4 min-w-[80px]">
            <div className="text-4xl font-serif text-accent-amber">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-2">Secs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
