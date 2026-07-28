import Link from "next/link";

import { Countdown } from "@/components/home/Countdown";
import { FeaturedQuote } from "@/components/home/FeaturedQuote";
import { Hero } from "@/components/home/Hero";
import { ThemesCloud } from "@/components/home/ThemesCloud";
import { Navbar } from "@/components/layout/Navbar";
import { serverApiFetch } from "@/lib/server-api";
import type { Essay, Series, Theme } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadHomepage() {
  const [currentResult, themesResult, seriesResult] = await Promise.allSettled([
    serverApiFetch<Essay>("/api/essays/current", { cache: "no-store" }),
    serverApiFetch<Theme[]>("/api/themes/", { cache: "no-store" }),
    serverApiFetch<Series[]>("/api/series/", { cache: "no-store" }),
  ]);
  return {
    currentIssue:
      currentResult.status === "fulfilled" ? currentResult.value : null,
    themes: themesResult.status === "fulfilled" ? themesResult.value : [],
    series:
      seriesResult.status === "fulfilled"
        ? seriesResult.value.filter((item) => item.is_active).slice(0, 3)
        : [],
  };
}

export default async function Home() {
  const { currentIssue, themes, series } = await loadHomepage();
  return (
    <>
      <Navbar />
      <main>
        <Hero currentIssue={currentIssue} />
        <Countdown />
        <FeaturedQuote quote={currentIssue?.featured_quote ?? null} />
        <section
          className="border-b border-border bg-background py-24"
          aria-labelledby="series-heading"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex flex-col items-baseline justify-between border-b border-zinc-800 pb-4 md:flex-row">
              <h2 id="series-heading" className="font-serif text-4xl text-white">
                Editorial series
              </h2>
              <Link
                href="/series"
                className="mt-4 rounded font-mono text-sm uppercase tracking-widest text-accent-amber transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber md:mt-0"
              >
                View all series →
              </Link>
            </div>
            {series.length ? (
              <div className="grid gap-8 md:grid-cols-3">
                {series.map((item) => (
                  <Link
                    key={item.id}
                    href={`/essays?series_id=${item.id}`}
                    className="group block rounded-xl border border-zinc-800 bg-surface/50 p-8 transition-colors hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
                  >
                    <h3 className="mb-4 font-serif text-2xl text-zinc-100 transition-colors group-hover:text-accent-amber">
                      {item.name}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {item.description ?? "Explore this ongoing editorial collection."}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500">Editorial series are being prepared.</p>
            )}
          </div>
        </section>
        <ThemesCloud themes={themes} />
      </main>
      <footer className="border-t border-border bg-surface/30 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 font-mono text-sm text-zinc-500 md:flex-row">
          <p>© {new Date().getFullYear()} Afterthought. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/submissions" className="hover:text-accent-amber">
              Submissions
            </Link>
            <Link href="/feedback" className="hover:text-accent-amber">
              Feedback
            </Link>
            <Link href="/feed.xml" className="hover:text-accent-amber">
              RSS
            </Link>
            <Link href="/sitemap.xml" className="hover:text-accent-amber">
              Sitemap
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
