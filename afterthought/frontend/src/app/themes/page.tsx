import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { serverApiFetch } from "@/lib/server-api";
import type { Theme } from "@/lib/types";

export const metadata: Metadata = { title: "Themes" };
export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  let themes: Theme[] = [];
  let unavailable = false;
  try {
    themes = await serverApiFetch<Theme[]>("/api/themes/", { cache: "no-store" });
  } catch {
    unavailable = true;
  }
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="mb-4 font-serif text-5xl text-white">Themes</h1>
        <p className="mb-12 max-w-2xl text-zinc-400">
          Follow a question across issues and editorial series.
        </p>
        {unavailable ? (
          <p role="alert" className="text-red-300">Themes are temporarily unavailable.</p>
        ) : themes.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => (
              <Link
                key={theme.id}
                href={`/essays?theme_id=${theme.id}`}
                className="rounded-lg border border-zinc-800 bg-surface/40 p-6 hover:border-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
              >
                <h2 className="mb-2 font-serif text-2xl text-white">{theme.name}</h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {theme.description ?? "Explore essays in this theme."}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No themes have been published yet.</p>
        )}
      </main>
    </>
  );
}
