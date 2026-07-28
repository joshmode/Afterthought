import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-amber/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-burgundy/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center z-10">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-none">
              AFTERTHOUGHT
            </h1>
            <p className="font-mono text-zinc-400 tracking-wider">Ideas worth thinking about twice.</p>
          </div>

          <div className="p-8 border border-border bg-surface/50 backdrop-blur-sm rounded-lg space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-accent-amber">
              <span className="uppercase tracking-wider">Taboo Tuesdays</span>
              <span>&bull;</span>
              <span>Issue #018</span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl text-white font-medium leading-tight">
              The Ethics of Artificial Empathy
            </h2>

            <p className="text-zinc-400 leading-relaxed text-sm">
              As language models become increasingly capable of simulating emotional intelligence, we must ask ourselves: is a synthetic connection better than none at all? Or does it fundamentally devalue genuine human interaction?
            </p>

            <div className="flex items-center space-x-4 text-xs font-mono text-zinc-500 pt-2 border-t border-border">
              <span>Oct 24, 2023</span>
              <span>&bull;</span>
              <span>12 min read</span>
              <span>&bull;</span>
              <span className="text-accent-gold">Technology, Ethics</span>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Link href="/essays"
                  className="flex items-center space-x-2 bg-white text-background px-6 py-3 rounded-md font-medium hover:bg-zinc-200 transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Continue Reading</span>
            </Link>
            <Link href="/essays"
                  className="flex items-center space-x-2 border border-border px-6 py-3 rounded-md font-medium hover:bg-surface transition-colors">
              <span>Browse Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="hidden md:flex justify-center items-center">
           {/* Abstract geometric artwork placeholder */}
           <div className="w-full max-w-md aspect-square bg-gradient-to-br from-surface to-background border border-border rounded-2xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="w-48 h-48 rounded-full border border-accent-amber/30 absolute animate-[spin_20s_linear_infinite]"></div>
              <div className="w-32 h-32 bg-accent-amber/20 backdrop-blur-xl rotate-45 rounded-xl border border-white/10 flex items-center justify-center shadow-2xl">
                 <div className="w-16 h-16 bg-accent-burgundy/40 rounded-full mix-blend-screen"></div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
