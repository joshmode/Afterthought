import Link from 'next/link';

export function ThemesCloud() {
  const themes = [
    "Ethics", "Politics", "Religion", "Technology",
    "Psychology", "Society", "Economics", "Justice",
    "Healthcare", "Freedom", "Dating"
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-white mb-4">Explore Themes</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Filter the entire library instantly by selecting a topic that sparks your curiosity.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {themes.map((theme) => (
            <Link
              key={theme}
              href={`/themes/${theme.toLowerCase()}`}
              className="px-6 py-3 rounded-full border border-border bg-surface text-zinc-300 hover:text-white hover:border-accent-amber transition-all hover:scale-105"
            >
              {theme}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
