"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

interface CalendarItem {
  id: number;
  title: string;
  status: string;
  publication_date: string | null;
}

export default function EditorialCalendar() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiFetch<CalendarItem[]>("/api/editorial/calendar")
      .then(setItems)
      .catch(() => setError("The editorial calendar could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section aria-labelledby="calendar-heading">
      <h1 id="calendar-heading" className="mb-8 font-serif text-3xl text-white">
        Editorial calendar
      </h1>
      {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-surface/30">
        <table className="w-full min-w-[640px] text-left text-sm text-zinc-400">
          <caption className="sr-only">Essay publication schedule</caption>
          <thead className="border-b border-zinc-800 bg-zinc-900/80 font-mono text-xs uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Title</th>
              <th scope="col" className="px-6 py-4">Publication date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">
                  <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-xs capitalize">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-serif text-lg text-white">{item.title}</td>
                <td className="px-6 py-4 font-mono">
                  {item.publication_date ? (
                    <time dateTime={item.publication_date}>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.publication_date))}
                    </time>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-8 text-center">No essays found.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={3} className="px-6 py-8 text-center">Loading…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
