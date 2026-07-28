"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

interface Submission {
  id: number;
  author_name: string;
  author_email: string;
  title: string;
  content: string;
  status: "pending" | "in_review" | "accepted" | "rejected";
  reviewer_notes: string | null;
  created_at: string;
}

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Submission[]>("/api/editorial/submissions")
      .then(setItems)
      .catch(() => setError("Submissions could not be loaded."));
  }, []);

  async function setStatus(item: Submission, status: Submission["status"]) {
    try {
      const updated = await apiFetch<Submission>(`/api/editorial/submissions/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewer_notes: item.reviewer_notes }),
      });
      setItems((current) => current.map((candidate) => candidate.id === item.id ? updated : candidate));
    } catch {
      setError("The submission status could not be updated.");
    }
  }

  return (
    <section aria-labelledby="submissions-heading">
      <h1 id="submissions-heading" className="mb-8 font-serif text-3xl text-white">Submissions</h1>
      {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
      {items.length ? (
        <div className="space-y-6">
          {items.map((item) => (
            <article key={item.id} className="rounded border border-zinc-800 bg-surface/30 p-6">
              <div className="mb-4 flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-white">{item.title}</h2>
                  <p className="text-sm text-zinc-500">
                    {item.author_name} · <a href={`mailto:${item.author_email}`} className="hover:text-accent-amber">{item.author_email}</a>
                  </p>
                </div>
                <span className="h-fit rounded bg-zinc-800 px-3 py-1 text-xs capitalize text-zinc-300">{item.status.replace("_", " ")}</span>
              </div>
              <details className="mb-5">
                <summary className="cursor-pointer text-sm text-accent-amber">Read submission</summary>
                <p className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded bg-zinc-950 p-5 text-zinc-300">{item.content}</p>
              </details>
              <label className="block text-sm text-zinc-300">
                Internal notes
                <textarea
                  value={item.reviewer_notes ?? ""}
                  onChange={(event) =>
                    setItems((current) => current.map((candidate) =>
                      candidate.id === item.id
                        ? { ...candidate, reviewer_notes: event.target.value || null }
                        : candidate,
                    ))
                  }
                  className="mt-2 min-h-20 w-full rounded border border-zinc-700 bg-zinc-900 p-3"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["in_review", "accepted", "rejected"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => void setStatus(item, status)}
                    className="rounded border border-zinc-700 px-4 py-2 text-sm capitalize hover:border-accent-amber"
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">No submissions are waiting.</p>
      )}
    </section>
  );
}
