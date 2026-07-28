import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "About",
  description: "About Afterthought and its editorial approach.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <p className="mb-4 font-mono text-sm uppercase tracking-widest text-accent-amber">
          About the publication
        </p>
        <h1 className="mb-10 font-serif text-5xl text-white md:text-6xl">
          Ideas worth thinking about twice.
        </h1>
        <div className="article-content reader-size-large">
          <p>
            Afterthought publishes careful long-form writing about technology,
            society, and philosophy. We value arguments that remain interesting
            after the first reaction has faded.
          </p>
          <h2>Our editorial standard</h2>
          <p>
            Essays are reviewed for clarity, evidence, originality, and respect
            for the reader. Publication is not an endorsement of every
            conclusion; it is an invitation to examine the reasoning.
          </p>
          <h2>Contribute</h2>
          <p>
            Writers can send work through the submissions page. Readers can
            report issues or suggest improvements through the feedback form.
          </p>
        </div>
      </main>
    </>
  );
}
