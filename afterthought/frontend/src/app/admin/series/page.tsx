"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";

interface Series {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

export default function AdminSeries() {
  const { token } = useAuthStore();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/series/`);
        if (res.ok) setSeries(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/series/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, description: newDesc, is_active: true })
      });
      if (res.ok) {
        const s = await res.json();
        setSeries(prev => [...prev, s]);
      }
      setNewName("");
      setNewDesc("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Series Management</h1>

      <form onSubmit={handleCreate} className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 mb-8 space-y-4 max-w-md">
        <h2 className="text-xl font-serif text-white">Create New Series</h2>
        <input
          type="text" placeholder="Series Name" value={newName} onChange={e => setNewName(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-accent-amber focus:outline-none"
        />
        <textarea
          placeholder="Description" value={newDesc} onChange={e => setNewDesc(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-accent-amber focus:outline-none"
        />
        <button type="submit" className="bg-accent-amber text-black px-4 py-2 rounded font-medium hover:bg-amber-400">Add Series</button>
      </form>

      <div className="space-y-4">
        {loading ? <p className="text-zinc-400">Loading...</p> : series.map(s => (
          <div key={s.id} className="border border-zinc-800 p-6 rounded-lg bg-surface/30 flex justify-between items-start">
            <div>
              <h3 className="font-serif text-2xl text-white">{s.name}</h3>
              {s.description && <p className="text-zinc-400 mt-2 max-w-2xl">{s.description}</p>}
            </div>
            <span className={`text-xs font-mono px-2 py-1 rounded ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {s.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
