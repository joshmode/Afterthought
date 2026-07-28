import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { serverApiFetch } from "@/lib/server-api";
import type { Series } from "@/lib/types";

export const metadata: Metadata = { title: "Series" };
export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  let series: Series[] = [];
  let unavailable = false;
  try {
    series = await serverApiFetch<Series[]>("/api/series/", { cache: "no-store" });
  } catch {
    unavailable = true;
  }
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="mb-4 font-serif text-5xl text-white">Editorial series</h1>
        <p className="mb-12 max-w-2xl text-zinc-400">
          Recurring collections that examine an idea from more than one angle.
        </p>
        {unavailable ? (
          <p role="alert" className="text-red-300">Series are temporarily unavailable.</p>
        ) : series.length ? (
          <div className="space-y-6">
            {series.map((item) => (
              <Link
                key={item.id}
                href={`/essays?series_id=${item.id}`}
                className="block rounded-lg border border-zinc-800 bg-surface/40 p-8 hover:border-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2 className="font-serif text-3xl text-white">{item.name}</h2>
                  <span className="font-mono text-xs uppercase text-zinc-500">
                    {item.is_active ? "Active" : "Archive"}
                  </span>
                </div>
                <p className="max-w-3xl text-zinc-400">
                  {item.description ?? "Explore this editorial collection."}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No series are available yet.</p>
        )}
      </main>
    </>
  );
}
