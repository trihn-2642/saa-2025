"use server";

import { cookies } from "next/headers";

/** Persist the chosen UI locale in a cookie (read by src/i18n/request.ts). */
export async function setLocale(locale: "vi" | "en") {
  (await cookies()).set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
