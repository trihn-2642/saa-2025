/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

import IcBell from "@icons/ic-bell.svg";
import IcRight from "@icons/ic-right.svg";
import IcUserProfile from "@icons/ic-user-profile.svg";

import {
  Dropdown,
  DropdownItem,
  type DropdownOption,
  DropdownSelect,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export interface HeaderUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface NavLink {
  label: string;
  href: string;
  selected?: boolean;
}

export interface HeaderProps {
  user?: HeaderUser | null;
  lang?: string;
  nav?: NavLink[];
  showBell?: boolean;
  className?: string;
  onLangChange?: (lang: string) => void;
  onLogout?: () => void;
  onProfile?: () => void;
}

const LANG_OPTIONS: DropdownOption[] = [
  {
    value: "vi",
    label: "VN",
    icon: <img src="/icons/ic-vn.svg" alt="" className="size-5 rounded-xs" />,
  },
  {
    value: "en",
    label: "EN",
    icon: <img src="/icons/ic-eng.svg" alt="" className="size-5 rounded-xs" />,
  },
];

function NavLinks({ links }: { links: NavLink[] }) {
  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {links.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className={cn(
            "group relative h-14 p-4 text-[16px] font-bold tracking-[0.15px] no-underline transition-colors",
            link.selected
              ? "text-primary-normal [text-shadow:0_0_8px_var(--button-glow)]"
              : "text-white hover:text-primary-normal",
          )}
        >
          {link.label}
          {/* Underline: full when active, grows from the left on hover */}
          <span
            aria-hidden
            className={cn(
              "absolute bottom-0 left-0 h-0.5 w-full origin-left bg-primary-normal transition-transform duration-300 ease-out",
              link.selected
                ? "scale-x-100"
                : "scale-x-0 group-hover:scale-x-100",
            )}
          />
        </Link>
      ))}
    </nav>
  );
}

/**
 * Account menu — icon-only square trigger (no avatar/name, per design 2167-9091)
 * opening a Profile (stub) + Logout dropdown (design 721-5223: label left, icon
 * right; Profile highlighted).
 */
function AccountMenu({
  profileLabel,
  logoutLabel,
  ariaLabel,
  onProfile,
  onLogout,
}: {
  profileLabel: string;
  logoutLabel: string;
  ariaLabel: string;
  onProfile?: () => void;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-lg border border-white/30 text-white transition-colors hover:bg-button-hover [&_svg]:size-5"
      >
        <IcUserProfile aria-hidden />
      </button>

      {open && (
        <Dropdown className="absolute top-full right-0 mt-2 min-w-33.25">
          <DropdownItem
            iconRight={<IcUserProfile aria-hidden />}
            onClick={() => {
              setOpen(false);
              onProfile?.();
            }}
          >
            {profileLabel}
          </DropdownItem>
          <DropdownItem
            iconRight={<IcRight aria-hidden />}
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
          >
            {logoutLabel}
          </DropdownItem>
        </Dropdown>
      )}
    </div>
  );
}

export function Header({
  user = null,
  lang = "vi",
  nav,
  showBell,
  className,
  onLangChange,
  onLogout,
  onProfile,
}: HeaderProps) {
  const t = useTranslations("common");
  const hasBell = showBell ?? nav !== undefined;
  const hasNav = nav !== undefined;

  const logo = (
    <Image
      src="/images/logo.png"
      alt="Sun* Annual Awards 2025"
      width={52}
      height={48}
      priority
      className="h-10 w-auto"
    />
  );

  return (
    <header
      className={cn(
        "relative z-20 flex h-20 w-full items-center justify-between bg-surface-overlay px-6 py-3 sm:px-12 lg:px-36",
        className,
      )}
    >
      {/* Left: logo + nav */}
      <div className="flex items-center gap-16">
        {hasNav ? (
          <Link
            href={ROUTES.home}
            aria-label={t("aria.logoHome")}
            className="flex items-center"
          >
            {logo}
          </Link>
        ) : (
          <div className="flex items-center">{logo}</div>
        )}
        {nav && <NavLinks links={nav} />}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {hasBell && (
              <button
                type="button"
                aria-label={t("aria.bell")}
                className="relative flex size-10 cursor-pointer items-center justify-center rounded-lg text-white transition-colors hover:bg-button-hover [&_svg]:size-6"
              >
                <IcBell aria-hidden />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-danger ring-2 ring-surface-strong" />
              </button>
            )}
            <DropdownSelect
              options={LANG_OPTIONS}
              value={lang}
              onValueChange={onLangChange}
              triggerVariant="text"
              buttonClassName="min-w-24"
            />
            <AccountMenu
              profileLabel={t("account.profile")}
              logoutLabel={t("logout")}
              ariaLabel={t("aria.account")}
              onProfile={onProfile}
              onLogout={onLogout}
            />
          </>
        ) : (
          /* Login page: language switcher only */
          <DropdownSelect
            options={LANG_OPTIONS}
            value={lang}
            onValueChange={onLangChange}
            triggerVariant="text"
            buttonClassName="min-w-24"
          />
        )}
      </div>
    </header>
  );
}
