export function FeaturedQuote() {
  return (
    <section className="py-32 bg-surface/30 border-b border-border relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-accent-amber to-transparent opacity-50" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="text-accent-amber font-serif text-6xl mb-6 opacity-50">&quot;</div>
        <blockquote className="font-serif text-3xl md:text-5xl leading-relaxed text-zinc-200 mb-8">
          The illusion of perfect understanding is far more dangerous than the admission of complete ignorance.
        </blockquote>
        <div className="font-mono text-sm tracking-widest text-accent-gold uppercase">
          — Thought of the Day
        </div>
      </div>
    </section>
  );
}
