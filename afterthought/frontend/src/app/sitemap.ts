import type { MetadataRoute } from "next";

import { serverApiFetch } from "@/lib/server-api";
import type { EssaySummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost").replace(
    /\/$/,
    "",
  );
  let essays: EssaySummary[] = [];
  try {
    essays = await serverApiFetch<EssaySummary[]>("/api/essays/?limit=100", {
      next: { revalidate: 3600 },
    });
  } catch {
    // Static routes remain discoverable during a transient API outage.
  }
  const staticPaths = [
    "",
    "/essays",
    "/themes",
    "/series",
    "/about",
    "/submissions",
    "/feedback",
  ];
  return [
    ...staticPaths.map((path, index) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: (index < 2 ? "daily" : "weekly") as "daily" | "weekly",
      priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.6,
    })),
    ...essays.map((essay) => ({
      url: `${baseUrl}/essays/${essay.slug}`,
      lastModified: new Date(essay.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
