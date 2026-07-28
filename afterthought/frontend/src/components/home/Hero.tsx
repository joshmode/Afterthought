import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import type { Essay } from "@/lib/types";

interface HeroProps {
  currentIssue: Essay | null;
}

export function Hero({ currentIssue }: HeroProps) {
  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent-amber/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent-burgundy/10 blur-3xl" />
      </div>

      <div className="z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div className="min-w-0 space-y-8">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-bold leading-none tracking-tight text-white sm:text-5xl lg:text-7xl xl:text-8xl">
              AFTERTHOUGHT
            </h1>
            <p className="font-mono text-zinc-400">
              Ideas worth thinking about twice.
            </p>
          </div>

          {currentIssue ? (
            <article className="space-y-4 rounded-lg border border-border bg-surface/70 p-6 backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-2 text-xs font-mono text-accent-amber">
                <span className="uppercase tracking-wider">
                  {currentIssue.series?.name ?? "Current issue"}
                </span>
                {currentIssue.issue_number && (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>Issue #{String(currentIssue.issue_number).padStart(3, "0")}</span>
                  </>
                )}
              </div>
              <h2 className="font-serif text-3xl font-medium leading-tight text-white md:text-4xl">
                {currentIssue.title}
              </h2>
              {currentIssue.abstract && (
                <p className="text-sm leading-relaxed text-zinc-300">
                  {currentIssue.abstract}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs font-mono text-zinc-400">
                {currentIssue.publication_date && (
                  <time dateTime={currentIssue.publication_date}>
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                      new Date(currentIssue.publication_date),
                    )}
                  </time>
                )}
                {currentIssue.reading_time_minutes && (
                  <span>{currentIssue.reading_time_minutes} min read</span>
                )}
                {currentIssue.themes.length > 0 && (
                  <span className="text-accent-gold">
                    {currentIssue.themes.map((theme) => theme.name).join(", ")}
                  </span>
                )}
              </div>
            </article>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-zinc-400">
              The next issue is being prepared. Explore the library in the meantime.
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            {currentIssue && (
              <Link
                href={`/essays/${currentIssue.slug}`}
                className="flex items-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-background transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
              >
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                <span>Read current issue</span>
              </Link>
            )}
            <Link
              href="/essays"
              className="flex items-center gap-2 rounded-md border border-border px-6 py-3 font-medium transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
            >
              <span>Browse library</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex" aria-hidden="true">
          <div className="relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-background">
            <div className="motion-safe:animate-slow-spin absolute h-48 w-48 rounded-full border border-accent-amber/30" />
            <div className="flex h-32 w-32 rotate-45 items-center justify-center rounded-xl border border-white/10 bg-accent-amber/20 shadow-2xl backdrop-blur-xl">
              <div className="h-16 w-16 rounded-full bg-accent-burgundy/40 mix-blend-screen" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
