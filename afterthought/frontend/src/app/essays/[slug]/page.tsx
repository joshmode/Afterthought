"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { List, Settings, Printer, Share, Type } from "lucide-react";

interface Essay {
  id: number;
  title: string;
  slug: string;
  abstract: string | null;
  content: string;
  reading_time_minutes: number | null;
  publication_date: string | null;
  featured_quote: string | null;
}

export default function EssayReadingPage() {
  const { slug } = useParams();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSizeClass, setFontSizeClass] = useState("prose-lg");

  useEffect(() => {
    async function fetchEssay() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/essays/${slug}`);
        if (!res.ok) {
          throw new Error("Essay not found");
        }
        const data = await res.json();
        setEssay(data);

        // Serialize MDX content
        const mdx = await serialize(data.content);
        setMdxSource(mdx);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchEssay();
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const totalScroll = documentHeight - windowHeight;
      const currentProgress = (scrollPosition / totalScroll) * 100;
      setReadingProgress(currentProgress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: essay?.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  };

  const toggleFontSize = () => {
    setFontSizeClass(prev => {
      if (prev === "prose-base") return "prose-lg";
      if (prev === "prose-lg") return "prose-xl";
      return "prose-base";
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center font-mono text-zinc-500">
          Loading...
        </div>
      </>
    );
  }

  if (error || !essay) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center font-mono text-red-500">
          {error || "Essay not found"}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-900 z-50">
        <div
          className="h-full bg-accent-amber transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md border border-zinc-800 rounded-full px-6 py-3 flex items-center space-x-6 z-40 hidden md:flex">
        <button onClick={toggleFontSize} className="text-zinc-400 hover:text-white transition-colors" title="Adjust font size">
          <Type size={18} />
        </button>
        <button onClick={handlePrint} className="text-zinc-400 hover:text-white transition-colors" title="Print/PDF mode">
          <Printer size={18} />
        </button>
        <button onClick={handleShare} className="text-zinc-400 hover:text-white transition-colors" title="Share essay">
          <Share size={18} />
        </button>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16 text-center">
          <div className="font-mono text-sm text-accent-amber mb-6 uppercase tracking-widest">
            {essay.publication_date ? new Date(essay.publication_date).toLocaleDateString() : "Draft"}
            {essay.reading_time_minutes && ` · ${essay.reading_time_minutes} min read`}
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-zinc-100 mb-8 leading-tight">
            {essay.title}
          </h1>
          {essay.abstract && (
            <p className="text-xl text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
              {essay.abstract}
            </p>
          )}
        </header>

        {essay.featured_quote && (
          <blockquote className="my-12 py-8 px-6 border-l-2 border-accent-amber bg-zinc-900/30 font-serif text-2xl italic text-zinc-300">
            &quot;{essay.featured_quote}&quot;
          </blockquote>
        )}

        <div className={`prose prose-invert prose-zinc max-w-none font-sans leading-loose
          prose-headings:font-serif prose-headings:font-normal prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-p:text-zinc-300 prose-p:mb-6
          prose-a:text-accent-amber prose-a:no-underline hover:prose-a:underline
          prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-zinc-400 prose-blockquote:border-l-accent-amber/50
          prose-code:text-accent-gold prose-code:bg-zinc-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
          ${fontSizeClass}
        `}>
          {mdxSource ? <MDXRemote {...mdxSource} /> : essay.content}
        </div>
      </article>
    </>
  );
}
