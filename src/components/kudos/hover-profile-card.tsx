"use client";

import { type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

import IcPen from "@icons/ic-pen.svg";

import { fetchProfileCard } from "@/app/(user)/(protected)/kudos/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useSubmitKudosStore } from "@/stores/submit-kudos-store";

import { BadgeChip } from "./badge-chip";

type ProfileCardData = Awaited<ReturnType<typeof fetchProfileCard>>;

// Popover width (w-86 = 344px) — used to clamp it within the viewport.
const POPOVER_WIDTH = 344;
const EDGE_MARGIN = 8;

export interface HoverProfileCardProps {
  /** Profile to load (lazily, on first hover). */
  profileId: string;
  /** The trigger element (e.g. the avatar). */
  children: ReactNode;
  /** Opens the "send kudos" flow from the card's CTA. */
  onSendKudo?: () => void;
  className?: string;
}

export function HoverProfileCard({
  profileId,
  children,
  onSendKudo,
  className,
}: HoverProfileCardProps) {
  const t = useTranslations("kudos");
  const openSubmitDialog = useSubmitKudosStore((s) => s.open);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState<ProfileCardData | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Show: position the popover below the trigger (clamped to viewport), lazy-load.
  const show = async () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const half = POPOVER_WIDTH / 2;
      const center = Math.min(
        Math.max(rect.left + rect.width / 2, half + EDGE_MARGIN),
        window.innerWidth - half - EDGE_MARGIN,
      );
      setCoords({ top: rect.bottom, left: center });
    }
    setOpen(true);
    if (!data) {
      try {
        setData(await fetchProfileCard(profileId));
      } catch (error) {
        console.error("Failed to load profile card data for", error);
      }
    }
  };

  // Hide on a short delay so the pointer can travel from trigger to popover.
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <span
      ref={triggerRef}
      className={cn("inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}

      {/* Rendered in a portal so it escapes any `overflow` scroll ancestor. */}
      {open &&
        data &&
        createPortal(
          <span
            onMouseEnter={show}
            onMouseLeave={hide}
            // pt-2 keeps a visual gap while the hover region stays continuous.
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: "translateX(-50%)",
            }}
            className="z-50 pt-2"
          >
            <span className="flex w-86 flex-col gap-4 rounded-2xl border border-primary-dark-hover bg-details-overlay p-4 text-left shadow-lg">
              <div className="flex flex-col gap-1">
                {/* Name */}
                <span className="text-cta font-bold text-primary-normal">
                  {data.fullName}
                </span>

                {/* Department */}
                <span className="text-sm leading-5 font-bold tracking-[0.1px] text-neutral-dark-hover">
                  {t("hoverCard.unit")} {data.departmentName ?? "—"}
                </span>

                {/* Badge */}
                {data.badge && (
                  <BadgeChip
                    tier={data.badge}
                    width={163.5}
                    height={28.5}
                    className="self-start"
                  />
                )}
              </div>

              <span className="block h-px w-full bg-border-subtle" />

              {/* Stats */}
              <span className="text-body font-bold tracking-[0.5px] text-white">
                {t("hoverCard.received")}{" "}
                <span className="text-primary-normal">
                  {data.kudosReceived}
                </span>
              </span>
              <span className="text-body font-bold tracking-[0.5px] text-white">
                {t("hoverCard.sent")}{" "}
                <span className="text-primary-normal">{data.kudosSent}</span>
              </span>

              {/* CTA */}
              <Button
                variant="primary"
                onClick={() =>
                  onSendKudo
                    ? onSendKudo()
                    : openSubmitDialog({
                        id: profileId,
                        fullName: data.fullName,
                      })
                }
                iconLeft={<IcPen aria-hidden className="size-6!" />}
                className="w-full py-2 text-body font-bold tracking-[0.15px]"
              >
                {t("hoverCard.cta")}
              </Button>
            </span>
          </span>,
          document.body,
        )}
    </span>
  );
}
