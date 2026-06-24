import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { SubmitKudos } from "@/components/kudos/submit-kudos";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout for all authenticated screens under (protected).
 *
 * Guards access (redirect to /login when signed out — belt-and-suspenders with
 * proxy.ts) and renders the shared SiteHeader with the current user's profile.
 * Profile falls back to Google's user_metadata so the header works even before
 * the profiles trigger has populated the row.
 *
 * SubmitKudos is mounted here once so the global write-kudos dialog is available
 * on every protected page; visibility is controlled by the zustand store.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata ?? {};
  const name =
    profile?.full_name ?? meta.full_name ?? meta.name ?? user.email ?? "";
  const email = profile?.email ?? user.email ?? "";
  const avatarUrl = profile?.avatar_url ?? meta.avatar_url ?? meta.picture;

  return (
    <div className="min-h-screen bg-details-background text-white">
      {/* Width is capped to the 1512px design canvas in the root layout. */}
      <div className="sticky top-0 z-100">
        <SiteHeader user={{ name, email, avatarUrl }} showNav />
      </div>
      <main className="min-h-[calc(100vh-224px)]">{children}</main>
      <SiteFooter />
      {/* Global write-kudos dialog — store-driven, renders null when closed. */}
      <SubmitKudos />
    </div>
  );
}
