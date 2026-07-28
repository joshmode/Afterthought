"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";

interface Theme {
  id: number;
  name: string;
  description: string | null;
}

export default function AdminThemes() {
  const { token } = useAuthStore();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeDesc, setNewThemeDesc] = useState("");

  useEffect(() => {
    const fetchThemes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/themes/`);
        if (res.ok) setThemes(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThemeName) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/themes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newThemeName, description: newThemeDesc })
      });
      if (res.ok) {
        const newTheme = await res.json();
        setThemes(prev => [...prev, newTheme]);
      }
      setNewThemeName("");
      setNewThemeDesc("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Theme Management</h1>

      <form onSubmit={handleCreate} className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 mb-8 space-y-4 max-w-md">
        <h2 className="text-xl font-serif text-white">Create New Theme</h2>
        <input
          type="text" placeholder="Theme Name" value={newThemeName} onChange={e => setNewThemeName(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-accent-amber focus:outline-none"
        />
        <input
          type="text" placeholder="Description (optional)" value={newThemeDesc} onChange={e => setNewThemeDesc(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:border-accent-amber focus:outline-none"
        />
        <button type="submit" className="bg-accent-amber text-black px-4 py-2 rounded font-medium hover:bg-amber-400">Add Theme</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-zinc-400">Loading...</p> : themes.map(t => (
          <div key={t.id} className="border border-zinc-800 p-4 rounded-lg bg-surface/30">
            <h3 className="font-serif text-xl text-white">{t.name}</h3>
            {t.description && <p className="text-sm text-zinc-400 mt-2">{t.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
