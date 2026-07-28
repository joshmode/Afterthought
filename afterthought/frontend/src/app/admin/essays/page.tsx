"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiFetch } from "@/lib/api";
import type { EssaySummary } from "@/lib/types";

export default function EditorialEssaysPage() {
  const [essays, setEssays] = useState<EssaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<EssaySummary[]>("/api/editorial/essays")
      .then(setEssays)
      .catch(() => setError("Essays could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function publish(id: number) {
    try {
      await apiFetch(`/api/editorial/essays/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({ publish_now: true }),
      });
      const refreshed = await apiFetch<EssaySummary[]>("/api/editorial/essays");
      setEssays(refreshed);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Publishing failed.");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Permanently delete this unpublished essay?")) return;
    try {
      await apiFetch<void>(`/api/editorial/essays/${id}`, { method: "DELETE" });
      setEssays((items) => items.filter((item) => item.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Deletion failed.");
    }
  }

  return (
    <section aria-labelledby="essays-admin-heading">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 id="essays-admin-heading" className="font-serif text-3xl text-white">Essays</h1>
        <Link href="/admin/essays/new" className="rounded bg-accent-amber px-5 py-2 font-medium text-black">
          New essay
        </Link>
      </div>
      {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
      {loading ? (
        <p className="text-zinc-400">Loading…</p>
      ) : essays.length ? (
        <div className="overflow-x-auto rounded border border-zinc-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">All editorial essays</caption>
            <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th scope="col" className="px-5 py-4">Title</th>
                <th scope="col" className="px-5 py-4">Status</th>
                <th scope="col" className="px-5 py-4">Updated</th>
                <th scope="col" className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {essays.map((essay) => (
                <tr key={essay.id}>
                  <td className="px-5 py-4 font-serif text-lg text-white">{essay.title}</td>
                  <td className="px-5 py-4 capitalize text-zinc-400">{essay.status}</td>
                  <td className="px-5 py-4 text-zinc-500">
                    <time dateTime={essay.updated_at}>
                      {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                        new Date(essay.updated_at),
                      )}
                    </time>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link href={`/admin/essays/${essay.id}`} className="text-accent-amber hover:underline">
                        Edit
                      </Link>
                      {essay.status === "draft" && (
                        <button onClick={() => void publish(essay.id)} className="text-green-400 hover:underline">
                          Publish
                        </button>
                      )}
                      {["draft", "scheduled"].includes(essay.status) && (
                        <button onClick={() => void remove(essay.id)} className="text-red-400 hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-zinc-500">No essays have been created.</p>
      )}
    </section>
  );
}
