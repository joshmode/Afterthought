import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EssayReader } from "@/components/reader/EssayReader";
import { Navbar } from "@/components/layout/Navbar";
import { serverApiFetch } from "@/lib/server-api";
import type { Essay } from "@/lib/types";

interface EssayPageProps {
  params: Promise<{ slug: string }>;
}

async function loadEssay(slug: string): Promise<Essay | null> {
  try {
    return await serverApiFetch<Essay>(`/api/essays/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const essay = await loadEssay(slug);
  if (!essay) return { title: "Essay not found" };
  return {
    title: essay.seo_title ?? essay.title,
    description: essay.seo_description ?? essay.abstract ?? undefined,
    alternates: essay.canonical_url ? { canonical: essay.canonical_url } : undefined,
    openGraph: {
      title: essay.seo_title ?? essay.title,
      description: essay.seo_description ?? essay.abstract ?? undefined,
      type: "article",
      publishedTime: essay.publication_date ?? undefined,
    },
  };
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const essay = await loadEssay(slug);
  if (!essay) notFound();
  return (
    <>
      <Navbar />
      <EssayReader essay={essay} />
    </>
  );
}
