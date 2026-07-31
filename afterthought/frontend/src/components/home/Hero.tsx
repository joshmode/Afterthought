import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CurrentIssuePanel } from "@/components/home/CurrentIssuePanel";

import type { Essay } from "@/lib/types";

interface HeroProps {
  currentIssue: Essay | null;
}

export function Hero({ currentIssue }: HeroProps) {
  return (
    <section className="relative overflow-hidden">

      {/* Ambient glow */}

      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,184,76,0.05),transparent_58%)]"
      />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="grid items-start gap-24 py-36 lg:grid-cols-[1.45fr_0.55fr]">

          {/* Left Column */}

          <div className="flex flex-col">

            {/* Publication */}

            <header className="max-w-2xl">

              <h1 className="text-6xl font-black tracking-tight text-white lg:text-7xl">
                afterthought.
              </h1>

              <p className="mt-6 max-w-md text-xl leading-relaxed text-zinc-400">
                Ideas worth thinking about twice.
              </p>

            </header>

            {/* Editorial Divider */}

            <div className="mt-16 h-px w-20 bg-zinc-800" />

            {/* Editorial Copy */}

            <div className="mt-16 max-w-xl space-y-8">

              <p className="text-lg leading-8 text-zinc-400">
                Essays exploring technology,
                philosophy, politics and the ideas
                shaping modern society.
              </p>

              <p className="leading-8 text-zinc-500">
                We publish carefully researched,
                long-form writing that favours depth
                over immediacy—exploring questions
                that remain worth asking long after
                today&apos;s headlines have faded.
              </p>

            </div>

            {/* Actions */}

            <div className="mt-20 flex flex-wrap items-center gap-10">

              {currentIssue && (
                <Link
                  href={`/essays/${currentIssue.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-200"
                >
                  Read current issue

                  <ArrowRight size={17} strokeWidth={2.25} />
                </Link>
              )}

              <Link
                href="/essays"
                className="group inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
              >
                Browse archive

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

            {/* Publication Metadata */}

            <div className="mt-24 flex flex-wrap gap-10 border-t border-zinc-900 pt-8">

              <div>

                <div className="text-xs uppercase tracking-[0.3em] text-zinc-600">
                  Publication
                </div>

                <div className="mt-2 text-sm text-zinc-400">
                  Independent editorial journal
                </div>

              </div>

              <div>

                <div className="text-xs uppercase tracking-[0.3em] text-zinc-600">
                  Focus
                </div>

                <div className="mt-2 text-sm text-zinc-400">
                  Technology · Society · Philosophy
                </div>

              </div>

            </div>

          </div>

          {/* Right Column */}

          {currentIssue && (

            <aside className="pt-10 lg:pt-20">

              <CurrentIssuePanel essay={currentIssue} />

            </aside>

          )}

        </div>

      </div>

    </section>
  );
}