import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: 'swap'
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: 'swap' });

export const metadata: Metadata = {
  title: {
    template: '%s | Afterthought',
    default: 'Afterthought | Ideas worth thinking about twice.',
  },
  description: "A premium digital publication dedicated to long-form essays regarding technology, society, and philosophy.",
  openGraph: {
    title: 'Afterthought',
    description: 'A premium digital publication dedicated to long-form essays regarding technology, society, and philosophy.',
    url: 'https://afterthought.com',
    siteName: 'Afterthought',
    images: [
      {
        url: 'https://afterthought.com/og.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afterthought',
    description: 'A premium digital publication dedicated to long-form essays.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-zinc-100 min-h-screen antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
