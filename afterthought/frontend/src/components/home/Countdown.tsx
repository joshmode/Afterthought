'use client';
import { useState, useEffect } from 'react';

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

  useEffect(() => {
    // Simple mock countdown for demonstration
    setTimeLeft({ days: 4, hours: 12 });
  }, []);

  return (
    <div className="py-12 border-y border-border">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h3 className="font-serif text-2xl text-white">Next Issue</h3>
          <p className="font-mono text-sm text-zinc-400">Taboo Tuesdays</p>
        </div>
        <div className="flex space-x-8 text-center">
          <div>
            <div className="text-4xl font-serif text-accent-amber">{timeLeft.days}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-1">Days</div>
          </div>
          <div>
            <div className="text-4xl font-serif text-accent-amber">{timeLeft.hours}</div>
            <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mt-1">Hours</div>
          </div>
        </div>
      </div>
    </div>
  );
}
