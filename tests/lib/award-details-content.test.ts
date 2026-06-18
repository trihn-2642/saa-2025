import { describe, expect, it } from "vitest";

import { AWARD_DETAILS, AWARD_NAV_SLUGS } from "@/lib/award-details-content";

describe("AWARD_DETAILS", () => {
  it("has exactly 6 awards in the correct order", () => {
    expect(AWARD_DETAILS).toHaveLength(6);
    expect(AWARD_DETAILS.map((award) => award.slug)).toEqual([
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]);
  });

  it("all awards have valid image paths matching the slug pattern", () => {
    AWARD_DETAILS.forEach((award) => {
      expect(award.image).toBe(`/images/awards/${award.slug}.png`);
    });
  });

  it("all awards have titleKey matching items.<slug>.title pattern", () => {
    AWARD_DETAILS.forEach((award) => {
      expect(award.titleKey).toBe(`items.${award.slug}.title`);
    });
  });

  it("all awards have descKey matching items.<slug>.desc pattern", () => {
    AWARD_DETAILS.forEach((award) => {
      expect(award.descKey).toBe(`items.${award.slug}.desc`);
    });
  });

  it("signature-2025-creator has exactly 2 values; all others have exactly 1", () => {
    AWARD_DETAILS.forEach((award) => {
      if (award.slug === "signature-2025-creator") {
        expect(award.values).toHaveLength(2);
      } else {
        expect(award.values).toHaveLength(1);
      }
    });
  });

  it("all awards have unitKey set to one of the unit options", () => {
    const validUnitKeys = ["units.individual", "units.team", "units.both"];
    AWARD_DETAILS.forEach((award) => {
      expect(validUnitKeys).toContain(award.unitKey);
    });
  });

  it("all prize values have amount string and optional noteKey", () => {
    AWARD_DETAILS.forEach((award) => {
      award.values.forEach((value) => {
        expect(typeof value.amount).toBe("string");
        expect(value.amount.length).toBeGreaterThan(0);
        if (value.noteKey !== undefined) {
          expect(typeof value.noteKey).toBe("string");
          expect(value.noteKey.length).toBeGreaterThan(0);
        }
      });
    });
  });

  it("all awards have quantity string property", () => {
    AWARD_DETAILS.forEach((award) => {
      expect(typeof award.quantity).toBe("string");
      expect(award.quantity.length).toBeGreaterThan(0);
    });
  });

  it("all awards are well-formed AwardDetail objects", () => {
    AWARD_DETAILS.forEach((award) => {
      expect(award).toHaveProperty("slug");
      expect(award).toHaveProperty("image");
      expect(award).toHaveProperty("titleKey");
      expect(award).toHaveProperty("descKey");
      expect(award).toHaveProperty("quantity");
      expect(award).toHaveProperty("unitKey");
      expect(award).toHaveProperty("values");
      expect(Array.isArray(award.values)).toBe(true);
    });
  });
});

describe("AWARD_NAV_SLUGS", () => {
  it("is derived from AWARD_DETAILS and matches their slug order", () => {
    const expectedSlugs = AWARD_DETAILS.map((a) => a.slug);
    expect(AWARD_NAV_SLUGS).toEqual(expectedSlugs);
  });

  it("has exactly 6 slugs in the correct order", () => {
    expect(AWARD_NAV_SLUGS).toHaveLength(6);
    expect(AWARD_NAV_SLUGS).toEqual([
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]);
  });

  it("all slugs are non-empty strings", () => {
    AWARD_NAV_SLUGS.forEach((slug) => {
      expect(typeof slug).toBe("string");
      expect(slug.length).toBeGreaterThan(0);
    });
  });
});
