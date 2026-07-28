"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await register(form.email, form.password, form.displayName);
      router.push("/login?registered=1");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="mb-2 font-serif text-4xl text-white">Create an account</h1>
        <p className="mb-8 text-zinc-400">
          Save essays, keep your place, and join moderated discussions.
        </p>
        {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="display-name" className="mb-2 block text-sm text-zinc-300">
              Display name
            </label>
            <input
              id="display-name"
              required
              maxLength={100}
              autoComplete="name"
              value={form.displayName}
              onChange={(event) =>
                setForm({ ...form, displayName: event.target.value })
              }
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-accent-amber focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm text-zinc-300">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-accent-amber focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm text-zinc-300">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-accent-amber focus:outline-none"
              aria-describedby="password-help"
            />
            <p id="password-help" className="mt-2 text-xs text-zinc-500">
              Use at least 12 characters.
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-accent-amber px-6 py-3 font-medium text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-400">
          Already registered?{" "}
          <Link href="/login" className="text-accent-amber hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </>
  );
}
