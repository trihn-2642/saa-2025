"use client";

/**
 * WidgetButton — fixed bottom-right quick-action widget.
 *
 * Closed: a yellow pill (pencil + "/" + Sun* mark).
 * Open (on click): the trigger becomes a red ✕ close button and two action
 * pills appear above it — "Thể lệ" (rules) and "Viết KUDOS". The actions are
 * placeholders (no target pages yet — clarifications decision 1).
 */

import { useState } from "react";
import { useTranslations } from "next-intl";

import IcClose from "@icons/ic-close.svg";
import IcPen from "@icons/ic-pen.svg";
import IcRulesSAA from "@icons/ic-rules-saa.svg";

import { cn } from "@/lib/cn";

function ActionPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex min-w-37.25 cursor-pointer items-center gap-2 rounded-sm bg-primary-normal p-4 text-subtitle font-bold text-text-primary-2 shadow-button-glow transition-colors hover:bg-primary-light-active [&_svg]:size-6 [&_svg]:shrink-0"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function WidgetButton() {
  const t = useTranslations("homepage");
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      {/* Center to the 1512px canvas so the widget hugs the content edge, not the viewport */}
      <div className="relative mx-auto w-full max-w-378">
        <div className="pointer-events-auto absolute right-6 bottom-6 flex flex-col items-end gap-5">
          {open && (
            <>
              <ActionPill
                icon={<IcRulesSAA aria-hidden />}
                label={t("widgetMenu.rules")}
              />
              <ActionPill
                icon={<IcPen className="text-text-primary-2" aria-hidden />}
                label={t("widgetMenu.writeKudos")}
              />
            </>
          )}

          <button
            type="button"
            aria-label={open ? t("aria.close") : t("aria.widget")}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex cursor-pointer items-center justify-center shadow-button-glow transition-colors",
              open
                ? "size-14 rounded-full bg-danger text-white hover:bg-danger-hover [&_svg]:size-7"
                : "h-16 w-26.25 gap-2 rounded-full bg-primary-normal px-5 hover:bg-primary-light-active [&_svg]:size-5 [&_svg]:shrink-0",
            )}
          >
            {open ? (
              <IcClose aria-hidden />
            ) : (
              <>
                <IcPen className="text-text-primary-2" aria-hidden />
                <span
                  className="text-base font-bold text-text-primary-2"
                  aria-hidden
                >
                  /
                </span>
                <IcRulesSAA className="text-sun-red" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
