"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/set-locale";
import {
  Header,
  type HeaderUser,
  type NavLink,
} from "@/components/layout/header";
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

  const onLangChange = async (next: string) => {
    await setLocale(next as "vi" | "en");
    router.refresh();
  };

  const onLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Build nav links when requested; the link for the current page is active
  // (URL-driven, same logic as the footer). /home = the "About SAA 2025"
  // landing → first link active there. Default (no showNav) → no nav.
  const nav: NavLink[] | undefined = showNav
    ? [
        { label: t("nav.aboutSaa"), href: "#", selected: pathname === "/home" },
        { label: t("nav.awardInfo"), href: "#", selected: false },
        { label: t("nav.kudos"), href: "#", selected: false },
      ]
    : undefined;

  return (
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
  );
}
