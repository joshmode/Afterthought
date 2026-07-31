"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

import type { Theme } from "@/lib/types";

export function ThemesCloud({
  themes,
}: {
  themes: Theme[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialDisplayCount = 3;

  const hasMore = themes.length > initialDisplayCount;
  const displayedThemes = isExpanded
    ? themes
    : themes.slice(0, initialDisplayCount);

  if (themes.length === 0) {
    return (
      <div className="border-y border-zinc-900 dark:border-zinc-800 py-16">
        <p className="text-lg text-zinc-500">
          Themes will appear here as the publication grows.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="grid gap-x-20 md:grid-cols-2">
        {displayedThemes.map((theme) => (
          <Link
            key={theme.id}
            href={`/essays?theme_id=${theme.id}`}
            className="group flex items-center justify-between border-b border-zinc-900 dark:border-zinc-800 py-7 transition-colors duration-300 hover:border-zinc-700 dark:hover:border-zinc-600"
          >
            <div>
              <h3 className="font-serif text-3xl text-zinc-900 dark:text-white transition-colors duration-300 group-hover:text-zinc-600 dark:group-hover:text-zinc-200">
                {theme.name}
              </h3>
            </div>
            <ArrowUpRight
              size={18}
              className="text-zinc-400 dark:text-zinc-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-white"
            />
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            {isExpanded ? "Show Less" : "Show All"}
          </button>
        </div>
      )}
    </div>
  );
}
