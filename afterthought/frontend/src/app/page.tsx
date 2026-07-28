import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { Countdown } from "@/components/home/Countdown";
import { FeaturedQuote } from "@/components/home/FeaturedQuote";
import { ThemesCloud } from "@/components/home/ThemesCloud";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <FeaturedQuote />
        <ThemesCloud />
      </main>
      <footer className="border-t border-border py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-zinc-500 font-mono text-sm">
          <p>© {new Date().getFullYear()} Afterthought. All rights reserved.</p>
          <div className="space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent-amber">Submissions</a>
            <a href="#" className="hover:text-accent-amber">Twitter</a>
            <a href="#" className="hover:text-accent-amber">RSS</a>
          </div>
        </div>
      </footer>
    </>
  );
}
