import Image from "next/image";

import type { Essay } from "@/lib/types";

interface CurrentIssuePanelProps {
  essay: Essay;
}

export function CurrentIssuePanel({
  essay,
}: CurrentIssuePanelProps) {
  return (
    <article className="mx-auto max-w-[430px]">

      {/* Cover */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">

        {essay.cover_illustration ? (

          <div className="relative aspect-[4/5]">

            <Image
              src={essay.cover_illustration}
              alt={essay.title}
              fill
              priority
              className="object-cover transition duration-700 hover:scale-[1.025]"
            />

          </div>

        ) : (

          <div className="flex aspect-[4/5] flex-col p-10">

            <div className="my-auto">

              <h2 className="font-serif text-4xl leading-tight text-white mb-6">
                {essay.title}
              </h2>

              {essay.abstract && (
                <p className="text-sm leading-relaxed text-zinc-400 mb-6 line-clamp-5">
                  {essay.abstract}
                </p>
              )}

            </div>

            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-zinc-500 mt-auto pt-6 border-t border-zinc-800">

              <span>
                issue{" "}
                {String(
                  essay.issue_number ?? 1,
                ).padStart(3, "0")}
              </span>

              {essay.publication_date && (
                <span>
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    year: "numeric",
                  }).format(new Date(essay.publication_date))}
                </span>
              )}

            </div>

          </div>

        )}

      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={`/essays/${essay.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-accent-amber px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Read Now
        </a>
      </div>

    </article>
  );
}