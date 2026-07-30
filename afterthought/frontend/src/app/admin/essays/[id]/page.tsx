"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { RichEditor } from "@/components/admin/RichEditor";
import { apiFetch } from "@/lib/api";
import type { Essay, Series, Theme } from "@/lib/types";

export default function EditEssayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themeIds, setThemeIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void Promise.all([
      apiFetch<Essay>(`/api/editorial/essays/${id}`),
      apiFetch<Series[]>("/api/series/"),
      apiFetch<Theme[]>("/api/themes/"),
    ])
      .then(([loadedEssay, seriesItems, themeItems]) => {
        setEssay(loadedEssay);
        setThemeIds(loadedEssay.themes.map((theme) => theme.id));
        setSeries(seriesItems);
        setThemes(themeItems);
      })
      .catch(() => setMessage("The essay could not be loaded."));
  }, [id]);

  async function save() {
    if (!essay) return;
    if (!essay.title.trim() || !essay.slug.trim()) {
      setMessage("Title and slug are required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const updated = await apiFetch<Essay>(`/api/editorial/essays/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: essay.title,
          slug: essay.slug,
          abstract: essay.abstract,
          content: essay.content,
          reading_time_minutes: essay.reading_time_minutes,
          featured_quote: essay.featured_quote,
          canonical_url: essay.canonical_url,
          seo_title: essay.seo_title,
          seo_description: essay.seo_description,
          series_id: essay.series?.id ?? null,
          theme_ids: themeIds,
        }),
      });
      setEssay(updated);
      setThemeIds(updated.themes.map((theme) => theme.id));
      setMessage("Changes saved. A content revision was recorded.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "The essay could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (!essay) return <p className="text-zinc-400" aria-live="polite">{message || "Loading essay…"}</p>;

  return (
    <section aria-labelledby="edit-essay-heading">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 id="edit-essay-heading" className="font-serif text-3xl text-white">Edit essay</h1>
          <p className="mt-1 text-sm capitalize text-zinc-500">Status: {essay.status}</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="rounded px-4 py-2 text-zinc-300">
            Cancel
          </button>
          <button type="button" onClick={() => void save()} disabled={saving} className="rounded bg-accent-amber px-6 py-2 font-medium text-black disabled:opacity-50">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
      {message && <p role="status" className="mb-5 text-zinc-300">{message}</p>}
      <div className="space-y-6">
        <label className="block text-sm text-zinc-300">
          Title
          <input
            value={essay.title}
            onChange={(event) => setEssay({ ...essay, title: event.target.value })}
            className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3 font-serif text-2xl text-white"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Slug
          <input
            value={essay.slug}
            onChange={(event) => setEssay({ ...essay, slug: event.target.value })}
            className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3 font-mono text-white"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Abstract
          <textarea
            value={essay.abstract ?? ""}
            onChange={(event) => setEssay({ ...essay, abstract: event.target.value || null })}
            className="mt-2 min-h-24 w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-white"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-zinc-300">
            Series
            <select
              value={essay.series?.id ?? ""}
              onChange={(event) => {
                const item = series.find((candidate) => candidate.id === Number(event.target.value));
                setEssay({
                  ...essay,
                  series: item ? { id: item.id, name: item.name } : null,
                });
              }}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            >
              <option value="">No series</option>
              {series.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-sm text-zinc-300">
            Themes
            <select
              multiple
              value={themeIds.map(String)}
              onChange={(event) =>
                setThemeIds(Array.from(event.target.selectedOptions, (option) => Number(option.value)))
              }
              className="mt-2 h-28 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            >
              {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-zinc-300">
            SEO title
            <input
              maxLength={70}
              value={essay.seo_title ?? ""}
              onChange={(event) => setEssay({ ...essay, seo_title: event.target.value || null })}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Canonical URL
            <input
              type="url"
              value={essay.canonical_url ?? ""}
              onChange={(event) => setEssay({ ...essay, canonical_url: event.target.value || null })}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            />
          </label>
        </div>
        <label className="block text-sm text-zinc-300">
          SEO description
          <textarea
            maxLength={170}
            value={essay.seo_description ?? ""}
            onChange={(event) => setEssay({ ...essay, seo_description: event.target.value || null })}
            className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
          />
        </label>
        <div>
          <p className="mb-2 text-sm text-zinc-300">Content</p>
          <RichEditor
            value={essay.content}
            onChange={(content) => setEssay((current) => current ? { ...current, content } : current)}
          />
        </div>
      </div>
    </section>
  );
}
