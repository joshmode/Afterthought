import Link from "next/link";

import type { Theme } from "@/lib/types";

export function ThemesCloud({ themes }: { themes: Theme[] }) {
  return (
    <section className="py-24" aria-labelledby="themes-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 id="themes-heading" className="mb-4 font-serif text-4xl text-white">
            Explore themes
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            Filter the library by a subject that sparks your curiosity.
          </p>
        </div>
        {themes.length ? (
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
            {themes.map((theme) => (
              <Link
                key={theme.id}
                href={`/essays?theme_id=${theme.id}`}
                className="rounded-full border border-border bg-surface px-6 py-3 text-zinc-300 transition-all hover:border-accent-amber hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber motion-safe:hover:scale-105"
              >
                {theme.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500">Themes will appear here soon.</p>
        )}
      </div>
    </section>
  );
}
