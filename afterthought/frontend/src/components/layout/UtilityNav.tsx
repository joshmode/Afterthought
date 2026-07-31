"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import type { User } from "@/lib/types";
import type { AuthStatus } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

interface UtilityNavProps {
  user: User | null;
  status: AuthStatus;
}

export function UtilityNav({
  user,
  status,
}: UtilityNavProps) {
  return (
    <div className="flex items-center gap-6">

      <ThemeToggle />

      {/* Search */}

      <Link
        href="/search"
        aria-label="Search"
        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-zinc-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
      >
        <Search
          size={17}
          strokeWidth={2}
        />

        <span className="text-sm font-medium">
          Search
        </span>

        <kbd className="hidden rounded border border-zinc-800 px-1.5 py-0.5 text-[11px] uppercase tracking-wider text-zinc-500 xl:inline">
          /
        </kbd>
      </Link>

      {/* Account */}

      {status === "loading" ? (

        <span
          className="sr-only"
          aria-live="polite"
        >
          Checking session
        </span>

      ) : status === "authenticated" && user ? (

        <div className="flex items-center gap-5">

          {user.is_admin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-accent-amber transition-opacity hover:opacity-80"
            >
              Admin
            </Link>
          )}

          <Link
            href="/profile"
            className="rounded-full border border-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
          >
            Profile
          </Link>

        </div>

      ) : (

        <Link
          href="/login"
          className="rounded-full border border-zinc-800 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
        >
          Sign in
        </Link>

      )}

    </div>
  );
}