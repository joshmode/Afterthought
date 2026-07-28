import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost").replace(
    /\/$/,
    "",
  );
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/profile", "/settings", "/notifications"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
