"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

interface Feedback {
  id: number;
  email: string | null;
  category: string;
  message: string;
  status: "new" | "reviewed" | "resolved";
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<Feedback[]>("/api/editorial/feedback")
      .then(setItems)
      .catch(() => setError("Feedback could not be loaded."));
  }, []);

  async function updateStatus(item: Feedback, status: Feedback["status"]) {
    try {
      const updated = await apiFetch<Feedback>(`/api/editorial/feedback/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setItems((current) => current.map((candidate) => candidate.id === item.id ? updated : candidate));
    } catch {
      setError("Feedback status could not be updated.");
    }
  }

  return (
    <section aria-labelledby="feedback-admin-heading">
      <h1 id="feedback-admin-heading" className="mb-8 font-serif text-3xl text-white">Reader feedback</h1>
      {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
      {items.length ? (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded border border-zinc-800 bg-surface/30 p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-accent-amber">{item.category}</span>
                <time className="text-xs text-zinc-500" dateTime={item.created_at}>
                  {new Date(item.created_at).toLocaleString()}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-zinc-300">{item.message}</p>
              {item.email && <a href={`mailto:${item.email}`} className="mt-3 block text-sm text-zinc-500 hover:text-accent-amber">{item.email}</a>}
              <div className="mt-5 flex gap-3 border-t border-zinc-800 pt-4">
                {(["reviewed", "resolved"] as const).map((status) => (
                  <button key={status} onClick={() => void updateStatus(item, status)} className="rounded border border-zinc-700 px-3 py-1 text-sm capitalize hover:border-accent-amber">
                    Mark {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500">No feedback has been received.</p>
      )}
    </section>
  );
}
