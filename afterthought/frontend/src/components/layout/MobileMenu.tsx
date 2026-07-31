"use client";

import { Fragment } from "react";

import Link from "next/link";

import { Dialog, Transition } from "@headlessui/react";
import { Menu, X, Search } from "lucide-react";

import { NavLink } from "./NavLink";

import type { User } from "@/lib/types";
import type { AuthStatus } from "@/lib/auth";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  links: {
    href: string;
    label: string;
  }[];

  user: User | null;
  status: AuthStatus;
}

export function MobileMenu({
  open,
  onOpenChange,
  links,
  user,
  status,
}: MobileMenuProps) {
  return (
    <>
      {/* Trigger */}

      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => onOpenChange(true)}
        className="rounded-md p-2 text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber lg:hidden"
      >
        <Menu size={22} />
      </button>

      <Transition.Root
        show={open}
        as={Fragment}
      >
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={onOpenChange}
        >
          {/* Overlay */}

          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          {/* Drawer */}

          <div className="fixed inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition duration-300 ease-out"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition duration-200 ease-in"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="flex h-full w-full max-w-sm flex-col bg-zinc-950 px-8 py-8 shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between">

                  <Link
                    href="/"
                    onClick={() => onOpenChange(false)}
                    className="text-2xl font-black tracking-tight text-white"
                  >
                    afterthought.
                  </Link>

                  <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => onOpenChange(false)}
                    className="rounded-md p-2 text-zinc-400 hover:text-white"
                  >
                    <X size={22} />
                  </button>

                </div>

                {/* Navigation */}

                <nav className="mt-16 flex flex-col gap-2">

                  {links.map((link) => (
                    <NavLink
                      key={link.href}
                      href={link.href}
                      mobile
                      onClick={() => onOpenChange(false)}
                    >
                      {link.label}
                    </NavLink>
                  ))}

                </nav>

                <div className="my-10 h-px bg-zinc-800" />

                {/* Search */}

                <Link
                  href="/search"
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 text-zinc-300 transition-colors hover:text-white"
                >
                  <Search size={20} />

                  <span className="text-lg font-medium">
                    Search
                  </span>
                </Link>

                <div className="mt-auto border-t border-zinc-800 pt-8">

                  {status === "authenticated" && user ? (

                    <div className="space-y-4">

                      {user.is_admin && (
                        <Link
                          href="/admin"
                          onClick={() => onOpenChange(false)}
                          className="block text-lg font-medium text-accent-amber"
                        >
                          Admin
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={() => onOpenChange(false)}
                        className="block rounded-full border border-zinc-800 px-5 py-3 text-center font-medium text-white"
                      >
                        Profile
                      </Link>

                    </div>

                  ) : status === "loading" ? (

                    <span
                      className="sr-only"
                      aria-live="polite"
                    >
                      Checking session
                    </span>

                  ) : (

                    <Link
                      href="/login"
                      onClick={() => onOpenChange(false)}
                      className="block rounded-full border border-zinc-800 px-5 py-3 text-center font-medium text-white"
                    >
                      Sign in
                    </Link>

                  )}

                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>

        </Dialog>
      </Transition.Root>
    </>
  );
}