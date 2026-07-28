import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { Countdown } from "@/components/home/Countdown";
import { FeaturedQuote } from "@/components/home/FeaturedQuote";
import { ThemesCloud } from "@/components/home/ThemesCloud";
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <FeaturedQuote />

        {/* Editorial Series Section */}
        <section className="py-24 border-b border-border bg-background">
          <div className="max-w-7xl mx-auto px-6">
             <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b border-zinc-800 pb-4">
                <h2 className="font-serif text-4xl text-white">Editorial Series</h2>
                <Link href="/series" className="font-mono text-sm text-accent-amber hover:text-white transition-colors uppercase tracking-widest mt-4 md:mt-0">View all series &rarr;</Link>
             </div>
             <div className="grid md:grid-cols-3 gap-8">
               {['Taboo Tuesdays', 'Fascinating Fridays', 'Submission Sundays'].map((s) => (
                 <Link key={s} href={`/series/${s.toLowerCase().replace(/ /g, '-')}`} className="group block p-8 rounded-xl border border-zinc-800 bg-surface/50 hover:bg-zinc-900 transition-colors relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/5 rounded-full blur-3xl group-hover:bg-accent-amber/10 transition-colors"></div>
                   <h3 className="font-serif text-2xl text-zinc-100 mb-4 group-hover:text-accent-amber transition-colors">{s}</h3>
                   <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                     Deep dives into the controversial, the curious, and the curated works from our community.
                   </p>
                 </Link>
               ))}
             </div>
          </div>
        </section>

        <ThemesCloud />
      </main>
      <footer className="border-t border-border py-12 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 font-mono text-sm">
          <p>© {new Date().getFullYear()} Afterthought. All rights reserved.</p>
          <div className="space-x-6 mt-4 md:mt-0">
            <Link href="/submissions" className="hover:text-accent-amber transition-colors">Submissions</Link>
            <a href="https://twitter.com/afterthought" target="_blank" rel="noopener noreferrer" className="hover:text-accent-amber transition-colors">Twitter</a>
            <Link href="/sitemap.xml" className="hover:text-accent-amber transition-colors">RSS/Sitemap</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
