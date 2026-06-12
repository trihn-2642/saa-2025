/* eslint-disable @next/next/no-img-element */
"use client";

import IcDown from "@icons/ic-down.svg";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownSelect,
  type DropdownOption,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/cn";

/**
 * Auth-aware site header (from Figma "Login" screen).
 *
 * Layout: SAA logo (left, non-interactive) + language switcher (right).
 * When `user` is provided, a profile dropdown replaces the switcher area
 * (avatar/name → "Logout" item). On the login page, pass user=null.
 *
 * Presentational: switcher value/onChange and onLogout are all passed in.
 * Real auth wiring happens in parent pages/layouts.
 */

export interface HeaderUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface HeaderProps {
  /** Currently authenticated user. null = logged-out state (login page). */
  user?: HeaderUser | null;
  /** Controlled language value ("vi" | "en"). */
  lang?: string;
  /** Called when user changes language. */
  onLangChange?: (lang: string) => void;
  /** Called when user clicks "Logout" from profile dropdown. */
  onLogout?: () => void;
  className?: string;
}

function getLangOptions(): DropdownOption[] {
  return [
    {
      value: "vi",
      label: "VN",
      icon: <img src="/icons/ic-vn.svg" alt="" className="size-5 rounded-xs" />,
    },
    {
      value: "en",
      label: "EN",
      icon: (
        <img src="/icons/ic-eng.svg" alt="" className="size-5 rounded-xs" />
      ),
    },
  ];
}

export function Header({
  user = null,
  lang = "vi",
  onLangChange,
  onLogout,
  className,
}: HeaderProps) {
  const t = useTranslations("common");
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header
      className={cn(
        "relative z-20 flex h-20 w-full items-center justify-between bg-[rgba(11,15,18,0.8)] px-6 py-3 sm:px-12 lg:px-36",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Sun* Annual Awards 2025"
          width={52}
          height={48}
          priority
          className="h-10 w-auto"
        />
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          /* Profile dropdown (authenticated state) */
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((o) => !o)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-montserrat text-sm text-white transition-colors hover:bg-button-hover"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-primary-normal font-montserrat text-sm font-bold text-text-primary-2">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-35 truncate">{user.name}</span>
              <IcDown
                className={cn(
                  "size-4 transition-transform",
                  profileOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>

            {profileOpen && (
              <Dropdown className="absolute top-full right-0 mt-2 min-w-40">
                <DropdownItem
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className="cursor-pointer"
                >
                  {t("logout")}
                </DropdownItem>
              </Dropdown>
            )}
          </div>
        ) : (
          /* Language switcher (unauthenticated / login page) */
          <DropdownSelect
            options={getLangOptions()}
            value={lang}
            onValueChange={onLangChange}
            triggerVariant="text"
            buttonClassName="min-w-27"
          />
        )}
      </div>
    </header>
  );
}
