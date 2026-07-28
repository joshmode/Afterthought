import type { Metadata } from "next";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Afterthought",
    default: "Afterthought | Ideas worth thinking about twice.",
  },
  description:
    "A digital publication dedicated to long-form essays about technology, society, and philosophy.",
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    title: "Afterthought",
    description:
      "A digital publication dedicated to long-form essays about technology, society, and philosophy.",
    url: siteUrl,
    siteName: "Afterthought",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Afterthought",
    description: "Ideas worth thinking about twice.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="flex min-h-screen flex-col bg-background font-sans text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
