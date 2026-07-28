"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EMPTY_TIME = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function calculateTimeLeft(target: string | null): TimeLeft {
  if (!target) return EMPTY_TIME;
  const difference = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  };
}

export function Countdown() {
  const [target, setTarget] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("publication time");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(EMPTY_TIME);

  useEffect(() => {
    void apiFetch<{ publication_at: string; timezone: string }>(
      "/api/essays/next-publication",
    )
      .then((data) => {
        setTarget(data.publication_at);
        setTimezone(data.timezone);
      })
      .catch(() => {
        setTarget(null);
      });
  }, []);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(target));
    if (!target) return;
    const timer = window.setInterval(
      () => setTimeLeft(calculateTimeLeft(target)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <section
      aria-labelledby="next-publication-heading"
      className="border-y border-border bg-zinc-900/20 py-10"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
        <div className="text-center md:text-left">
          <h2
            id="next-publication-heading"
            className="mb-2 font-serif text-3xl text-white"
          >
            Next publication
          </h2>
          <p className="font-mono text-sm text-zinc-400">
            Tuesdays at 9:00 AM ({timezone}).
          </p>
        </div>
        <div
          className="grid grid-cols-4 gap-2 text-center sm:gap-4"
          aria-live="off"
          aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes and ${timeLeft.seconds} seconds`}
        >
          {(
            [
              ["Days", timeLeft.days],
              ["Hours", timeLeft.hours],
              ["Mins", timeLeft.minutes],
              ["Secs", timeLeft.seconds],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="min-w-16 rounded-lg border border-zinc-800 bg-background p-3 sm:min-w-20 sm:p-4"
              aria-hidden="true"
            >
              <div className="font-serif text-2xl text-accent-amber sm:text-4xl">
                {String(value).padStart(2, "0")}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500 sm:text-xs">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
