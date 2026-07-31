"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Series, Theme } from "@/lib/types";
import { useCallback } from "react";

interface FilterClientProps {
  themes: Theme[];
  series: Series[];
  currentThemeId?: string;
  currentSeriesId?: string;
}

export function FilterClient({ themes, series, currentThemeId, currentSeriesId }: FilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = useCallback(
    (type: "theme_id" | "series_id", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(type, value);
      } else {
        params.delete(type);
      }

      router.push(`/essays?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeSeries = series.filter(s => s.is_active);

  return (
    <div className="mb-10 flex flex-wrap gap-3 items-center" aria-label="Library filters">
      <button
        onClick={() => router.push("/essays")}
        className={`rounded-full px-5 py-2 text-sm transition-colors ${
          !currentThemeId && !currentSeriesId
            ? "bg-accent-amber text-black font-medium"
            : "border border-zinc-700 text-zinc-300 hover:border-accent-amber"
        }`}
      >
        ALL
      </button>

      <div className="relative">
        <select
          value={currentSeriesId || ""}
          onChange={(e) => handleFilterChange("series_id", e.target.value)}
          className={`appearance-none rounded-full border px-5 py-2 pr-10 text-sm outline-none transition-colors ${
            currentSeriesId
              ? "border-accent-amber text-white bg-zinc-800"
              : "border-zinc-800 text-zinc-400 bg-zinc-900 hover:border-accent-amber hover:text-white"
          }`}
          aria-label="Filter by series"
        >
          <option value="">Series</option>
          {activeSeries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>

      <div className="relative">
        <select
          value={currentThemeId || ""}
          onChange={(e) => handleFilterChange("theme_id", e.target.value)}
          className={`appearance-none rounded-full border px-5 py-2 pr-10 text-sm outline-none transition-colors ${
            currentThemeId
              ? "border-accent-amber text-white bg-zinc-800"
              : "border-zinc-800 text-zinc-400 bg-zinc-900 hover:border-accent-amber hover:text-white"
          }`}
          aria-label="Filter by theme"
        >
          <option value="">Theme</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
