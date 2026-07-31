import Link from "next/link";

import { Countdown } from "@/components/home/Countdown";
import { Hero } from "@/components/home/Hero";
import { SeriesGrid } from "@/components/home/SeriesGrid";
import { ThemesCloud } from "@/components/home/ThemesCloud";
import { Navbar } from "@/components/layout/Navbar";

import { serverApiFetch } from "@/lib/server-api";
import type { Essay, Series, Theme } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadHomepage() {
  const [currentResult, themesResult, seriesResult] = await Promise.allSettled([
    serverApiFetch<Essay>("/api/essays/current", {
      cache: "no-store",
    }),
    serverApiFetch<Theme[]>("/api/themes/", {
      cache: "no-store",
    }),
    serverApiFetch<Series[]>("/api/series/", {
      cache: "no-store",
    }),
  ]);

  return {
    currentIssue:
      currentResult.status === "fulfilled"
        ? currentResult.value
        : null,

    themes:
      themesResult.status === "fulfilled"
        ? themesResult.value
        : [],

    series:
      seriesResult.status === "fulfilled"
        ? seriesResult.value.filter((item) => item.is_active)
        : [],
  };
}

export default async function Home() {
  const { currentIssue, themes, series } =
    await loadHomepage();

  return (
    <>
      <Navbar />

      <main>

        {/* HERO */}

        <Hero currentIssue={currentIssue} />

        {/* COUNTDOWN */}

        <Countdown
          issueNumber={(currentIssue?.issue_number ?? 0) + 1}
        />

        {/* SERIES */}

        <section
          aria-labelledby="series-heading"
          className="py-28"
        >
          <div className="mx-auto max-w-7xl px-6">

            <div className="mb-16 max-w-2xl">

              <p className="mb-3 text-sm tracking-[0.25em] text-zinc-500 uppercase">
                Editorial
              </p>

              <h2
                id="series-heading"
                className="font-serif text-5xl leading-tight text-zinc-900 dark:text-white"
              >
                Ongoing series.
              </h2>

              <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                Essays organised into long-term
                editorial collections exploring
                recurring questions rather than
                isolated topics.
              </p>

            </div>

            <SeriesGrid series={series} />

          </div>
        </section>

        {/* THEMES */}

        <section className="border-t border-zinc-200 dark:border-zinc-800 py-28">

          <div className="mx-auto max-w-7xl px-6">

            <div className="mb-16 max-w-2xl">

              <p className="mb-3 text-sm tracking-[0.25em] uppercase text-zinc-500">
                Explore
              </p>

              <h2 className="font-serif text-5xl text-zinc-900 dark:text-white">

                Browse by theme.

              </h2>

              <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">

                Discover essays grouped around
                enduring ideas rather than
                publication dates.

              </p>

            </div>

            <ThemesCloud themes={themes} />

          </div>

        </section>

      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-16">

        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
              afterthought.
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              © {new Date().getFullYear()} Afterthought.
              All rights reserved.
            </p>

          </div>

          <div className="flex flex-wrap gap-8 text-sm text-zinc-500">

            <Link
              href="/submissions"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Submissions
            </Link>

            <Link
              href="/feedback"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Feedback
            </Link>

            <Link
              href="/feed.xml"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              RSS
            </Link>

            <Link
              href="/sitemap.xml"
              className="hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Sitemap
            </Link>

          </div>

        </div>

      </footer>

    </>
  );
}
