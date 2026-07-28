interface FeaturedQuoteProps {
  quote: string | null;
}

export function FeaturedQuote({ quote }: FeaturedQuoteProps) {
  if (!quote) return null;
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface/30 py-24">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-accent-amber to-transparent opacity-50"
      />
      <figure className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div aria-hidden="true" className="mb-4 font-serif text-6xl text-accent-amber/50">
          “
        </div>
        <blockquote className="mb-8 font-serif text-3xl leading-relaxed text-zinc-200 md:text-5xl">
          {quote}
        </blockquote>
        <figcaption className="font-mono text-sm uppercase tracking-widest text-accent-gold">
          From the current issue
        </figcaption>
      </figure>
    </section>
  );
}
