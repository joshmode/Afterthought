import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "Contribute",
  description: "Submit your essay suggestions to Afterthought.",
};

export default function ContributePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-24">
        <div className="mb-12">
          <h1 className="font-serif text-5xl leading-tight text-white">
            Contribute
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-zinc-400">
            We are always looking for thoughtful essays exploring technology, society, and philosophy.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-12">
          <h2 className="font-serif text-3xl text-zinc-100">
            Submission Guidelines
          </h2>
          <div className="mt-6 space-y-6 text-lg leading-relaxed text-zinc-400">
            <p>
              Thank you for your interest in contributing to Afterthought. Currently, our formal submission portal is under construction.
            </p>
            <p>
              In the meantime, if you have an essay or an idea you would like to pitch, please review our existing essays to understand our editorial focus, and reach out to our editorial team via email.
            </p>
            <p>
              We favor depth over immediacy. Submissions should be carefully researched and focus on ideas that will remain relevant long after today&apos;s headlines fade.
            </p>
          </div>

          <div className="mt-12">
            <a
              href="mailto:submissions@afterthought.example.com"
              className="inline-flex items-center gap-2 rounded-full bg-accent-amber px-8 py-3 font-semibold text-black transition-all hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Email Pitch
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
