import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-cormorant"
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Afterthought | Ideas worth thinking about twice.",
  description: "A premium digital publication dedicated to long-form essays.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-zinc-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
