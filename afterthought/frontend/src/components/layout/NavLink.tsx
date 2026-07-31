"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
  onClick?: () => void;
}

export function NavLink({
  href,
  children,
  mobile = false,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "group flex items-center justify-between rounded-lg px-2 py-3 transition-colors duration-200",
          active
            ? "text-white"
            : "text-zinc-400 hover:text-white"
        )}
      >
        <span className="text-lg font-medium tracking-wide">
          {children}
        </span>

        <span
          className={clsx(
            "h-px transition-all duration-300",
            active
              ? "w-8 bg-white"
              : "w-0 bg-white group-hover:w-6"
          )}
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="group relative py-1"
    >
      <span
        className={clsx(
          "text-sm font-medium tracking-wide transition-colors duration-200",
          active
            ? "text-white"
            : "text-zinc-400 group-hover:text-white"
        )}
      >
        {children}
      </span>

      <span
        className={clsx(
          "absolute -bottom-2 left-0 h-px bg-white transition-all duration-300",
          active
            ? "w-full"
            : "w-0 group-hover:w-full"
        )}
      />
    </Link>
  );
}