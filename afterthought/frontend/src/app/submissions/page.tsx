"use client";

import { FormEvent, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { apiFetch } from "@/lib/api";

const initialForm = {
  author_name: "",
  author_email: "",
  title: "",
  content: "",
};

export default function SubmissionsPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      await apiFetch("/api/submit", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setStatus("success");
      setForm(initialForm);
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "Your submission could not be received.",
      );
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-6 font-serif text-5xl text-white">Submit an essay</h1>
        <p className="mb-10 leading-relaxed text-zinc-400">
          Send original, unpublished work for editorial review. Include the full
          draft; an editor will contact you at the address below if we want to
          continue the conversation.
        </p>
        {status === "success" && (
          <div
            role="status"
            className="mb-8 rounded border border-green-500/30 bg-green-500/10 p-4 text-green-300"
          >
            Thank you. Your essay is now in the editorial review queue.
          </div>
        )}
        {status === "error" && (
          <div
            role="alert"
            className="mb-8 rounded border border-red-500/30 bg-red-500/10 p-4 text-red-300"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="author-name" className="mb-2 block text-sm text-zinc-300">
                Your name
              </label>
              <input
                id="author-name"
                required
                maxLength={100}
                autoComplete="name"
                value={form.author_name}
                onChange={(event) =>
                  setForm({ ...form, author_name: event.target.value })
                }
                className="w-full rounded border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-accent-amber focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="author-email" className="mb-2 block text-sm text-zinc-300">
                Email
              </label>
              <input
                id="author-email"
                type="email"
                required
                autoComplete="email"
                value={form.author_email}
                onChange={(event) =>
                  setForm({ ...form, author_email: event.target.value })
                }
                className="w-full rounded border border-zinc-800 bg-zinc-900 p-3 text-zinc-100 focus:border-accent-amber focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="submission-title" className="mb-2 block text-sm text-zinc-300">
              Essay title
            </label>
            <input
              id="submission-title"
              required
              maxLength={250}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded border border-zinc-800 bg-zinc-900 p-3 font-serif text-xl text-zinc-100 focus:border-accent-amber focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="submission-content" className="mb-2 block text-sm text-zinc-300">
              Full essay
            </label>
            <textarea
              id="submission-content"
              required
              minLength={100}
              maxLength={500000}
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              className="min-h-[400px] w-full rounded border border-zinc-800 bg-zinc-900 p-4 leading-relaxed text-zinc-100 focus:border-accent-amber focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded bg-accent-amber px-8 py-3 font-medium text-black transition-colors hover:bg-amber-400 disabled:opacity-50"
          >
            {status === "submitting" ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </main>
    </>
  );
}
