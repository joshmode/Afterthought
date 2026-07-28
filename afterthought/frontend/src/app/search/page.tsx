import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Afterthought essays.",
};

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 py-16">
        <h1 className="mb-4 font-serif text-5xl text-white">Search</h1>
        <p className="mb-8 text-zinc-400">
          Search titles, abstracts, and the full text of every published essay.
        </p>
        <form role="search" action="/essays" className="flex gap-3">
          <label htmlFor="site-search" className="sr-only">
            Search essays
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            required
            minLength={2}
            maxLength={100}
            autoFocus
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4 text-lg text-white focus:border-accent-amber focus:outline-none"
            placeholder="What are you thinking about?"
          />
          <button
            className="rounded-lg bg-accent-amber px-6 py-4 font-medium text-black hover:bg-amber-400"
            type="submit"
          >
            Search
          </button>
        </form>
      </main>
    </>
  );
}
