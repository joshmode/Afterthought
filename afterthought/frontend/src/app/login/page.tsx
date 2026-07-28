"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace(user.is_admin ? "/admin" : "/profile");
  }, [router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const signedInUser = await login(email, password);
      router.replace(signedInUser.is_admin ? "/admin" : "/profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <h1 className="mb-2 font-serif text-4xl text-white">Welcome back</h1>
        <p className="mb-8 text-zinc-400">Continue reading where you left off.</p>
        {error && (
          <p role="alert" className="mb-5 rounded border border-red-900 bg-red-950/30 p-4 text-red-200">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-accent-amber focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-accent-amber focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-accent-amber px-6 py-3 font-medium text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-400">
          New to Afterthought?{" "}
          <Link href="/register" className="text-accent-amber hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </>
  );
}
