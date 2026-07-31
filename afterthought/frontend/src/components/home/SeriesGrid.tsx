"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Series } from "@/lib/types";

interface SeriesGridProps {
  series: Series[];
}

export function SeriesGrid({ series }: SeriesGridProps) {
  const [expanded, setExpanded] = useState(false);

  if (!series.length) {
    return (
      <p className="text-zinc-500">
        Editorial series are currently being prepared.
      </p>
    );
  }

  const visibleSeries = expanded ? series : series.slice(0, 3);
  const showExpandButton = series.length >= 3;

  return (
    <div>
      <div className="grid gap-10 md:grid-cols-3">
        {visibleSeries.map((item) => (
          <Link
            key={item.id}
            href={`/essays?series_id=${item.id}`}
            className="group border-t border-zinc-800 pt-8 transition-colors"
          >
            <h3 className="font-serif text-3xl text-zinc-100 transition-colors group-hover:text-accent-amber">
              {item.name}
            </h3>
            <p className="mt-4 leading-7 text-zinc-400 line-clamp-3">
              {item.description ?? "Explore this editorial collection."}
            </p>
            <div className="mt-8 text-sm text-zinc-500 transition group-hover:text-white">
              Explore →
            </div>
          </Link>
        ))}
      </div>

      {showExpandButton && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-6 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show All <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
