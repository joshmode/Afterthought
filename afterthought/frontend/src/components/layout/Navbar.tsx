"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { useAuthStore } from "@/lib/auth";

const links = [
  { href: "/essays", label: "Library" },
  { href: "/themes", label: "Themes" },
  { href: "/series", label: "Series" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { user, status, initialize } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
      >
        <Link
          href="/"
          className="shrink-0 rounded font-serif text-xl font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
        >
          AFTERTHOUGHT
        </Link>
        <div className="order-3 flex w-full items-center gap-5 overflow-x-auto pb-1 text-sm font-medium text-zinc-300 md:order-none md:w-auto md:pb-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded transition-colors hover:text-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/search"
            aria-label="Search essays"
            className="rounded p-2 text-zinc-300 hover:text-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
          >
            <Search aria-hidden="true" size={18} />
          </Link>
          {status === "authenticated" && user ? (
            <>
              {user.is_admin && (
                <Link
                  href="/admin"
                  className="rounded text-sm font-medium text-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="rounded text-sm font-medium hover:text-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
              >
                Profile
              </Link>
            </>
          ) : status === "loading" ? (
            <span className="sr-only" aria-live="polite">
              Checking session
            </span>
          ) : (
            <Link
              href="/login"
              className="rounded text-sm font-medium hover:text-accent-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
