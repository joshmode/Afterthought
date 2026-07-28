"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();

  if (!token) return <div className="p-8 text-white text-center">Not Authorized</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 min-h-[calc(100vh-64px)] p-6 hidden md:block">
          <nav className="space-y-4 font-mono text-sm">
            <Link href="/admin" className="block text-zinc-400 hover:text-white transition-colors">Overview</Link>
            <Link href="/admin/essays/new" className="block text-zinc-400 hover:text-white transition-colors">New Essay</Link>
            <Link href="/admin/calendar" className="block text-zinc-400 hover:text-white transition-colors">Calendar</Link>
            <Link href="/admin/themes" className="block text-zinc-400 hover:text-white transition-colors">Themes</Link>
            <Link href="/admin/series" className="block text-zinc-400 hover:text-white transition-colors">Series</Link>
            <Link href="/admin/comments" className="block text-zinc-400 hover:text-white transition-colors">Moderation</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
