import Link from "next/link";

const navigation = [
  {
    title: "Explore",
    links: [
      { href: "/essays", label: "Library" },
      { href: "/themes", label: "Themes" },
      { href: "/series", label: "Series" },
    ],
  },
  {
    title: "Publication",
    links: [
      { href: "/about", label: "About" },
      { href: "/search", label: "Search" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-40 border-t border-zinc-900">

      <div className="mx-auto max-w-7xl px-6 py-24">

        <div className="grid gap-20 lg:grid-cols-[1.3fr_0.7fr]">

          {/* Left */}

          <div>

            <h2 className="text-4xl font-black tracking-tight text-white">
              afterthought.
            </h2>

            <p className="mt-8 max-w-lg text-lg leading-8 text-zinc-400">
              Independent editorial publication exploring
              technology, philosophy, politics and the ideas
              shaping modern society.
            </p>

            <div className="mt-16 border-t border-zinc-900 pt-8">

              <p className="text-xs uppercase tracking-[0.3em] text-zinc-600">
                Published from Singapore
              </p>

              <p className="mt-3 text-sm text-zinc-500">
                © {new Date().getFullYear()} Afterthought.
                All rights reserved.
              </p>

            </div>

          </div>

          {/* Navigation */}

          <div className="grid grid-cols-2 gap-12">

            {navigation.map((section) => (

              <div key={section.title}>

                <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-600">

                  {section.title}

                </h3>

                <nav className="mt-8 flex flex-col gap-4">

                  {section.links.map((link) => (

                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-zinc-400 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>

                  ))}

                </nav>

              </div>

            ))}

          </div>

        </div>

      </div>

    </footer>
  );
}