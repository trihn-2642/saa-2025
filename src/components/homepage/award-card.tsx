/**
 * AwardCard — single award entry in the awards grid (Figma 5005-14974).
 *
 * Presentational: receives all strings from parent (no i18n inside).
 * The orb PNG (square, 336px, glow + award name baked in) fills the card width;
 * title / description / detail link sit left-aligned below it. On image error,
 */

import Image from "next/image";
import Link from "next/link";

import IcUp from "@icons/ic-up.svg";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface AwardCardProps {
  /** Absolute path from public/ root, e.g. /images/awards/top-talent.png */
  imageSrc: string;
  /** Alt text for the award orb image */
  imageAlt: string;
  /** Award title, e.g. "Top Talent" */
  title: string;
  /** Short description */
  description: string;
  /** Link target — placeholder "#" until target pages exist */
  href?: string;
  /** Detail link label passed from parent, e.g. "Chi tiết" */
  detailLabel: string;
  className?: string;
}

export function AwardCard({
  imageSrc,
  imageAlt,
  title,
  description,
  href = "#",
  detailLabel,
  className,
}: AwardCardProps) {
  return (
    <article
      className={cn(
        "group flex w-84 flex-col rounded-2xl",
        "transition-all duration-200 ease-out",
        className,
      )}
    >
      <div className="relative aspect-square w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 384px"
          className="object-cover"
        />
      </div>

      <h3 className="mt-6 text-subtitle font-bold text-primary-normal">
        {title}
      </h3>

      <p className="mt-1 text-body tracking-[0.5px] text-white">
        {description}
      </p>

      <Link href={href} className="inline-block no-underline">
        <Button
          type="button"
          variant="text"
          className="px-0"
          iconRight={<IcUp aria-hidden className="size-6!" />}
        >
          {detailLabel}
        </Button>
      </Link>
    </article>
  );
}
