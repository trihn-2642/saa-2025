import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SAA 2025",
  description: "Sun* Annual Awards 2025",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${dseg7.variable} h-full bg-details-background antialiased`}
    >
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
          cz-shortcut-listen) inject attributes on <body> before hydration. */}
      <body
        className="min-h-full bg-details-background"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Design canvas is a fixed 1512px wide — cap + center every screen
              so wider displays (e.g. 1920px) show centered content, not stretched. */}
          <div className="mx-auto w-full max-w-378">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
