import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Theme } from "@/lib/types";

export function ThemesCloud({
  themes,
}: {
  themes: Theme[];
}) {
  return (
    <section
      className="py-32"
      aria-labelledby="themes-heading"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="max-w-2xl">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Themes
          </p>

          <h2
            id="themes-heading"
            className="mt-6 font-serif text-5xl leading-tight text-white"
          >
            Browse ideas by subject.
          </h2>

          <p className="mt-8 text-lg leading-8 text-zinc-400">
            Explore essays organised around recurring
            ideas rather than publication date.
          </p>

        </div>

        {/* Themes */}

        {themes.length ? (

          <div className="mt-24 grid gap-x-20 md:grid-cols-2">

            {themes.map((theme) => (

              <Link
                key={theme.id}
                href={`/essays?theme_id=${theme.id}`}
                className="group flex items-center justify-between border-b border-zinc-900 py-7 transition-colors duration-300 hover:border-zinc-700"
              >

                <div>

                  <h3 className="font-serif text-3xl text-white transition-colors duration-300 group-hover:text-zinc-200">

                    {theme.name}

                  </h3>

                </div>

                <ArrowUpRight
                  size={18}
                  className="text-zinc-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white"
                />

              </Link>

            ))}

          </div>

        ) : (

          <div className="mt-24 border-y border-zinc-900 py-16">

            <p className="text-lg text-zinc-500">
              Themes will appear here as the publication grows.
            </p>

          </div>

        )}

      </div>
    </section>
  );
}