import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed `middleware` → `proxy` (runs on the Node.js runtime).
// Refresh Supabase session + enforce route protection on every request.
// (next-intl uses cookie-based locale read in src/i18n/request.ts — no routing
// proxy needed, so this stays focused on auth.)
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|icons|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
