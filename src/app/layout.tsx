import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted LED 7-segment font (preloaded, no FOUT) — stands in for the
// design's "Digital Numbers" font.
const dseg7 = localFont({
  src: "./fonts/DSEG7Classic-Regular.woff2",
  variable: "--font-dseg7",
  weight: "400",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Title + unit labels use Montserrat Bold (700). Vietnamese subset covers the
// diacritics in "Sự kiện sẽ bắt đầu sau".
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Countdown — Prelaunch",
  description: "Event countdown prelaunch page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${dseg7.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
