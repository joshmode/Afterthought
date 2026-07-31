import Link from "next/link";

import type { Essay } from "@/lib/types";

export function EssayHero({ essay }: { essay: Essay }) {
  return (
    <header className="mb-24 border-b border-zinc-900 pb-16">

      <div className="mx-auto max-w-3xl text-center">

        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">

          {essay.publication_date && (
            <>
              <time dateTime={essay.publication_date}>
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "long",
                }).format(new Date(essay.publication_date))}
              </time>
            </>
          )}

          {essay.reading_time_minutes && (
            <>
              {" · "}
              {essay.reading_time_minutes} min read
            </>
          )}

        </p>

        <h1 className="mt-8 font-serif text-5xl leading-tight text-white md:text-7xl">

          {essay.title}

        </h1>

        {essay.abstract && (
          <p className="mx-auto mt-10 max-w-2xl text-xl leading-9 text-zinc-400">
            {essay.abstract}
          </p>
        )}

        {essay.themes.length > 0 && (
          <div className="mt-10 text-sm text-zinc-500">

            {essay.themes.map((theme, index) => (
              <span key={theme.id}>
                <Link
                  href={`/essays?theme_id=${theme.id}`}
                  className="transition-colors hover:text-white"
                >
                  {theme.name}
                </Link>

                {index < essay.themes.length - 1 && " · "}
              </span>
            ))}

          </div>
        )}

      </div>

    </header>
  );
}