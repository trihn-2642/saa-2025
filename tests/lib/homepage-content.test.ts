import { describe, expect, it } from "vitest";
import { AWARD_CARDS, awardHref } from "@/lib/homepage-content";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

describe("AWARD_CARDS", () => {
  it("has exactly 6 cards in the correct order", () => {
    expect(AWARD_CARDS).toHaveLength(6);
    expect(AWARD_CARDS.map((card) => card.slug)).toEqual([
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]);
  });

  it("all cards have valid image paths matching the slug pattern", () => {
    AWARD_CARDS.forEach((card) => {
      expect(card.image).toBe(`/awards/${card.slug}.png`);
    });
  });

  it("all cards have titleKey matching awards.items.<slug>.title pattern", () => {
    AWARD_CARDS.forEach((card) => {
      expect(card.titleKey).toBe(`awards.items.${card.slug}.title`);
    });
  });

  it("all cards have descKey matching awards.items.<slug>.desc pattern", () => {
    AWARD_CARDS.forEach((card) => {
      expect(card.descKey).toBe(`awards.items.${card.slug}.desc`);
    });
  });

  it("all cards have href set to '#'", () => {
    AWARD_CARDS.forEach((card) => {
      expect(card.href).toBe("#");
    });
  });

  it("all cards are well-formed AwardCard objects", () => {
    AWARD_CARDS.forEach((card) => {
      expect(card).toHaveProperty("slug");
      expect(card).toHaveProperty("titleKey");
      expect(card).toHaveProperty("descKey");
      expect(card).toHaveProperty("image");
      expect(card).toHaveProperty("href");
      expect(typeof card.slug).toBe("string");
      expect(typeof card.titleKey).toBe("string");
      expect(typeof card.descKey).toBe("string");
      expect(typeof card.image).toBe("string");
      expect(typeof card.href).toBe("string");
    });
  });
});

describe("awardHref", () => {
  it("returns '#' for any slug", () => {
    expect(awardHref("top-talent")).toBe("#");
    expect(awardHref("mvp")).toBe("#");
    expect(awardHref("unknown-award")).toBe("#");
    expect(awardHref("")).toBe("#");
  });
});

describe("i18n: Vietnamese messages (vi.json)", () => {
  it("contains homepage namespace with awards.items structure", () => {
    expect(viMessages).toHaveProperty("homepage");
    expect(viMessages.homepage).toHaveProperty("awards");
    expect(viMessages.homepage.awards).toHaveProperty("items");
  });

  it("has keys for all award card slugs in vi.json", () => {
    const awardItems = viMessages.homepage.awards.items as Record<
      string,
      Record<string, string>
    >;
    AWARD_CARDS.forEach((card) => {
      expect(awardItems).toHaveProperty(card.slug);
      expect(awardItems[card.slug]).toHaveProperty("title");
      expect(awardItems[card.slug]).toHaveProperty("desc");
      expect(awardItems[card.slug].title).toBeTruthy();
      expect(awardItems[card.slug].desc).toBeTruthy();
    });
  });
});

describe("i18n: English messages (en.json)", () => {
  it("contains homepage namespace with awards.items structure", () => {
    expect(enMessages).toHaveProperty("homepage");
    expect(enMessages.homepage).toHaveProperty("awards");
    expect(enMessages.homepage.awards).toHaveProperty("items");
  });

  it("has keys for all award card slugs in en.json", () => {
    const awardItems = enMessages.homepage.awards.items as Record<
      string,
      Record<string, string>
    >;
    AWARD_CARDS.forEach((card) => {
      expect(awardItems).toHaveProperty(card.slug);
      expect(awardItems[card.slug]).toHaveProperty("title");
      expect(awardItems[card.slug]).toHaveProperty("desc");
      expect(awardItems[card.slug].title).toBeTruthy();
      expect(awardItems[card.slug].desc).toBeTruthy();
    });
  });
});

describe("i18n parity: VI ↔ EN", () => {
  it("both languages have matching award item keys", () => {
    const viItems = viMessages.homepage.awards.items as Record<string, unknown>;
    const enItems = enMessages.homepage.awards.items as Record<string, unknown>;

    const viKeys = Object.keys(viItems).sort();
    const enKeys = Object.keys(enItems).sort();

    expect(viKeys).toEqual(enKeys);
  });

  it("both languages have matching {title, desc} keys for each award", () => {
    const viItems = viMessages.homepage.awards.items as Record<
      string,
      Record<string, string>
    >;
    const enItems = enMessages.homepage.awards.items as Record<
      string,
      Record<string, string>
    >;

    Object.keys(viItems).forEach((slug) => {
      expect(enItems[slug]).toBeDefined();
      expect(Object.keys(viItems[slug]).sort()).toEqual(
        Object.keys(enItems[slug]).sort(),
      );
    });
  });

  /**
   * Deep parity check: `common` namespace must have identical keys & structure.
   * This catches missing-key bugs from namespace refactors (header, footer, account, aria).
   */
  it("common namespace: VI and EN have identical top-level keys", () => {
    const viCommon = viMessages.common as Record<string, unknown>;
    const enCommon = enMessages.common as Record<string, unknown>;

    const viKeys = Object.keys(viCommon).sort();
    const enKeys = Object.keys(enCommon).sort();

    expect(viKeys).toEqual(enKeys);
  });

  it("common namespace: each section (nav, footer, account, aria) matches structure", () => {
    const sections = ["nav", "footer", "account", "aria"] as const;

    sections.forEach((section) => {
      const viSection = viMessages.common[
        section as keyof typeof viMessages.common
      ] as Record<string, unknown>;
      const enSection = enMessages.common[
        section as keyof typeof enMessages.common
      ] as Record<string, unknown>;

      expect(viSection).toBeDefined();
      expect(enSection).toBeDefined();

      const viKeys = Object.keys(viSection).sort();
      const enKeys = Object.keys(enSection).sort();

      expect(viKeys, `common.${section} key mismatch`).toEqual(enKeys);
    });
  });

  it("homepage namespace: deep parity across all top-level sections (hero, rootFurther, awards, kudosSection, aria, widgetMenu)", () => {
    const viHomepage = viMessages.homepage as Record<string, unknown>;
    const enHomepage = enMessages.homepage as Record<string, unknown>;

    const viKeys = Object.keys(viHomepage).sort();
    const enKeys = Object.keys(enHomepage).sort();

    expect(viKeys, "homepage namespace section mismatch").toEqual(enKeys);
  });

  it("common + homepage namespaces: no undefined/null/empty values (data integrity)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkValues = (obj: any, path = ""): string[] => {
      const issues: string[] = [];
      Object.entries(obj).forEach(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        if (value === null || value === undefined) {
          issues.push(`${fullPath} is null/undefined`);
        } else if (typeof value === "string" && value.trim() === "") {
          issues.push(`${fullPath} is empty string`);
        } else if (typeof value === "object") {
          issues.push(...checkValues(value, fullPath));
        }
      });
      return issues;
    };

    const viIssues = checkValues({
      common: viMessages.common,
      homepage: viMessages.homepage,
    });
    const enIssues = checkValues({
      common: enMessages.common,
      homepage: enMessages.homepage,
    });

    expect(viIssues, `VI messages have issues`).toEqual([]);
    expect(enIssues, `EN messages have issues`).toEqual([]);
  });
});
