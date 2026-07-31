"use client";

import { useEffect, useMemo, useState } from "react";

interface CountdownProps {
  issueNumber: number;
}

function getNextTuesdayNoonUTC8(): Date {
  const now = new Date();

  // Calculate current offset for UTC+8 in milliseconds
  // UTC+8 is 8 hours ahead of UTC.
  const utc8Offset = 8 * 60 * 60 * 1000;

  // Get current time in UTC
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);

  // Get current time in UTC+8
  const nowUTC8 = new Date(utcNow + utc8Offset);

  let daysUntilTuesday = (2 - nowUTC8.getDay() + 7) % 7;

  // If it's Tuesday but past 12:00 PM, we want next Tuesday
  if (daysUntilTuesday === 0 && nowUTC8.getHours() >= 12) {
    daysUntilTuesday = 7;
  }

  // Create target date in UTC+8
  const targetUTC8 = new Date(nowUTC8);
  targetUTC8.setDate(nowUTC8.getDate() + daysUntilTuesday);
  targetUTC8.setHours(12, 0, 0, 0);

  // Convert target UTC+8 back to local browser time to use in remaining calculation
  return new Date(targetUTC8.getTime() - utc8Offset - (now.getTimezoneOffset() * 60000));
}

export function Countdown({
  issueNumber,
}: CountdownProps) {
  const [target, setTarget] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Only set target on client to avoid hydration mismatch
    const nextDate = getNextTuesdayNoonUTC8();
    setTarget(nextDate);
    setRemaining(getRemaining(nextDate));

    const timer = window.setInterval(() => {
      setRemaining(getRemaining(nextDate));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Avoid hydration mismatch by rendering a skeleton or zeros on server
  const isClient = target !== null;

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
                {isClient ? remaining.days : "0"}
              </div>

              <div className="mt-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
                Days Remaining
              </div>

            </div>

            <div className="mt-10 flex gap-8">

              <TimeBlock
                label="Hours"
                value={isClient ? remaining.hours : 0}
              />

              <TimeBlock
                label="Minutes"
                value={isClient ? remaining.minutes : 0}
              />

              <TimeBlock
                label="Seconds"
                value={isClient ? remaining.seconds : 0}
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