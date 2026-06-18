/**
 * Award detail content for the /award-information page — pure TypeScript, no React.
 *
 * Richer than `homepage-content.ts` (AWARD_CARDS): the detail page needs the
 * award quantity, recipient unit, and 1–2 prize values per award. Copy
 * (titles, long descriptions, labels, unit + note words) lives in the
 * `awardInfo` i18n namespace; consumers call `useTranslations("awardInfo")`
 * and pass the keys here directly. Prize amounts are locale-independent VND
 * strings, so they stay inline (not i18n keys).
 *
 * Image path + i18n key segment are both derived from `slug`, so the slug is
 * the single source of truth (DRY) — matches files under public/images/awards/.
 */

/** One prize-value row. `amount` is the literal VND string; `noteKey` is an
 *  i18n key under `awardInfo` (e.g. "values.perAward"), optional. */
export interface AwardPrizeValue {
  amount: string;
  noteKey?: string;
}

export interface AwardDetail {
  /** URL-safe slug; matches public/images/awards/<slug>.png and the i18n key segment. */
  slug: string;
  /** Absolute path from public/ root. */
  image: string;
  /** next-intl key relative to the `awardInfo` namespace. */
  titleKey: string;
  /** next-intl key relative to the `awardInfo` namespace. */
  descKey: string;
  /** Award count as shown in the design, e.g. "10", "02". */
  quantity: string;
  /** next-intl key for the recipient unit: units.individual | units.team | units.both. */
  unitKey: string;
  /** One value (most awards) or two (Signature: individual vs team). */
  values: AwardPrizeValue[];
}

/** Build the standard image path + i18n keys from a slug (single source of truth). */
function award(
  slug: string,
  quantity: string,
  unitKey: string,
  values: AwardPrizeValue[],
): AwardDetail {
  return {
    slug,
    image: `/images/awards/${slug}.png`,
    titleKey: `items.${slug}.title`,
    descKey: `items.${slug}.desc`,
    quantity,
    unitKey,
    values,
  };
}

/** The 6 awards in design order (top → bottom), matching the sidebar nav order. */
export const AWARD_DETAILS: AwardDetail[] = [
  award("top-talent", "10", "units.individual", [
    { amount: "7.000.000 VNĐ", noteKey: "values.perAward" },
  ]),
  award("top-project", "02", "units.team", [
    { amount: "15.000.000 VNĐ", noteKey: "values.perAward" },
  ]),
  award("top-project-leader", "03", "units.individual", [
    { amount: "7.000.000 VNĐ", noteKey: "values.perAward" },
  ]),
  award("best-manager", "01", "units.individual", [
    { amount: "10.000.000 VNĐ" },
  ]),
  award("signature-2025-creator", "01", "units.both", [
    { amount: "5.000.000 VNĐ", noteKey: "values.forIndividual" },
    { amount: "8.000.000 VNĐ", noteKey: "values.forTeam" },
  ]),
  award("mvp", "01", "units.individual", [{ amount: "15.000.000 VNĐ" }]),
];

/** Sidebar nav order — same slugs, each label resolved via `nav.<slug>`. */
export const AWARD_NAV_SLUGS: string[] = AWARD_DETAILS.map((a) => a.slug);
