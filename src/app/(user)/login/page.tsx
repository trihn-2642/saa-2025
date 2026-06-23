"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import IcGoogle from "@icons/ic-google.svg";

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
        redirectTo: `${location.origin}/auth/callback?next=/`,
      },
    });
    if (error) {
      setSubmitError(true);
      setLoading(false); // else the browser redirects to Google
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-details-background">
      {/* Keyvisual cropped to match the Figma login fill (node 662:14389):
          background-size 159.763% 133.371%, offset -440px/-218px on a 1440-wide
          frame → ~51% 64% as responsive percentages. */}
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: "url('/images/homepage-saa/keyvisual.jpg')",
          backgroundSize: "159.763% 133.371%",
          backgroundPosition: "51% 64%",
        }}
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
            src="/images/login/root-further.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="h-auto w-65 sm:w-90 lg:w-112.75"
          />

          {/* Frame 550: gap 24px, indented 16px from the key visual */}
          <div className="flex flex-col items-start gap-6 pl-4">
            <div className="flex flex-col">
              <p className="text-xl leading-10 font-bold tracking-[0.5px] text-white">
                {t("welcome1")}
              </p>
              <p className="text-xl leading-10 font-bold tracking-[0.5px] text-white">
                {t("welcome2")}
              </p>
            </div>

            <Button
              variant="primary"
              iconRight={<IcGoogle aria-hidden className="size-6!" />}
              onClick={handleLogin}
              disabled={loading}
              aria-busy={loading}
              className="w-fit rounded-lg px-6 text-cta font-bold"
            >
              {t("google")}
            </Button>

            {showError ? (
              <p role="alert" className="text-sm text-red-400">
                {t("error")}
              </p>
            ) : null}
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex w-full items-center justify-center border-t border-border-subtle bg-surface-overlay px-8 py-6 sm:px-22.5">
        <p className="text-body font-bold text-white">{t("footer")}</p>
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
