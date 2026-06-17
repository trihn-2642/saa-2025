/**
 * Homepage content data module — pure TypeScript, no React imports.
 *
 * Key-naming convention: titleKey / descKey are relative to the `homepage`
 * namespace. Consumers call `useTranslations("homepage")` and pass the key
 * directly: `t(card.titleKey)`.  Full message path is therefore
 * `homepage.<titleKey>`, e.g. `homepage.awards.items.top-talent.title`.
 */

export interface AwardCard {
  /** URL-safe slug, matches the i18n key segment and the image filename. */
  slug: string;
  /** next-intl key relative to the `homepage` namespace. */
  titleKey: string;
  /** next-intl key relative to the `homepage` namespace. */
  descKey: string;
  /** Absolute path from the `public/` root, ready for <Image src={...}>. */
  image: string;
  /**
   * Card link target.
   * Currently "#" (placeholder per clarifications decision 1).
   * Future: `/award-information#${slug}` — use awardHref() for forward-compat.
   */
  href: string;
}

/**
 * The 6 award cards in display order (matches design left→right, top→bottom).
 * Image paths resolve to existing files under public/awards/.
 */
export const AWARD_CARDS: AwardCard[] = [
  {
    slug: "top-talent",
    titleKey: "awards.items.top-talent.title",
    descKey: "awards.items.top-talent.desc",
    image: "/awards/top-talent.png",
    href: "#",
  },
  {
    slug: "top-project",
    titleKey: "awards.items.top-project.title",
    descKey: "awards.items.top-project.desc",
    image: "/awards/top-project.png",
    href: "#",
  },
  {
    slug: "top-project-leader",
    titleKey: "awards.items.top-project-leader.title",
    descKey: "awards.items.top-project-leader.desc",
    image: "/awards/top-project-leader.png",
    href: "#",
  },
  {
    slug: "best-manager",
    titleKey: "awards.items.best-manager.title",
    descKey: "awards.items.best-manager.desc",
    image: "/awards/best-manager.png",
    href: "#",
  },
  {
    slug: "signature-2025-creator",
    titleKey: "awards.items.signature-2025-creator.title",
    descKey: "awards.items.signature-2025-creator.desc",
    image: "/awards/signature-2025-creator.png",
    href: "#",
  },
  {
    slug: "mvp",
    titleKey: "awards.items.mvp.title",
    descKey: "awards.items.mvp.desc",
    image: "/awards/mvp.png",
    href: "#",
  },
];

/**
 * Returns the href for a given award slug.
 *
 * Currently returns "#" for all slugs (placeholder per clarifications decision 1).
 * Future implementation: return `/award-information#${slug}` once that page exists.
 *
 * Unit-testable: pure function with no side effects.
 */
export function awardHref(slug: string): string {
  // Future: return `/award-information#${slug}`;
  void slug;
  return "#";
}
