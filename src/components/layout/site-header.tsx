"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  Header,
  type HeaderUser,
  type NavLink,
} from "@/components/layout/header";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

/**
 * Client wrapper around <Header> that wires real behaviours (language switch
 * via cookie + logout via Supabase).
 *
 * Reused by:
 *   /login            — user=null, no nav  → minimal header (logo + lang)
 *   (protected)/home  — user set, nav set  → full homepage header
 *   (protected)/...   — user set, no nav   → account-only header (original)
 */
export function SiteHeader({
  user,
  showNav,
}: {
  user?: HeaderUser | null;
  /** Pass true on the homepage to enable the 3-link nav + bell. */
  showNav?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  // router.refresh() re-fetches the RSC (~1-2s); track it so we can overlay a
  // spinner while the new locale is rendering.
  const [isSwitching, startSwitch] = useTransition();

  const onLangChange = (next: string) => {
    // Set the locale cookie client-side (it's a UI preference, not a secret),
    // then refresh. A Server Action can't be used here: it forces a re-render of
    // the current route inside the action, which throws (500) on protected
    // routes; router.refresh() re-fetches the route as a plain RSC request that
    // succeeds and reads the new cookie. NEXT_LOCALE is read in src/i18n/request.ts.
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
    startSwitch(() => router.refresh());
  };

  const onLogout = async () => {
    await createClient().auth.signOut();
    router.push(ROUTES.login);
    router.refresh();
  };

  // Build nav links when requested; the link for the current page is active
  // (URL-driven, same logic as the footer). /home = the "About SAA 2025"
  // landing → first link active there. Default (no showNav) → no nav.
  const nav: NavLink[] | undefined = showNav
    ? [
        {
          label: t("nav.aboutSaa"),
          href: ROUTES.home,
          selected: pathname === ROUTES.home,
        },
        {
          label: t("nav.awardInfo"),
          href: ROUTES.awardInformation,
          selected: pathname === ROUTES.awardInformation,
        },
        {
          label: t("nav.kudos"),
          href: ROUTES.kudos,
          selected: pathname === ROUTES.kudos,
        },
      ]
    : undefined;

  return (
    <>
      <Header
        user={user}
        lang={locale}
        nav={nav}
        showBell={showNav}
        onLangChange={onLangChange}
        onLogout={onLogout}
        onProfile={() => {
          // Non-functional stub — Profile page not yet built (clarifications decision 3).
        }}
      />
      {/* Locale switch re-fetches the RSC (~1-2s) — block the UI with the same
          overlay as loading.tsx so the stale language isn't shown mid-swap. */}
      {isSwitching ? <LoadingOverlay /> : null}
    </>
  );
}
