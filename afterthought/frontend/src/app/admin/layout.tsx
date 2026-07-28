"use client";

import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/auth";

const adminLinks = [
  ["/admin", "Overview"],
  ["/admin/essays", "Essays"],
  ["/admin/essays/new", "New essay"],
  ["/admin/calendar", "Calendar"],
  ["/admin/themes", "Themes"],
  ["/admin/series", "Series"],
  ["/admin/comments", "Moderation"],
  ["/admin/submissions", "Submissions"],
  ["/admin/feedback", "Feedback"],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuthStore();

  if (status === "idle" || status === "loading") {
    return (
      <>
        <Navbar />
        <main className="p-12 text-center text-zinc-400" aria-live="polite">
          Verifying editorial access…
        </main>
      </>
    );
  }
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="p-12 text-center">
          <p className="mb-5 text-zinc-300">Sign in with an editor account to continue.</p>
          <Link href="/login" className="rounded bg-accent-amber px-5 py-3 text-black">
            Sign in
          </Link>
        </main>
      </>
    );
  }
  if (!user.is_admin) {
    return (
      <>
        <Navbar />
        <main className="p-12 text-center text-red-300" role="alert">
          Your account does not have editorial access.
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <aside className="border-b border-zinc-800 p-4 md:min-h-[calc(100vh-64px)] md:w-64 md:border-b-0 md:border-r md:p-6">
          <nav aria-label="Editorial navigation" className="flex gap-5 overflow-x-auto font-mono text-sm md:flex-col md:gap-4">
            {adminLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="whitespace-nowrap rounded text-zinc-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
