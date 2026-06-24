import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback: Supabase redirects here with `?code=...` after Google sign-in.
 * Exchange it for a session cookie, then continue to `next` (default /home).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow same-origin relative paths (avoid open-redirect via ?next=//evil).
  const rawNext = searchParams.get("next") ?? "/";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  // Behind a proxy (Vercel), request.url's origin can be the internal host
  // (→ redirect to localhost). Prefer the forwarded host so we land on the
  // public URL. Locally there is no forwarded host, so fall back to origin.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const baseUrl =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth`);
}
