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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export function SiteFooter() {
  const t = useTranslations("common");
  const pathname = usePathname();

  // Links point to placeholders for now; the link for the current page is
  // active. /home is the "About SAA 2025" landing → first link active there.
  const navLinks = [
    {
      label: t("nav.aboutSaa"),
      href: ROUTES.home,
      active: pathname === ROUTES.home,
    },
    {
      label: t("nav.awardInfo"),
      href: ROUTES.awardInformation,
      active: pathname === ROUTES.awardInformation,
    },
    {
      label: t("nav.kudos"),
      href: ROUTES.kudos,
      active: pathname === ROUTES.kudos,
    },
    {
      label: t("footer.standards"),
      href: "#",
      active: false,
    },
  ];

  return (
    <footer className="flex h-36 w-full items-center justify-between border-t border-border-subtle bg-details-background px-6 py-10 sm:px-12 lg:px-22.5">
      <div className="flex items-center gap-20">
        {/* Logo */}
        <Link
          href={ROUTES.home}
          aria-label={t("aria.logoHome")}
          className="shrink-0"
        >
          <Image
            src="/images/logo.png"
            alt="Sun* Annual Awards 2025"
            width={69}
            height={64}
            className="h-16 w-auto"
          />
        </Link>

        {/* Nav links — active link highlighted (current page) */}
        <nav className="flex flex-wrap items-center justify-center gap-12">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className="no-underline">
              <Button
                type="button"
                variant="text"
                className={cn(
                  "text-body font-bold tracking-[0.15px]",
                  link.active && "bg-button-hover text-shadow-glow",
                )}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Copyright */}
      <p className="text-body font-bold text-white">{t("footer.copyright")}</p>
    </footer>
  );
}
