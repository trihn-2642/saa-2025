"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * /login — Google sign-in via Supabase OAuth. Fits exactly one viewport
 * (header + content + footer, no scroll). Figma "Login" GzbNeVGJHz.
 */
function LoginContent() {
  const t = useTranslations("login");
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  // The OAuth callback redirects back with ?error=auth on exchange failure.
  const showError = submitError || searchParams.get("error") === "auth";

  const handleLogin = async () => {
    setLoading(true);
    setSubmitError(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/home`,
      },
    });
    if (error) {
      setSubmitError(true);
      setLoading(false); // else the browser redirects to Google
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-details-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/countdown/bg-prelaunch.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, var(--details-background) 15.48%, rgba(0,18,29,0.72) 52.13%, rgba(0,19,32,0.20) 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-20">
        <SiteHeader user={null} />
      </div>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-36">
        {/* Frame 487: gap 80px between key visual and the text/button group */}
        <div className="flex flex-col items-start gap-12 lg:gap-20">
          {/* "ROOT FURTHER" key visual (exported logo image, not text) */}
          <Image
            src="/login/root-further.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="h-auto w-65 sm:w-90 lg:w-112.75"
          />

          {/* Frame 550: gap 24px, indented 16px from the key visual */}
          <div className="flex flex-col items-start gap-6 pl-4">
            <div className="flex flex-col">
              <p className="font-montserrat text-xl leading-10 font-bold tracking-[0.5px] text-white">
                {t("welcome1")}
              </p>
              <p className="font-montserrat text-xl leading-10 font-bold tracking-[0.5px] text-white">
                {t("welcome2")}
              </p>
            </div>

            <Button
              variant="primary"
              iconRight={
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/icons/ic-google.svg" alt="" />
              }
              onClick={handleLogin}
              disabled={loading}
              aria-busy={loading}
              // Login uses the large button variant: 22px/700, radius 8, px 24.
              className="w-fit rounded-lg px-6 text-[22px] font-bold"
            >
              {t("google")}
            </Button>

            {showError ? (
              <p role="alert" className="font-montserrat text-sm text-red-400">
                {t("error")}
              </p>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex w-full items-center justify-center border-t border-[#2E3940] bg-[rgba(11,15,18,0.8)] px-8 py-6 sm:px-22.5">
        <p className="font-montserrat text-sm text-white/60">{t("footer")}</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
