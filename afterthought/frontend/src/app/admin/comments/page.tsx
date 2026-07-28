"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

interface AdminComment {
  id: number;
  content: string;
  is_approved: boolean;
  created_at: string;
  user_id: number;
  essay_id: number;
  author_name: string;
}

export default function AdminComments() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<AdminComment[]>("/api/engagement/admin/comments")
      .then(setComments)
      .catch(() => setError("The moderation queue could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function approve(id: number) {
    try {
      const updated = await apiFetch<AdminComment>(
        `/api/engagement/admin/comments/${id}/approve`,
        { method: "POST" },
      );
      setComments((items) => items.map((item) => (item.id === id ? updated : item)));
    } catch {
      setError("The comment could not be approved.");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Permanently delete this comment?")) return;
    try {
      await apiFetch<void>(`/api/engagement/admin/comments/${id}`, {
        method: "DELETE",
      });
      setComments((items) => items.filter((item) => item.id !== id));
    } catch {
      setError("The comment could not be deleted.");
    }
  }

  return (
    <section aria-labelledby="moderation-heading">
      <h1 id="moderation-heading" className="mb-8 font-serif text-3xl text-white">
        Comment moderation
      </h1>
      {error && <p role="alert" className="mb-6 text-red-300">{error}</p>}
      {loading ? (
        <p className="font-mono text-zinc-500">Loading queue…</p>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-surface/30 p-12 text-center font-mono text-zinc-500">
          The moderation queue is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-lg border border-zinc-800 bg-surface/30 p-6">
              <div className="mb-4 flex flex-wrap justify-between gap-3">
                <div>
                  <div className="mb-1 font-mono text-xs text-zinc-500">
                    Essay #{comment.essay_id} · {comment.author_name} ·{" "}
                    <time dateTime={comment.created_at}>
                      {new Date(comment.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-zinc-300">{comment.content}</p>
                </div>
                <span className={`h-fit rounded px-2 py-1 font-mono text-xs ${
                  comment.is_approved
                    ? "bg-green-500/20 text-green-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {comment.is_approved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-5 border-t border-zinc-800 pt-4">
                {!comment.is_approved && (
                  <button onClick={() => void approve(comment.id)} className="text-sm text-green-400 hover:text-green-300">
                    Approve
                  </button>
                )}
                <button onClick={() => void remove(comment.id)} className="text-sm text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
