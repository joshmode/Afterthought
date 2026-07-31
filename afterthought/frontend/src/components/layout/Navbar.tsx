"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

import { useAuthStore } from "@/lib/auth";

import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { useScrollState } from "./useScrollState";

const links = [
  { href: "/essays", label: "Library" },
  { href: "/themes", label: "Themes" },
  { href: "/series", label: "Series" },
  { href: "/about", label: "About" },
  { href: "/contribute", label: "Contribute" },
];

export function Navbar() {
  const { user, status, initialize } = useAuthStore();

  const { scrolled } = useScrollState();

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-zinc-200 dark:border-zinc-900 bg-white/90 dark:bg-background/90 backdrop-blur-xl"
          : "bg-white/70 dark:bg-background/70 backdrop-blur-lg"
      )}
    >
      <nav
        aria-label="Primary navigation"
        className={clsx(
          "mx-auto flex max-w-7xl items-center px-6 transition-all duration-300",
          scrolled ? "h-[60px]" : "h-[72px]"
        )}
      >
        {/* Logo */}

        <Link
          href="/"
          className="shrink-0 rounded text-2xl font-black tracking-tight text-black dark:text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
        >
          afterthought.
        </Link>

        {/* Desktop */}

        <DesktopNav
          links={links}
          user={user}
          status={status}
        />

        {/* Mobile */}

        <div className="ml-auto lg:hidden">
          <MobileMenu
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            links={links}
            user={user}
            status={status}
          />
        </div>
      </nav>
    </header>
  );
}