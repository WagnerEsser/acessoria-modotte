import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { brand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const rootMetadata = buildMetadata({
  title: `${brand.name} | ${brand.subtitle}`,
  description: brand.slogan,
  path: "/",
});

export const metadata: Metadata = {
  ...rootMetadata,
  title: {
    default: `${brand.name} | ${brand.subtitle}`,
    template: `%s | ${brand.name}`,
  },
  applicationName: brand.name,
  creator: brand.name,
  publisher: brand.name,
  category: "imóveis",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-brand-ink font-sans text-brand-ivory antialiased selection:bg-brand-gold selection:text-brand-navy">
        {children}
      </body>
    </html>
  );
}
