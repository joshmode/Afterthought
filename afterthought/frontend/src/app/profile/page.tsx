"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

interface Preferences {
  email_notifications: boolean;
  anonymous_posting: boolean;
  font_size_preference: "small" | "medium" | "large";
  theme_preference: "system" | "dark" | "light";
}

interface HistoryItem {
  id: number;
  progress_percent: number;
  last_read_at: string;
  essay: { title: string; slug: string };
}

interface BookmarkItem {
  id: number;
  created_at: string;
  essay: { title: string; slug: string; reading_time_minutes: number | null };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, status, logout } = useAuthStore();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "anonymous") setLoading(false);
      return;
    }
    Promise.all([
      apiFetch<Preferences>("/api/reader/preferences"),
      apiFetch<HistoryItem[]>("/api/reader/history"),
      apiFetch<BookmarkItem[]>("/api/engagement/bookmarks"),
    ])
      .then(([nextPreferences, nextHistory, nextBookmarks]) => {
        setPreferences(nextPreferences);
        setHistory(nextHistory);
        setBookmarks(nextBookmarks);
      })
      .catch(() => setError("Your reading data could not be loaded."))
      .finally(() => setLoading(false));
  }, [status]);

  async function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    if (!preferences) return;
    const previous = preferences;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    try {
      setPreferences(
        await apiFetch<Preferences>("/api/reader/preferences", {
          method: "PUT",
          body: JSON.stringify({ [key]: value }),
        }),
      );
    } catch {
      setPreferences(previous);
      setError("That preference could not be saved.");
    }
  }

  async function signOut() {
    await logout();
    router.push("/");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        {status === "loading" || loading ? (
          <p className="font-mono text-zinc-400" aria-live="polite">
            Loading your profile…
          </p>
        ) : !user ? (
          <div className="rounded border border-zinc-800 p-10 text-center">
            <p className="mb-5 text-zinc-400">Sign in to view your reading profile.</p>
            <Link href="/login" className="rounded bg-accent-amber px-5 py-3 text-black">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-zinc-800 pb-5">
              <div>
                <h1 className="font-serif text-4xl text-white">
                  {user.display_name ?? "Your profile"}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
              </div>
              <div className="flex gap-4">
                <Link href="/notifications" className="text-sm text-zinc-300 hover:text-accent-amber">
                  Notifications
                </Link>
                <button onClick={() => void signOut()} className="text-sm text-red-400 hover:text-red-300">
                  Sign out
                </button>
              </div>
            </div>
            {error && <p role="alert" className="mb-6 text-red-300">{error}</p>}
            <div className="grid gap-12 md:grid-cols-3">
              <section className="space-y-6" aria-labelledby="preferences-heading">
                <h2 id="preferences-heading" className="font-serif text-2xl text-zinc-200">
                  Preferences
                </h2>
                {preferences && (
                  <div className="space-y-5 rounded-lg border border-zinc-800 bg-surface/30 p-6">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.email_notifications}
                        onChange={(event) =>
                          void updatePreference("email_notifications", event.target.checked)
                        }
                      />
                      <span className="text-sm text-zinc-300">Email notifications</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={preferences.anonymous_posting}
                        onChange={(event) =>
                          void updatePreference("anonymous_posting", event.target.checked)
                        }
                      />
                      <span className="text-sm text-zinc-300">Post comments anonymously</span>
                    </label>
                    <label className="block text-sm text-zinc-300">
                      Reading size
                      <select
                        value={preferences.font_size_preference}
                        onChange={(event) =>
                          void updatePreference(
                            "font_size_preference",
                            event.target.value as Preferences["font_size_preference"],
                          )
                        }
                        className="mt-2 w-full rounded border border-zinc-700 bg-zinc-900 p-2"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </label>
                  </div>
                )}
              </section>
              <div className="space-y-12 md:col-span-2">
                <section aria-labelledby="bookmarks-heading">
                  <h2 id="bookmarks-heading" className="mb-6 font-serif text-2xl text-zinc-200">
                    Saved bookmarks
                  </h2>
                  {bookmarks.length ? (
                    <ul className="space-y-3">
                      {bookmarks.map((bookmark) => (
                        <li key={bookmark.id}>
                          <Link
                            href={`/essays/${bookmark.essay.slug}`}
                            className="flex justify-between gap-4 rounded border border-zinc-800 bg-surface/30 p-4 hover:border-accent-amber"
                          >
                            <span className="font-serif text-lg text-zinc-200">
                              {bookmark.essay.title}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {bookmark.essay.reading_time_minutes
                                ? `${bookmark.essay.reading_time_minutes} min`
                                : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                      You have not bookmarked an essay yet.
                    </p>
                  )}
                </section>
                <section aria-labelledby="history-heading">
                  <h2 id="history-heading" className="mb-6 font-serif text-2xl text-zinc-200">
                    Reading history
                  </h2>
                  {history.length ? (
                    <ul className="space-y-3">
                      {history.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/essays/${item.essay.slug}`}
                            className="block rounded border border-zinc-800 bg-surface/30 p-4 hover:border-accent-amber"
                          >
                            <div className="mb-3 flex justify-between gap-4">
                              <span className="font-serif text-lg text-zinc-200">
                                {item.essay.title}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {item.progress_percent}% read
                              </span>
                            </div>
                            <div className="h-1 overflow-hidden rounded bg-zinc-800">
                              <div
                                className="h-full bg-accent-amber"
                                style={{ width: `${item.progress_percent}%` }}
                              />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                      Your reading history is empty.
                    </p>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
