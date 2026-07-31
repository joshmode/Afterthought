import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { serverApiFetch } from "@/lib/server-api";
import type { EssaySummary, Series, Theme } from "@/lib/types";
import { FilterClient } from "./FilterClient";

export const metadata: Metadata = {
  title: "Essay Library",
  description: "Browse long-form essays from Afterthought.",
};
export const dynamic = "force-dynamic";

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string;
    theme_id?: string;
    series_id?: string;
  }>;
}

export default async function EssaysPage({ searchParams }: LibraryPageProps) {
  const filters = await searchParams;
  const query = filters.q?.trim() ?? "";
  const params = new URLSearchParams();
  if (filters.theme_id) params.set("theme_id", filters.theme_id);
  if (filters.series_id) params.set("series_id", filters.series_id);
  const endpoint = query
    ? `/api/search/?q=${encodeURIComponent(query)}`
    : `/api/essays/${params.size ? `?${params}` : ""}`;

  const [essayResult, themeResult, seriesResult] = await Promise.allSettled([
    serverApiFetch<EssaySummary[]>(endpoint, { cache: "no-store" }),
    serverApiFetch<Theme[]>("/api/themes/", { next: { revalidate: 300 } }),
    serverApiFetch<Series[]>("/api/series/", { next: { revalidate: 300 } }),
  ]);
  const essays = essayResult.status === "fulfilled" ? essayResult.value : [];
  const themes = themeResult.status === "fulfilled" ? themeResult.value : [];
  const series = seriesResult.status === "fulfilled" ? seriesResult.value : [];
  const unavailable = essayResult.status === "rejected";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 font-serif text-4xl text-zinc-100">
              Essay library
            </h1>
            <p className="text-zinc-400">
              Long-form writing on technology, society, and philosophy.
            </p>
          </div>
          <form
            role="search"
            className="flex w-full max-w-md gap-2"
            action="/essays"
          >
            <label htmlFor="library-search" className="sr-only">
              Search essays
            </label>
            <input
              id="library-search"
              name="q"
              type="search"
              minLength={2}
              maxLength={100}
              defaultValue={query}
              placeholder="Search the library"
              className="min-w-0 flex-1 rounded border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:border-accent-amber focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-accent-amber px-5 py-2 font-medium text-black hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Search
            </button>
          </form>
        </div>

        <FilterClient
          themes={themes}
          series={series}
          currentThemeId={filters.theme_id}
          currentSeriesId={filters.series_id}
        />

        {unavailable ? (
          <div role="alert" className="rounded border border-red-900 bg-red-950/30 p-6 text-red-200">
            The library is temporarily unavailable. Please try again shortly.
          </div>
        ) : essays.length === 0 ? (
          <div className="rounded border border-dashed border-zinc-700 p-10 text-center text-zinc-400">
            {query ? `No essays matched “${query}”.` : "No essays are published yet."}
          </div>
        ) : (
          <div className="space-y-10">
            {essays.map((essay) => (
              <article key={essay.id} className="border-b border-zinc-800 pb-10">
                <Link
                  href={`/essays/${essay.slug}`}
                  className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
                >
                  <div className="mb-3 flex flex-col justify-between gap-2 md:flex-row md:items-baseline">
                    <h2 className="font-serif text-3xl text-zinc-200 transition-colors group-hover:text-accent-amber">
                      {essay.title}
                    </h2>
                    {essay.reading_time_minutes && (
                      <span className="font-mono text-sm text-zinc-500">
                        {essay.reading_time_minutes} min read
                      </span>
                    )}
                  </div>
                  {essay.abstract && (
                    <p className="mb-4 max-w-3xl text-lg leading-relaxed text-zinc-400">
                      {essay.abstract}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 font-mono text-sm text-zinc-500">
                    {essay.publication_date && (
                      <time dateTime={essay.publication_date}>
                        {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                          new Date(essay.publication_date),
                        )}
                      </time>
                    )}
                    {essay.series && <span>{essay.series.name}</span>}
                    {essay.themes.map((theme) => (
                      <span key={theme.id} className="text-accent-gold">
                        {theme.name}
                      </span>
                    ))}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
