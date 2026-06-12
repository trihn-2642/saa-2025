"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/set-locale";
import { Header, type HeaderUser } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/client";

/**
 * Client wrapper around <Header> that wires the real behaviours (language
 * switch via cookie + logout via Supabase). Reused by /login (user=null) and
 * protected pages (user set).
 */
export function SiteHeader({ user }: { user?: HeaderUser | null }) {
  const router = useRouter();
  const locale = useLocale();

  const onLangChange = async (next: string) => {
    await setLocale(next as "vi" | "en");
    router.refresh();
  };

  const onLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Header
      user={user}
      lang={locale}
      onLangChange={onLangChange}
      onLogout={onLogout}
    />
  );
}
