import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Series {
  id: string;
  slug: string;
  title: string;
  description: string;
  essayCount: number;
}

interface FeaturedSeriesProps {
  series: Series[];
}

export function FeaturedSeries({
  series,
}: FeaturedSeriesProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-32">

      {/* Heading */}

      <div className="max-w-2xl">

        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Series
        </p>

        <h2 className="mt-6 font-serif text-5xl leading-tight text-white">
          Essays that unfold
          across multiple ideas.
        </h2>

        <p className="mt-8 text-lg leading-8 text-zinc-400">
          Some questions deserve more than one essay.
          Our editorial series explore ideas over time,
          connecting individual essays into larger
          conversations.
        </p>

      </div>

      {/* Series */}

      <div className="mt-24">

        {series.map((item) => (

          <article
            key={item.id}
            className="group border-t border-zinc-900 py-12 last:border-b"
          >

            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_auto]">

              {/* Title */}

              <div>

                <h3 className="font-serif text-4xl leading-tight text-white transition-colors duration-300 group-hover:text-zinc-200">

                  {item.title}

                </h3>

              </div>

              {/* Description */}

              <div>

                <p className="leading-8 text-zinc-400">

                  {item.description}

                </p>

              </div>

              {/* Action */}

              <div className="flex items-center lg:justify-end">

                <Link
                  href={`/series/${item.slug}`}
                  className="inline-flex items-center gap-3 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                >

                  <span>

                    {item.essayCount} essays

                  </span>

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </Link>

              </div>

            </div>

          </article>

        ))}

      </div>

    </section>
  );
}