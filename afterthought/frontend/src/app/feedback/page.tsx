"use client";

import { FormEvent, useState } from "react";

import { Navbar } from "@/components/layout/Navbar";
import { apiFetch } from "@/lib/api";

export default function FeedbackPage() {
  const [form, setForm] = useState({
    email: "",
    category: "general",
    message: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    try {
      await apiFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          email: form.email || null,
          category: form.category,
          message: form.message,
        }),
      });
      setForm({ email: "", category: "general", message: "" });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-4 font-serif text-5xl text-white">Feedback</h1>
        <p className="mb-10 text-zinc-400">
          Report a bug, flag an accessibility barrier, or tell the editorial
          team what could be clearer.
        </p>
        {state === "sent" && (
          <p role="status" className="mb-6 rounded border border-green-800 p-4 text-green-300">
            Thank you. Your feedback has been received.
          </p>
        )}
        {state === "error" && (
          <p role="alert" className="mb-6 rounded border border-red-800 p-4 text-red-300">
            Feedback could not be sent. Please try again.
          </p>
        )}
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="feedback-category" className="mb-2 block text-sm text-zinc-300">
              Category
            </label>
            <select
              id="feedback-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-white"
            >
              <option value="general">General</option>
              <option value="bug">Bug</option>
              <option value="accessibility">Accessibility</option>
              <option value="editorial">Editorial</option>
            </select>
          </div>
          <div>
            <label htmlFor="feedback-email" className="mb-2 block text-sm text-zinc-300">
              Email <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              id="feedback-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded border border-zinc-700 bg-zinc-900 p-3 text-white focus:border-accent-amber focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="feedback-message" className="mb-2 block text-sm text-zinc-300">
              Message
            </label>
            <textarea
              id="feedback-message"
              required
              minLength={10}
              maxLength={5000}
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
              className="min-h-48 w-full rounded border border-zinc-700 bg-zinc-900 p-4 text-white focus:border-accent-amber focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded bg-accent-amber px-7 py-3 font-medium text-black disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Send feedback"}
          </button>
        </form>
      </main>
    </>
  );
}
