import { serverApiFetch } from "@/lib/server-api";
import type { EssaySummary } from "@/lib/types";

export const dynamic = "force-dynamic";

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost").replace(
    /\/$/,
    "",
  );
  let essays: EssaySummary[] = [];
  try {
    essays = await serverApiFetch<EssaySummary[]>("/api/essays/?limit=50", {
      next: { revalidate: 900 },
    });
  } catch {
    return new Response("Feed temporarily unavailable", { status: 503 });
  }
  const items = essays
    .map(
      (essay) => `<item>
  <title>${xml(essay.title)}</title>
  <link>${xml(`${baseUrl}/essays/${essay.slug}`)}</link>
  <guid isPermaLink="true">${xml(`${baseUrl}/essays/${essay.slug}`)}</guid>
  <description>${xml(essay.abstract ?? "")}</description>
  ${essay.publication_date ? `<pubDate>${new Date(essay.publication_date).toUTCString()}</pubDate>` : ""}
</item>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Afterthought</title>
  <link>${xml(baseUrl)}</link>
  <description>Ideas worth thinking about twice.</description>
  <language>en</language>
  ${items}
</channel>
</rss>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=900",
    },
  });
}
