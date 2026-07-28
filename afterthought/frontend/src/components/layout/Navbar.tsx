import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-wide">
          AFTERTHOUGHT
        </Link>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-zinc-400">
          <Link href="/library" className="hover:text-accent-amber transition-colors">Library</Link>
          <Link href="/themes" className="hover:text-accent-amber transition-colors">Themes</Link>
          <Link href="/series" className="hover:text-accent-amber transition-colors">Series</Link>
          <Link href="/about" className="hover:text-accent-amber transition-colors">About</Link>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-accent-amber transition-colors">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
