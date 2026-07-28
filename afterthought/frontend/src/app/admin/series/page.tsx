"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Series } from "@/lib/types";

export default function AdminSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Series[]>("/api/series/")
      .then(setSeries)
      .catch(() => setError("Series could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function createSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const item = await apiFetch<Series>("/api/series/", {
        method: "POST",
        body: JSON.stringify({ name, description: description || null, is_active: true }),
      });
      setSeries((items) => [...items, item].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setDescription("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Series creation failed.");
    }
  }

  return (
    <section aria-labelledby="series-admin-heading">
      <h1 id="series-admin-heading" className="mb-8 font-serif text-3xl text-white">
        Series management
      </h1>
      {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
      <form onSubmit={createSeries} className="mb-8 max-w-md space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="font-serif text-xl text-white">Create series</h2>
        <div>
          <label htmlFor="series-name" className="mb-1 block text-sm text-zinc-300">Name</label>
          <input
            id="series-name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white focus:border-accent-amber focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="series-description" className="mb-1 block text-sm text-zinc-300">Description</label>
          <textarea
            id="series-description"
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white focus:border-accent-amber focus:outline-none"
          />
        </div>
        <button type="submit" className="rounded bg-accent-amber px-4 py-2 font-medium text-black hover:bg-amber-400">
          Add series
        </button>
      </form>
      {loading ? (
        <p className="text-zinc-400">Loading…</p>
      ) : series.length ? (
        <div className="space-y-4">
          {series.map((item) => (
            <article key={item.id} className="flex flex-wrap justify-between gap-4 rounded-lg border border-zinc-800 bg-surface/30 p-6">
              <div>
                <h2 className="font-serif text-2xl text-white">{item.name}</h2>
                {item.description && <p className="mt-2 max-w-2xl text-zinc-400">{item.description}</p>}
              </div>
              <span className={`h-fit rounded px-2 py-1 font-mono text-xs ${
                item.is_active ? "bg-green-500/20 text-green-400" : "bg-zinc-500/20 text-zinc-400"
              }`}>
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">No series have been created.</p>
      )}
    </section>
  );
}
