import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * Layout for all authenticated screens under (protected).
 *
 * Guards access (redirect to /login when signed out — belt-and-suspenders with
 * proxy.ts) and renders the shared SiteHeader with the current user's profile.
 * Profile falls back to Google's user_metadata so the header works even before
 * the profiles trigger has populated the row.
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
      <div className="sticky top-0 z-30">
        <SiteHeader user={{ name, email, avatarUrl }} showNav />
      </div>
      {children}
      <SiteFooter />
    </div>
  );
}
