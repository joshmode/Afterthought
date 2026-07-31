"use client";

import { useEffect, useMemo, useState } from "react";

interface CountdownProps {
  releaseDate: string | Date;
  issueNumber: number;
}

export function Countdown({
  releaseDate,
  issueNumber,
}: CountdownProps) {
  const target = useMemo(
    () => new Date(releaseDate),
    [releaseDate]
  );

  const [remaining, setRemaining] = useState(getRemaining(target));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(getRemaining(target));
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-32">

      <div className="border-y border-zinc-900 py-20">

        <div className="grid gap-20 lg:grid-cols-[1fr_auto]">

          {/* Left */}

          <div>

            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              Next Issue
            </p>

            <h2 className="mt-5 font-serif text-5xl leading-tight text-white">
              Issue {String(issueNumber).padStart(3, "0")}
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">
              We publish deliberately rather than frequently.
              Every issue is released only when the writing is
              ready—not when the calendar demands it.
            </p>

          </div>

          {/* Countdown */}

          <div className="flex flex-col items-start lg:items-end">

            <div className="text-right">

              <div className="text-7xl font-black tracking-tight text-white">
                {remaining.days}
              </div>

              <div className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                Days Remaining
              </div>

            </div>

            <div className="mt-10 flex gap-8">

              <TimeBlock
                label="Hours"
                value={remaining.hours}
              />

              <TimeBlock
                label="Minutes"
                value={remaining.minutes}
              />

              <TimeBlock
                label="Seconds"
                value={remaining.seconds}
              />

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

function TimeBlock({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="text-center">

      <div className="text-3xl font-semibold text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </div>

      <div className="mt-2 text-xs uppercase tracking-[0.28em] text-zinc-600">
        {label}
      </div>

    </div>
  );
}

function getRemaining(target: Date) {
  const diff = Math.max(
    target.getTime() - Date.now(),
    0
  );

  const total = Math.floor(diff / 1000);

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}