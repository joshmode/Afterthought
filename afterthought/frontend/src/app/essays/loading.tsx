export default function LibraryLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12" aria-busy="true">
      <div className="mb-10 h-12 w-64 animate-pulse rounded bg-zinc-800 motion-reduce:animate-none" />
      <div className="space-y-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-3 border-b border-zinc-800 pb-8">
            <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-800 motion-reduce:animate-none" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-900 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </main>
  );
}
