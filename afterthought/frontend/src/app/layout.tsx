import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

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
    <html lang="en" className={`${instrumentSerif.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans text-zinc-100 dark:text-zinc-100 text-zinc-900 antialiased transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
