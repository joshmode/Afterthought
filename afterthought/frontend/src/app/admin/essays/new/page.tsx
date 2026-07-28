"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAuthStore } from "@/lib/auth";
import { RichEditor } from "@/components/admin/RichEditor";

export default function NewEssayPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [abstract, setAbstract] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (publish: boolean) => {
    setLoading(true);
    try {
      // 1. Create the essay
      const createRes = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/essays/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          abstract,
          reading_time_minutes: Math.ceil(content.split(' ').length / 200)
        })
      });
      if (!createRes.ok) throw new Error("Failed to create essay");

      const essay = await createRes.json();

      // 2. If publish requested, hit publish endpoint
      if (publish) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/editorial/essays/${essay.id}/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ publish_now: true })
        });
      }

      router.push("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="p-8 text-white">Not Authorized</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-white">New Essay</h1>
          <div className="space-x-4">
            <button
              onClick={() => handleSave(false)}
              disabled={loading}
              className="text-zinc-400 hover:text-white px-4 py-2"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-accent-amber text-black px-6 py-2 rounded font-medium hover:bg-amber-400 transition-colors"
            >
              Publish Now
            </button>
          </div>
        </div>

        {error && <div className="bg-red-500/20 text-red-500 p-4 rounded mb-6">{error}</div>}

        <div className="space-y-6">
          <input
            type="text"
            placeholder="Essay Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
            }}
            className="w-full bg-transparent border-b border-zinc-800 pb-4 text-4xl font-serif text-white focus:outline-none focus:border-accent-amber transition-colors"
          />
          <div className="flex items-center text-sm font-mono text-zinc-500">
            <span>afterthought.com/essays/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-transparent border-b border-zinc-800 ml-1 focus:outline-none focus:border-accent-amber text-zinc-300"
            />
          </div>
          <textarea
            placeholder="Brief abstract..."
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded p-4 text-zinc-300 focus:outline-none focus:border-accent-amber min-h-[100px]"
          />
          <RichEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
