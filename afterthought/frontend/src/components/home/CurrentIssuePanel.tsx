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

            <div>

              <p className="text-lg font-black tracking-tight text-white">
                afterthought.
              </p>

            </div>

            <div className="my-auto">

              <div className="mb-10 h-px bg-zinc-800" />

              <h2 className="font-serif text-4xl leading-tight text-white">
                {essay.title}
              </h2>

              <div className="mt-10 h-px bg-zinc-800" />

            </div>

            <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-zinc-500">

              <span>
                issue{" "}
                {String(
                  essay.issue_number ?? 1,
                ).padStart(3, "0")}
              </span>

              <span>afterthought.</span>

            </div>

          </div>

        )}

      </div>

      {/* Editorial information */}

      <div className="mt-12">

        <div className="text-xs uppercase tracking-[0.3em] text-zinc-600">
          Current issue
        </div>

        <h2 className="mt-4 font-serif text-4xl leading-tight text-white">
          {essay.title}
        </h2>

        {essay.featured_quote && (

          <blockquote className="mt-8 border-l border-zinc-700 pl-6 font-serif text-2xl italic leading-relaxed text-zinc-300">

            “{essay.featured_quote}”

          </blockquote>

        )}

        <div className="mt-10 flex flex-wrap gap-6 text-xs uppercase tracking-[0.28em] text-zinc-500">

          {essay.issue_number && (

            <span>
              issue {String(essay.issue_number).padStart(3, "0")}
            </span>

          )}

          {essay.reading_time_minutes && (

            <span>
              {essay.reading_time_minutes} min read
            </span>

          )}

        </div>

      </div>

    </article>
  );
}