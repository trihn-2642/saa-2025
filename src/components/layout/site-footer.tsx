"use client";

/**
 * SiteFooter — shared footer for authenticated pages (Figma 5001-14800).
 *
 * Layout (design): top 1px divider (#2E3940), 40px vertical / 90px horizontal
 * padding, space-between → logo (left) · nav (center) · copyright (right).
 * Nav links are text-link Buttons; the one matching the current page is active
 * (highlighted), mirroring the header. Strings from the `common` namespace.
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function SiteFooter() {
  const t = useTranslations("common");
  const pathname = usePathname();

  // Links point to placeholders for now; the link for the current page is
  // active. /home is the "About SAA 2025" landing → first link active there.
  const navLinks = [
    { label: t("nav.aboutSaa"), href: "#", active: pathname === "/home" },
    { label: t("nav.awardInfo"), href: "#", active: false },
    { label: t("nav.kudos"), href: "#", active: false },
    { label: t("footer.standards"), href: "#", active: false },
  ];

  return (
    <footer className="flex h-36 w-full items-center justify-between border-t border-border-subtle bg-details-background px-6 py-10 sm:px-12 lg:px-22.5">
      <div className="flex items-center gap-20">
        {/* Logo */}
        <a href="#" aria-label={t("aria.logoHome")} className="shrink-0">
          <Image
            src="/logo.png"
            alt="Sun* Annual Awards 2025"
            width={69}
            height={64}
            className="h-16 w-auto"
          />
        </a>

        {/* Nav links — active link highlighted (current page) */}
        <nav className="flex flex-wrap items-center justify-center gap-12">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="no-underline">
              <Button
                type="button"
                variant="text"
                className={cn(
                  "text-body font-bold tracking-[0.15px]",
                  link.active && "bg-button-hover",
                )}
              >
                {link.label}
              </Button>
            </a>
          ))}
        </nav>
      </div>

      {/* Copyright */}
      <p className="text-secondary-1 text-body font-bold">
        {t("footer.copyright")}
      </p>
    </footer>
  );
}
