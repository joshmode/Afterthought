export function FeaturedQuote() {
  return (
    <section className="py-24 bg-surface/30">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <blockquote className="font-serif text-3xl md:text-5xl leading-relaxed text-zinc-200">
          &ldquo;The illusion of perfect understanding is far more dangerous than the admission of complete ignorance.&rdquo;
        </blockquote>
        <div className="mt-8 font-mono text-sm tracking-widest text-accent-amber uppercase">
          — Issue #017, The Limits of Language
        </div>
      </div>
    </section>
  );
}
