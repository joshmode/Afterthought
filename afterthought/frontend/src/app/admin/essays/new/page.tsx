"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { RichEditor } from "@/components/admin/RichEditor";
import { apiFetch } from "@/lib/api";
import type { Essay, Series, Theme } from "@/lib/types";

type SaveAction = "draft" | "publish" | "schedule";

export default function NewEssayPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [abstract, setAbstract] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [themeIds, setThemeIds] = useState<number[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [series, setSeries] = useState<Series[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [saving, setSaving] = useState<SaveAction | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      apiFetch<Series[]>("/api/series/"),
      apiFetch<Theme[]>("/api/themes/"),
    ]).then(([seriesItems, themeItems]) => {
      setSeries(seriesItems);
      setThemes(themeItems);
    });
  }, []);

  async function save(action: SaveAction) {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    if (action !== "draft" && !content.replace(/<[^>]+>/g, "").trim()) {
      setError("Content is required to publish or schedule.");
      return;
    }
    if (action === "schedule" && !scheduledDate) {
      setError("Choose a future publication date.");
      return;
    }
    setSaving(action);
    setError("");
    try {
      const essay = await apiFetch<Essay>("/api/essays/", {
        method: "POST",
        body: JSON.stringify({
          title,
          slug,
          content,
          abstract: abstract || null,
          reading_time_minutes: Math.max(
            1,
            Math.ceil(content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200),
          ),
          series_id: seriesId ? Number(seriesId) : null,
          theme_ids: themeIds,
        }),
      });
      if (action !== "draft") {
        await apiFetch(`/api/editorial/essays/${essay.id}/publish`, {
          method: "POST",
          body: JSON.stringify({
            publish_now: action === "publish",
            scheduled_date: action === "schedule" ? scheduledDate : null,
          }),
        });
      }
      router.push("/admin/essays");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The essay could not be saved.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section aria-labelledby="new-essay-heading">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 id="new-essay-heading" className="font-serif text-3xl text-white">New essay</h1>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void save("draft")}
            disabled={saving !== null}
            className="rounded px-4 py-2 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => void save("schedule")}
            disabled={saving !== null}
            className="rounded border border-accent-amber px-4 py-2 text-accent-amber hover:bg-accent-amber/10 disabled:opacity-50"
          >
            {saving === "schedule" ? "Scheduling…" : "Schedule"}
          </button>
          <button
            type="button"
            onClick={() => void save("publish")}
            disabled={saving !== null}
            className="rounded bg-accent-amber px-6 py-2 font-medium text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {saving === "publish" ? "Publishing…" : "Publish now"}
          </button>
        </div>
      </div>
      {error && <div role="alert" className="mb-6 rounded bg-red-500/10 p-4 text-red-300">{error}</div>}
      <div className="space-y-6">
        <div>
          <label htmlFor="essay-title" className="sr-only">Essay title</label>
          <input
            id="essay-title"
            required
            maxLength={250}
            placeholder="Essay title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setSlug(
                event.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
              );
            }}
            className="w-full border-b border-zinc-800 bg-transparent pb-4 font-serif text-4xl text-white focus:border-accent-amber focus:outline-none"
          />
        </div>
        <div className="flex items-center text-sm font-mono text-zinc-500">
          <label htmlFor="essay-slug">/essays/</label>
          <input
            id="essay-slug"
            required
            value={slug}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            onChange={(event) => setSlug(event.target.value)}
            className="ml-1 flex-1 border-b border-zinc-800 bg-transparent text-zinc-300 focus:border-accent-amber focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="essay-abstract" className="mb-2 block text-sm text-zinc-300">Abstract</label>
          <textarea
            id="essay-abstract"
            maxLength={2000}
            value={abstract}
            onChange={(event) => setAbstract(event.target.value)}
            className="min-h-24 w-full rounded border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-300 focus:border-accent-amber focus:outline-none"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="text-sm text-zinc-300">
            Series
            <select
              value={seriesId}
              onChange={(event) => setSeriesId(event.target.value)}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            >
              <option value="">No series</option>
              {series.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-zinc-300">
            Themes
            <select
              multiple
              value={themeIds.map(String)}
              onChange={(event) =>
                setThemeIds(
                  Array.from(event.target.selectedOptions, (option) => Number(option.value)),
                )
              }
              className="mt-2 h-28 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm text-zinc-300">
            Scheduled publication
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
            />
          </label>
        </div>
        <div>
          <p className="mb-2 text-sm text-zinc-300">Essay content</p>
          <RichEditor value={content} onChange={setContent} />
        </div>
      </div>
    </section>
  );
}
