"use client";

import Link from "next/link";

import { NavLink } from "./NavLink";
import { UtilityNav } from "./UtilityNav";

import type { User } from "@/lib/types";
import type { AuthStatus } from "@/lib/auth";

interface DesktopNavProps {
  links: {
    href: string;
    label: string;
  }[];

  user: User | null;
  

  status: AuthStatus;
}

export function DesktopNav({
  links,
  user,
  status,
}: DesktopNavProps) {
  return (
    <div className="hidden flex-1 items-center lg:flex">

      {/* Editorial Navigation */}

      <div className="ml-16 flex items-center gap-10">

        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
          >
            {link.label}
          </NavLink>
        ))}

      </div>

      {/* Utility */}

      <div className="ml-auto">

        <UtilityNav
          user={user}
          status={status}
        />

      </div>

    </div>
  );
}