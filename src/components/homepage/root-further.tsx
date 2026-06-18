"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

/**
 * RootFurther — "Root Further" theme content section.
 *
 * Centered ROOT FURTHER lockup, the opening description, a centered proverb,
 * then the closing description. All copy comes from the `homepage.rootFurther`
 * i18n namespace (authoritative text from the Figma design).
 */
export interface RootFurtherProps {
  className?: string;
}

export function RootFurther({ className }: RootFurtherProps) {
  const t = useTranslations("homepage.rootFurther");

  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative z-10 space-y-8 px-6 lg:px-45">
        {/* ROOT FURTHER lockup */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/login/root-further.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            className="h-auto w-72.5"
          />
        </div>

        {/* Opening description */}
        <p className="text-subtitle font-bold whitespace-pre-line text-white">
          {t("para1")}
        </p>

        {/* Proverb */}
        <blockquote className="text-center">
          <p className="text-subtitle font-bold whitespace-pre-line text-white">
            {t("quote")}
          </p>
          <p className="text-subtitle font-bold whitespace-pre-line text-white">
            {t("quoteAuthor")}
          </p>
        </blockquote>

        {/* Closing description */}
        <p className="text-subtitle font-bold whitespace-pre-line text-white">
          {t("para2")}
        </p>
      </div>
    </section>
  );
}
