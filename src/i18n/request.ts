import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

// Static import specifiers (one per locale) so every messages file is bundled
// reliably in production. A template `import(`../messages/${locale}.json`)` can
// fail to include all locales on some builders → render error when switching.
const messagesByLocale: Record<Locale, () => Promise<{ default: unknown }>> = {
  vi: () => import("../messages/vi.json"),
  en: () => import("../messages/en.json"),
};

/** Locale comes from the NEXT_LOCALE cookie (no URL segment); falls back to vi. */
export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale: Locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await messagesByLocale[locale]()).default as Record<
      string,
      unknown
    >,
  };
});
