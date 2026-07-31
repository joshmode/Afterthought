"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  MessageCircle,
  Printer,
  Share2,
  Type,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { Comment, Essay } from "@/lib/types";

interface Heading {
  id: string;
  label: string;
  level: number;
}

const sizeClasses = ["reader-size-base", "reader-size-large", "reader-size-xl"];

function slugifyHeading(value: string, index: number): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `section-${index + 1}`;
}

export function EssayReader({ essay }: { essay: Essay }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentStatus, setCommentStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");

  useEffect(() => {
    const nodes = articleRef.current?.querySelectorAll("h2, h3") ?? [];
    const seen = new Set<string>();
    const extracted = Array.from(nodes).map((node, index) => {
      let id = slugifyHeading(node.textContent ?? "", index);
      while (seen.has(id)) id = `${id}-${index + 1}`;
      seen.add(id);
      node.id = id;
      return {
        id,
        label: node.textContent ?? `Section ${index + 1}`,
        level: Number(node.tagName.slice(1)),
      };
    });
    setHeadings(extracted);
  }, [essay.content]);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(
        total <= 0 ? 100 : Math.min(100, Math.max(0, (window.scrollY / total) * 100)),
      );
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const key = `afterthought:viewed:${essay.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void apiFetch<void>(`/api/engagement/essays/${essay.id}/view`, {
      method: "POST",
    }).catch(() => sessionStorage.removeItem(key));
  }, [essay.id]);

  useEffect(() => {
    void apiFetch<Comment[]>(`/api/engagement/essays/${essay.id}/comments`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [essay.id]);

  useEffect(() => {
    if (!user) {
      setBookmarked(false);
      return;
    }
    void apiFetch<{ bookmarked: boolean }>(
      `/api/engagement/bookmarks/${essay.id}`,
    )
      .then((state) => setBookmarked(state.bookmarked))
      .catch(() => setBookmarked(false));
  }, [essay.id, user]);

  useEffect(() => {
    if (!user || readingProgress <= 0) return;
    const timeout = window.setTimeout(() => {
      void apiFetch("/api/reader/history", {
        method: "POST",
        body: JSON.stringify({
          essay_id: essay.id,
          progress_percent: Math.round(readingProgress),
        }),
      });
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [essay.id, readingProgress, user]);

  async function toggleBookmark() {
    if (!user) {
      setActionStatus("Sign in to save this essay.");
      return;
    }
    try {
      const state = await apiFetch<{ bookmarked: boolean }>(
        "/api/engagement/bookmarks",
        {
          method: "POST",
          body: JSON.stringify({ essay_id: essay.id }),
        },
      );
      setBookmarked(state.bookmarked);
      setActionStatus(state.bookmarked ? "Essay saved." : "Bookmark removed.");
    } catch {
      setActionStatus("The bookmark could not be updated.");
    }
  }

  async function shareEssay() {
    try {
      if (navigator.share) {
        await navigator.share({ title: essay.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setActionStatus("Link copied to clipboard.");
      }
    } catch {
      setActionStatus("Sharing was cancelled or unavailable.");
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setCommentStatus("Sign in to join the discussion.");
      return;
    }
    setCommentStatus("Submitting…");
    try {
      await apiFetch<Comment>("/api/engagement/comments", {
        method: "POST",
        body: JSON.stringify({ essay_id: essay.id, content: commentText }),
      });
      setCommentText("");
      setCommentStatus("Your comment is awaiting editorial review.");
    } catch {
      setCommentStatus("Your comment could not be submitted.");
    }
  }

  return (
    <>
      <div
        className="fixed left-0 top-0 z-[60] h-1 bg-accent-amber"
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_220px] lg:py-24">
        <article className="min-w-0">
          <header className="mb-16 text-center">
            <div className="mb-6 font-mono text-sm uppercase tracking-widest text-accent-amber">
              {essay.publication_date && (
                <time dateTime={essay.publication_date}>
                  {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
                    new Date(essay.publication_date),
                  )}
                </time>
              )}
              {essay.reading_time_minutes && (
                <span> · {essay.reading_time_minutes} min read</span>
              )}
            </div>
            <h1 className="mb-8 font-serif text-5xl leading-tight text-zinc-100 md:text-6xl">
              {essay.title}
            </h1>
            {essay.abstract && (
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
                {essay.abstract}
              </p>
            )}
            {essay.themes.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {essay.themes.map((theme) => (
                  <span
                    key={theme.id}
                    className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
                  >
                    {theme.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {essay.featured_quote && (
            <blockquote className="my-12 border-l-2 border-accent-amber bg-zinc-900/30 px-6 py-8 font-serif text-2xl italic text-zinc-300">
              “{essay.featured_quote}”
            </blockquote>
          )}

          <div
            ref={articleRef}
            className={`article-content ${sizeClasses[fontSizeIndex]}`}
            dangerouslySetInnerHTML={{ __html: essay.content }}
          />

          <section className="mt-20 border-t border-zinc-800 pt-12" aria-labelledby="discussion-heading">
            <h2 id="discussion-heading" className="mb-8 flex items-center gap-3 font-serif text-3xl">
              <MessageCircle aria-hidden="true" size={24} />
              Discussion
            </h2>
            <form onSubmit={submitComment} className="mb-10">
              <label htmlFor="comment" className="mb-2 block text-sm text-zinc-300">
                Add a thoughtful response
              </label>
              <textarea
                id="comment"
                required
                minLength={1}
                maxLength={2000}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                disabled={!user}
                className="min-h-28 w-full rounded border border-zinc-700 bg-zinc-900 p-4 text-white focus:border-accent-amber focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={user ? "What stayed with you?" : "Sign in to comment"}
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-sm text-zinc-500" aria-live="polite">
                  {commentStatus}
                </p>
                <button
                  type="submit"
                  disabled={!user || !commentText.trim()}
                  className="rounded bg-accent-amber px-5 py-2 font-medium text-black disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </form>
            {comments.length ? (
              <ol className="space-y-5">
                {comments.map((comment) => (
                  <li key={comment.id} className="rounded border border-zinc-800 bg-surface/30 p-5">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-zinc-200">{comment.author_name}</span>
                      <time className="text-xs text-zinc-500" dateTime={comment.created_at}>
                        {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                          new Date(comment.created_at),
                        )}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-zinc-300">{comment.content}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-zinc-500">No approved comments yet.</p>
            )}
          </section>
        </article>

        {headings.length > 0 && (
          <aside className="hidden lg:block">
            <nav aria-label="Table of contents" className="sticky top-28">
              <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
                In this essay
              </h2>
              <ol className="space-y-3 border-l border-zinc-800 pl-4 text-sm text-zinc-400">
                {headings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                    <a href={`#${heading.id}`} className="hover:text-accent-amber">
                      {heading.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
      </div>

      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-zinc-700 bg-surface/95 px-3 py-2 shadow-xl backdrop-blur-md">
        <button
          onClick={() => setFontSizeIndex((fontSizeIndex + 1) % sizeClasses.length)}
          className="rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
          aria-label="Adjust reading font size"
        >
          <Type aria-hidden="true" size={18} />
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
          aria-label="Print or save as PDF"
        >
          <Printer aria-hidden="true" size={18} />
        </button>
        <button
          onClick={() => void shareEssay()}
          className="rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
          aria-label="Share essay"
        >
          <Share2 aria-hidden="true" size={18} />
        </button>
        <button
          onClick={() => void toggleBookmark()}
          className="rounded-full p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber"
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark essay"}
        >
          {bookmarked ? (
            <Check aria-hidden="true" className="text-accent-amber" size={18} />
          ) : (
            <Bookmark aria-hidden="true" size={18} />
          )}
        </button>
        <span className="sr-only" aria-live="polite">
          {actionStatus}
        </span>
      </div>
    </>
  );
}
