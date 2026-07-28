"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/auth";

interface Preferences {
  email_notifications: boolean;
  anonymous_posting: boolean;
  font_size_preference: string;
  theme_preference: string;
}

export default function ProfilePage() {
  const { token, logout } = useAuthStore();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Preferences
        const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reader/preferences`, { headers });
        if (pRes.ok) setPrefs(await pRes.json());

        // Fetch History
        const hRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reader/history`, { headers });
        if (hRes.ok) setHistory(await hRes.json());

        // Fetch Bookmarks
        const bRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/engagement/bookmarks`, { headers });
        if (bRes.ok) setBookmarks(await bRes.json());

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const updatePreference = async (key: string, value: any) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reader/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newPrefs)
    });
  };

  if (!token) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center font-mono text-zinc-500">
          Please sign in to view your profile.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex justify-between items-baseline mb-12 border-b border-zinc-800 pb-4">
          <h1 className="text-4xl font-serif text-white">Your Profile</h1>
          <button onClick={logout} className="text-sm font-mono text-red-400 hover:text-red-300">Sign Out</button>
        </div>

        <div className="grid md:grid-cols-3 gap-12">

          {/* Preferences Column */}
          <div className="md:col-span-1 space-y-8">
            <h2 className="text-2xl font-serif text-zinc-200">Reading Preferences</h2>
            {loading ? <p className="text-zinc-500 font-mono">Loading...</p> : (
              <div className="space-y-6">
                <div className="bg-surface/30 border border-zinc-800 p-6 rounded-lg space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs?.email_notifications || false}
                      onChange={(e) => updatePreference('email_notifications', e.target.checked)}
                      className="form-checkbox bg-zinc-900 border-zinc-700 text-accent-amber focus:ring-accent-amber"
                    />
                    <span className="text-sm text-zinc-300">Email Notifications</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs?.anonymous_posting || false}
                      onChange={(e) => updatePreference('anonymous_posting', e.target.checked)}
                      className="form-checkbox bg-zinc-900 border-zinc-700 text-accent-amber focus:ring-accent-amber"
                    />
                    <span className="text-sm text-zinc-300">Post Comments Anonymously</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Activity Column */}
          <div className="md:col-span-2 space-y-12">

            <section>
              <h2 className="text-2xl font-serif text-zinc-200 mb-6">Saved Bookmarks</h2>
              {loading ? <p className="text-zinc-500 font-mono">Loading...</p> : bookmarks.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded p-8 text-center text-zinc-500 font-mono text-sm">
                  You haven&apos;t bookmarked any essays yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookmarks.map((b) => (
                    <div key={b.id} className="border border-zinc-800 bg-surface/30 p-4 rounded flex justify-between items-center">
                      <span className="text-zinc-300 font-serif">Essay #{b.essay_id}</span>
                      <span className="text-xs font-mono text-zinc-500">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-serif text-zinc-200 mb-6">Reading History</h2>
              {loading ? <p className="text-zinc-500 font-mono">Loading...</p> : history.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded p-8 text-center text-zinc-500 font-mono text-sm">
                  Your reading history is empty.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((h) => (
                    <div key={h.id} className="border border-zinc-800 bg-surface/30 p-4 rounded flex justify-between items-center">
                      <span className="text-zinc-300 font-serif">Essay #{h.essay_id}</span>
                      <div className="flex items-center space-x-4 text-xs font-mono text-zinc-500">
                        <span>{h.progress_percent}% read</span>
                        <span>{new Date(h.last_read_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </main>
    </>
  );
}
