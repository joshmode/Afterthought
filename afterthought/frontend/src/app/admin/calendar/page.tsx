"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth";

interface EditorialCalendarItem {
  id: number;
  title: string;
  status: string;
  publication_date: string | null;
}

export default function EditorialCalendar() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<EditorialCalendarItem[]>([]);

  useEffect(() => {
    async function fetchCalendar() {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/editorial/calendar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setItems(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    fetchCalendar();
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl font-serif text-white mb-8">Editorial Calendar</h1>
      <div className="bg-surface/30 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/80 font-mono uppercase tracking-wider text-xs border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono
                    ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : ''}
                    ${item.status === 'scheduled' ? 'bg-amber-500/20 text-amber-400' : ''}
                    ${item.status === 'draft' ? 'bg-zinc-500/20 text-zinc-400' : ''}
                    ${item.status === 'archived' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-serif text-lg text-white">{item.title}</td>
                <td className="px-6 py-4 font-mono">{item.publication_date ? new Date(item.publication_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-8 text-center">No essays found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
