import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * /home — protected placeholder proving the auth flow + profile read.
 * Auth + the shared header live in the (protected) layout; this page renders
 * only its own content.
 */
export default async function HomePage() {
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

  const t = await getTranslations("dashboard");
  const meta = user.user_metadata ?? {};
  const name =
    profile?.full_name ?? meta.full_name ?? meta.name ?? user.email ?? "";
  const email = profile?.email ?? user.email ?? "";
  const avatarUrl = profile?.avatar_url ?? meta.avatar_url ?? meta.picture;

  return (
    <main className="flex flex-col gap-6 px-8 py-16 sm:px-16">
      <h1 className="font-montserrat text-2xl font-bold">{t("title")}</h1>
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
        ) : null}
        <div className="font-montserrat">
          <p className="text-lg font-bold">
            {t("greeting")}, {name}
          </p>
          <p className="text-sm text-white/70">{email}</p>
        </div>
      </div>
    </main>
  );
}
