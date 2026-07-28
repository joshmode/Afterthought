"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth";

export default function AdminDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<{ total_essays: number; published_essays: number; total_readers: number; total_views: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + "/api/editorial/stats", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  return (
    <>
      <h1 className="text-3xl font-serif text-white mb-8">Editorial Overview</h1>

      {loading ? (
        <p className="text-zinc-400">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <div className="text-sm font-mono text-zinc-500 mb-2">Total Essays</div>
            <div className="text-3xl font-serif text-white">{stats?.total_essays || 0}</div>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <div className="text-sm font-mono text-zinc-500 mb-2">Published</div>
            <div className="text-3xl font-serif text-white">{stats?.published_essays || 0}</div>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <div className="text-sm font-mono text-zinc-500 mb-2">Readers</div>
            <div className="text-3xl font-serif text-white">{stats?.total_readers || 0}</div>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
            <div className="text-sm font-mono text-zinc-500 mb-2">Total Views</div>
            <div className="text-3xl font-serif text-white">{stats?.total_views || 0}</div>
          </div>
        </div>
      )}

      <div className="mt-12">
          <Link href="/admin/essays/new" className="bg-accent-amber text-black px-6 py-3 rounded font-medium hover:bg-amber-400 transition-colors">
            Write New Essay
          </Link>
      </div>
    </>
  );
}
