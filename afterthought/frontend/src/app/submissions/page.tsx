"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";

export default function SubmissionsPage() {
  const [formData, setFormData] = useState({ author_name: "", author_email: "", title: "", content: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("success");
      setFormData({ author_name: "", author_email: "", title: "", content: "" });
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif text-white mb-8">Submit an Essay</h1>
        <p className="text-zinc-400 mb-8 font-sans leading-relaxed">
          We are always looking for thought-provoking essays. Please submit your work below for editorial review.
        </p>

        {status === "success" && (
          <div className="bg-green-500/20 text-green-400 p-4 rounded mb-8 font-mono text-sm border border-green-500/30">
            Thank you! Your submission has been received and is pending review.
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded mb-8 font-mono text-sm border border-red-500/30">
            There was an error processing your submission. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input
              type="text" required placeholder="Your Name"
              value={formData.author_name} onChange={e => setFormData({ ...formData, author_name: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 focus:outline-none focus:border-accent-amber"
            />
            <input
              type="email" required placeholder="Your Email"
              value={formData.author_email} onChange={e => setFormData({ ...formData, author_email: e.target.value })}
              className="bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 focus:outline-none focus:border-accent-amber"
            />
          </div>
          <input
            type="text" required placeholder="Essay Title"
            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 focus:outline-none focus:border-accent-amber font-serif text-xl"
          />
          <textarea
            required placeholder="Paste your essay content here..."
            value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded text-zinc-100 focus:outline-none focus:border-accent-amber min-h-[400px] font-sans leading-relaxed"
          />
          <button
            type="submit" disabled={status === "submitting"}
            className="bg-accent-amber text-black px-8 py-3 rounded font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
          >
            {status === "submitting" ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      </main>
    </>
  );
}
