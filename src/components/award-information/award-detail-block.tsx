import IcDiamond from "@icons/ic-diamond.svg";
import IcLicense from "@icons/ic-license.svg";
import IcTarget from "@icons/ic-target.svg";
import Image from "next/image";

export interface AwardValue {
  /** Prize amount string, e.g. "7.000.000 VNĐ" */
  amount: string;
  /** Optional clarifying note below the amount, e.g. "cho mỗi giải thưởng" */
  note?: string;
}

export interface AwardDetailBlockProps {
  /** URL-safe slug, also used as the scroll-spy anchor id */
  slug: string;
  /** Absolute path from public/ root, e.g. /awards/top-talent.png */
  imageSrc: string;
  /** Descriptive alt text for the award orb image */
  imageAlt: string;
  /** Award title, e.g. "Top Talent" */
  title: string;
  /** Full Vietnamese description text (verbatim from Figma) */
  description: string;
  /** Label before the quantity value, e.g. "Số lượng giải thưởng" */
  quantityLabel: string;
  /** Quantity number as string, e.g. "10" */
  quantity: string;
  /** Unit after quantity, e.g. "Cá nhân" or "Tập thể" */
  unit: string;
  /** Label before the prize value(s), e.g. "Giá trị giải thưởng" */
  valueLabel: string;
  /** One or two prize value entries */
  values: AwardValue[];
  /** Separator label shown between multiple values, e.g. "Hoặc". Only used when values.length > 1. */
  orLabel?: string;
  /** When true the image column appears on the RIGHT. Defaults to false (left). */
  imageOnRight?: boolean;
}

export function AwardDetailBlock({
  slug,
  imageSrc,
  imageAlt,
  title,
  description,
  quantityLabel,
  quantity,
  unit,
  valueLabel,
  values,
  orLabel,
  imageOnRight = false,
}: AwardDetailBlockProps) {
  return (
    /* Section anchor used by scroll-spy; gap-20 sits between row and divider. */
    <section id={slug} className="flex scroll-mt-24 flex-col gap-20">
      <div
        className={`flex items-start gap-10 ${imageOnRight ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Award image — gold ring + glow per design */}
        <div className="relative size-84 shrink-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="336px"
            className="object-cover"
          />
        </div>

        {/* Content column */}
        <div className="flex flex-1 flex-col gap-8">
          {/* 1. Title + description */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <IcTarget aria-hidden className="size-6 shrink-0" />
              <h2 className="text-subtitle font-bold text-primary-normal">
                {title}
              </h2>
            </div>
            <p className="text-body font-bold tracking-[0.5px] text-white">
              {description}
            </p>
          </div>

          <span className="block h-px w-full bg-border-subtle" />

          {/* 2. Quantity */}
          <div className="flex items-center gap-4">
            <IcDiamond aria-hidden className="size-6 shrink-0" />
            <p className="text-subtitle font-bold text-primary-normal">
              {quantityLabel}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-[36px] leading-11 font-bold text-white">
                {quantity}
              </span>
              <span className="w-15 text-sm font-bold tracking-[0.1px] text-white">
                {unit}
              </span>
            </p>
          </div>

          <span className="block h-px w-full bg-border-subtle" />

          {/* 3. Prize value(s) — label once, then 1–2 amount + note rows */}
          <div className="flex flex-col gap-4">
            {values.map((v, i) => (
              <div key={v.amount} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <IcLicense aria-hidden className="size-6 shrink-0" />
                  <p className="text-subtitle font-bold text-primary-normal">
                    {valueLabel}
                  </p>
                </div>

                <span className="text-[36px] leading-11 font-bold text-white">
                  {v.amount}
                </span>
                {v.note && (
                  <span className="text-sm font-bold tracking-[0.1px] text-white">
                    {v.note}
                  </span>
                )}

                {/* "Hoặc" (Or) divider between prize tiers — e.g. Signature's individual vs. team amount. */}
                {orLabel && i < values.length - 1 && (
                  <div className="flex items-center gap-2 text-sm font-bold tracking-[0.1px] text-border-subtle">
                    {orLabel}
                    <span className="h-px flex-1 bg-border-subtle" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-block bottom divider */}
      <span className="block h-px w-full bg-border-subtle" />
    </section>
  );
}
