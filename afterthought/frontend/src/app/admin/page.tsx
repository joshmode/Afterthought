"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";

interface Stats {
  total_essays: number;
  published_essays: number;
  total_readers: number;
  total_views: number;
  pending_comments: number;
  pending_submissions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Stats>("/api/editorial/stats")
      .then(setStats)
      .catch(() => setError("Dashboard statistics could not be loaded."));
  }, []);

  const cards: Array<[string, number | undefined]> = [
    ["Total essays", stats?.total_essays],
    ["Published", stats?.published_essays],
    ["Readers", stats?.total_readers],
    ["Total views", stats?.total_views],
    ["Pending comments", stats?.pending_comments],
    ["Pending submissions", stats?.pending_submissions],
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl text-white">Editorial overview</h1>
        <Link
          href="/admin/essays/new"
          className="rounded bg-accent-amber px-5 py-3 font-medium text-black hover:bg-amber-400"
        >
          Write new essay
        </Link>
      </div>
      {error && <p role="alert" className="mb-6 text-red-300">{error}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-2 font-mono text-sm text-zinc-500">{label}</div>
            <div className="font-serif text-3xl text-white">
              {value === undefined ? "—" : value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
