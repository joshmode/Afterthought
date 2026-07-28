"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { user, status } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "anonymous") setLoading(false);
      return;
    }
    void apiFetch<Notification[]>("/api/notifications")
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [status]);

  async function markRead(id: number) {
    await apiFetch<void>(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-10 font-serif text-4xl text-white">Notifications</h1>
        {loading ? (
          <p className="text-zinc-400">Loading…</p>
        ) : !user ? (
          <p className="text-zinc-400">
            <Link href="/login" className="text-accent-amber">Sign in</Link> to view notifications.
          </p>
        ) : notifications.length ? (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`rounded border p-5 ${
                  notification.is_read
                    ? "border-zinc-800 bg-surface/20"
                    : "border-accent-amber/50 bg-accent-amber/5"
                }`}
              >
                <p className="text-zinc-200">{notification.message}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <time dateTime={notification.created_at}>
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(notification.created_at))}
                  </time>
                  {!notification.is_read && (
                    <button
                      onClick={() => void markRead(notification.id)}
                      className="text-accent-amber hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500">You have no notifications.</p>
        )}
      </main>
    </>
  );
}
