"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Theme } from "@/lib/types";

export default function AdminThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Theme[]>("/api/themes/")
      .then(setThemes)
      .catch(() => setError("Themes could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function createTheme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const theme = await apiFetch<Theme>("/api/themes/", {
        method: "POST",
        body: JSON.stringify({ name, description: description || null }),
      });
      setThemes((items) => [...items, theme].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setDescription("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Theme creation failed.");
    }
  }

  return (
    <section aria-labelledby="themes-admin-heading">
      <h1 id="themes-admin-heading" className="mb-8 font-serif text-3xl text-white">
        Theme management
      </h1>
      {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
      <form onSubmit={createTheme} className="mb-8 max-w-md space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="font-serif text-xl text-white">Create theme</h2>
        <div>
          <label htmlFor="theme-name" className="mb-1 block text-sm text-zinc-300">Name</label>
          <input
            id="theme-name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white focus:border-accent-amber focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="theme-description" className="mb-1 block text-sm text-zinc-300">Description</label>
          <input
            id="theme-description"
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white focus:border-accent-amber focus:outline-none"
          />
        </div>
        <button type="submit" className="rounded bg-accent-amber px-4 py-2 font-medium text-black hover:bg-amber-400">
          Add theme
        </button>
      </form>
      {loading ? (
        <p className="text-zinc-400">Loading…</p>
      ) : themes.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <article key={theme.id} className="rounded-lg border border-zinc-800 bg-surface/30 p-4">
              <h2 className="font-serif text-xl text-white">{theme.name}</h2>
              {theme.description && <p className="mt-2 text-sm text-zinc-400">{theme.description}</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">No themes have been created.</p>
      )}
    </section>
  );
}
