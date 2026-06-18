"use client";

import IcPanZoom from "@icons/ic-pan-zoom.svg";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { KudosSectionHeader } from "./kudos-section-header";

export interface SpotlightEntry {
  id: string;
  name: string;
  kudosCount: number;
  /** ISO timestamp of the most recent kudos received — drives the activity feed. */
  receivedAt?: string;
}

/** One activity-feed line — a single kudos event (not deduplicated). */
export interface SpotlightActivity {
  name: string;
  receivedAt: string;
}

export interface SpotlightBoardProps {
  totalKudos: number;
  /** Distinct receivers — the scattered name cloud. */
  entries: SpotlightEntry[];
  /** Recent kudos events (one per kudos) — the bottom activity feed. */
  activity?: SpotlightActivity[];
  onSearch?: (query: string) => void;
  onExpand?: () => void;
  className?: string;
}

// ─── Deterministic scatter ──────────────────────────────────────────────────
// Seeded pseudo-random so SSR and client agree (no Math.random hydration drift).
// Seeded by a hash of the name id, so positions stay put while filtering.

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Position (% within the panel) + size/colour bucket for a scattered name. */
function placeName(id: string, index: number) {
  const h = hashId(id);
  const left = 5 + rand(h + 1) * 88; // 5%–93%
  const top = 11 + rand(h + 97) * 74; // 11%–85%
  const sizeVal = rand(h + 41);

  // First (most recent) name is the red highlight, per design.
  let tone: string;
  if (index === 0) {
    tone = "text-base font-bold text-error";
  } else if (sizeVal < 0.12) {
    tone = "text-xl font-bold text-white";
  } else if (sizeVal < 0.34) {
    tone = "text-base font-bold text-white";
  } else {
    tone = "text-xs font-semibold text-white";
  }

  return { left, top, tone };
}

// ─── Activity feed time format ───────────────────────────────────────────────

/** ISO → "08:30PM" (12-hour, zero-padded, no space), matching the design. */
function formatActivityTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  const h12 = d.getHours() % 12 || 12;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h12)}:${p(d.getMinutes())}${ampm}`;
}

export function SpotlightBoard({
  totalKudos,
  entries,
  activity = [],
  onSearch,
  onExpand,
  className,
}: SpotlightBoardProps) {
  const t = useTranslations("kudos");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? entries.filter((e) => e.name.toLowerCase().includes(q))
      : entries;
  }, [entries, query]);

  // One line per kudos event (not deduplicated), newest first, max 6. The feed
  // renders bottom-up so the newest sits at the bottom, brightest.
  const recent = useMemo(
    () =>
      [...activity]
        .sort((a, b) => (b.receivedAt < a.receivedAt ? -1 : 1))
        .slice(0, 6),
    [activity],
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <section className={cn("flex flex-col gap-16", className)}>
      <KudosSectionHeader title="SPOTLIGHT BOARD" />

      {/* Board panel */}
      <div className="relative h-137 w-full overflow-hidden rounded-[47.14px] border border-primary-dark-hover bg-[#000000B2]">
        <Image
          src="/kudos-live-board/constellation.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="pointer-events-none absolute -top-8.75! -left-8.75! opacity-30"
        />

        {/* Ribbon artwork — flows up the left edge (transparent PNG, above the
            constellation). Softened + faded toward the right so it stays on the
            left and the constellation reads through instead of being covered. */}
        <Image
          src="/kudos-live-board/ribbon.png"
          alt=""
          aria-hidden
          width={1819}
          height={583}
          className="pointer-events-none absolute inset-y-0 -left-16 h-full w-auto max-w-none object-cover object-left opacity-30"
          style={{
            maskImage: "linear-gradient(to right, #000 25%, transparent 70%)",
            WebkitMaskImage:
              "linear-gradient(to right, #000 25%, transparent 70%)",
          }}
        />

        {/* Name cloud (behind the chrome). */}
        <div aria-hidden className="absolute inset-0">
          {filtered.map((entry, idx) => {
            const { left, top, tone } = placeName(entry.id, idx);
            return (
              <span
                key={entry.id}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap transition-colors hover:text-primary-normal",
                  tone,
                )}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {entry.name}
              </span>
            );
          })}
        </div>

        {/* Search — top-left */}
        <SearchInput
          onSearch={handleSearch}
          placeholder={t("spotlight.search")}
          containerClassName="absolute left-6 top-6 z-10 h-9.75 w-54.75 bg-details-container"
          iconClassName="size-4!"
          className="text-[10.92px] leading-[16.38px] font-medium tracking-[0.1px]"
        />

        {/* Total count — top-center */}
        <span className="absolute top-6 left-1/2 z-10 -translate-x-1/2 text-heading font-bold text-white">
          {totalKudos} KUDOS
        </span>

        {/* Live activity feed — bottom-left */}
        {recent.length > 0 && (
          <div className="absolute bottom-6 left-6 z-10 flex flex-col-reverse gap-1">
            {recent.map((e, i) => (
              <p
                // Events aren't deduped (a name can repeat) — index keeps keys unique.
                key={`${e.receivedAt}-${i}`}
                className="text-sm whitespace-nowrap"
                style={{ opacity: 1 - i * 0.15 }}
              >
                <span className="text-base leading-5 font-bold tracking-[0.1px] text-neutral-dark-hover">
                  {formatActivityTime(e.receivedAt)}
                </span>{" "}
                <span className="text-body font-bold tracking-[0.15px] text-white">
                  {e.name}
                </span>{" "}
                <span className="text-base leading-5 font-bold tracking-[0.1px] text-white">
                  {t("spotlight.activitySuffix")}
                </span>
              </p>
            ))}
          </div>
        )}

        {/* Expand — bottom-right */}
        <Button
          variant="icon"
          onClick={onExpand}
          aria-label={t("spotlight.expand")}
          className="absolute right-6 bottom-6 z-10"
        >
          <IcPanZoom aria-hidden className="size-6!" />
        </Button>
      </div>
    </section>
  );
}
