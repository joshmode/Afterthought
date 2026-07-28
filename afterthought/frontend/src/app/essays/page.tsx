"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

interface Essay {
  id: number;
  title: string;
  slug: string;
  abstract: string | null;
  content: string;
  reading_time_minutes: number | null;
  publication_date: string | null;
}

export default function EssaysPage() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEssays() {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/essays/");
        if (!res.ok) {
          throw new Error("Failed to fetch essays");
        }
        const data = await res.json();
        setEssays(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchEssays();
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-zinc-100 mb-8">Library</h1>
        {loading && <p className="text-zinc-400 font-mono">Loading essays...</p>}
        {error && <p className="text-red-500 font-mono">{error}</p>}
        {!loading && !error && essays.length === 0 && (
          <p className="text-zinc-400 font-mono">No essays published yet.</p>
        )}
        <div className="space-y-12 mt-12">
          {essays.map((essay) => (
            <article key={essay.id} className="border-b border-zinc-800 pb-12">
              <Link href={`/essays/${essay.slug}`} className="block group">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-4">
                  <h2 className="text-3xl font-serif text-zinc-200 group-hover:text-accent-amber transition-colors">
                    {essay.title}
                  </h2>
                  <span className="text-sm font-mono text-zinc-500 mt-2 md:mt-0">
                    {essay.reading_time_minutes ? `${essay.reading_time_minutes} min read` : ""}
                  </span>
                </div>
                {essay.abstract && (
                  <p className="text-zinc-400 text-lg leading-relaxed font-sans mb-4 max-w-3xl">
                    {essay.abstract}
                  </p>
                )}
                <div className="text-sm font-mono text-zinc-500">
                  {essay.publication_date ? new Date(essay.publication_date).toLocaleDateString() : ""}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
