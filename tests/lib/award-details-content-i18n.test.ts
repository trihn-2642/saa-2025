import { describe, expect, it } from "vitest";
import { AWARD_DETAILS } from "@/lib/award-details-content";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";

/**
 * Deep recursive key parity checker: ensures both objects have identical key
 * structure at all nesting levels. Returns an array of mismatches (if any).
 */
function getKeyParity(
  viObj: Record<string, unknown>,
  enObj: Record<string, unknown>,
  path = "",
): string[] {
  const mismatches: string[] = [];

  // Check that top-level keys match
  const viKeys = Object.keys(viObj).sort();
  const enKeys = Object.keys(enObj).sort();

  if (JSON.stringify(viKeys) !== JSON.stringify(enKeys)) {
    const missing = enKeys.filter((k) => !viKeys.includes(k));
    const extra = viKeys.filter((k) => !enKeys.includes(k));
    if (missing.length > 0) {
      mismatches.push(
        `${path || "root"}: missing in VI: ${missing.join(", ")}`,
      );
    }
    if (extra.length > 0) {
      mismatches.push(`${path || "root"}: extra in VI: ${extra.join(", ")}`);
    }
  }

  // Recurse into nested objects
  viKeys.forEach((key) => {
    if (typeof viObj[key] === "object" && viObj[key] !== null) {
      const viNested = viObj[key] as Record<string, unknown>;
      const enNested = enObj[key] as Record<string, unknown>;

      if (typeof enNested !== "object" || enNested === null) {
        mismatches.push(
          `${path ? `${path}.${key}` : key}: type mismatch (VI is object, EN is not)`,
        );
      } else {
        const nested = getKeyParity(
          viNested,
          enNested,
          path ? `${path}.${key}` : key,
        );
        mismatches.push(...nested);
      }
    }
  });

  return mismatches;
}

describe("awardInfo i18n namespace structure", () => {
  it("both VI and EN have awardInfo namespace", () => {
    expect(viMessages).toHaveProperty("awardInfo");
    expect(enMessages).toHaveProperty("awardInfo");
  });

  it("awardInfo namespace has identical key structure in VI and EN (deep parity)", () => {
    const viAwardInfo = viMessages.awardInfo as Record<string, unknown>;
    const enAwardInfo = enMessages.awardInfo as Record<string, unknown>;

    const mismatches = getKeyParity(viAwardInfo, enAwardInfo);

    expect(
      mismatches,
      `awardInfo namespace key parity issues:\n${mismatches.join("\n")}`,
    ).toEqual([]);
  });

  it("awardInfo.items section has all 6 award slugs in both locales", () => {
    const viItems = viMessages.awardInfo.items as Record<string, unknown>;
    const enItems = enMessages.awardInfo.items as Record<string, unknown>;

    const expectedSlugs = AWARD_DETAILS.map((a) => a.slug);

    expectedSlugs.forEach((slug) => {
      expect(viItems, `Missing ${slug} in VI`).toHaveProperty(slug);
      expect(enItems, `Missing ${slug} in EN`).toHaveProperty(slug);
    });
  });

  it("awardInfo.items.<slug> has {title, desc} keys in both locales", () => {
    const viItems = viMessages.awardInfo.items as Record<string, unknown>;
    const enItems = enMessages.awardInfo.items as Record<string, unknown>;

    const expectedSlugs = AWARD_DETAILS.map((a) => a.slug);

    expectedSlugs.forEach((slug) => {
      const viItem = viItems[slug] as Record<string, unknown>;
      const enItem = enItems[slug] as Record<string, unknown>;

      expect(viItem).toHaveProperty("title");
      expect(viItem).toHaveProperty("desc");
      expect(enItem).toHaveProperty("title");
      expect(enItem).toHaveProperty("desc");
    });
  });

  it("awardInfo.units has {individual, team, both} keys in both locales", () => {
    const viUnits = viMessages.awardInfo.units as Record<string, unknown>;
    const enUnits = enMessages.awardInfo.units as Record<string, unknown>;

    const expectedUnitKeys = ["individual", "team", "both"];

    expectedUnitKeys.forEach((key) => {
      expect(viUnits).toHaveProperty(key);
      expect(enUnits).toHaveProperty(key);
    });
  });

  it("awardInfo.values has {perAward, forIndividual, forTeam} keys in both locales", () => {
    const viValues = viMessages.awardInfo.values as Record<string, unknown>;
    const enValues = enMessages.awardInfo.values as Record<string, unknown>;

    const expectedValueKeys = ["perAward", "forIndividual", "forTeam"];

    expectedValueKeys.forEach((key) => {
      expect(viValues).toHaveProperty(key);
      expect(enValues).toHaveProperty(key);
    });
  });

  it("awardInfo.nav has all 6 award slugs as keys in both locales", () => {
    const viNav = viMessages.awardInfo.nav as Record<string, unknown>;
    const enNav = enMessages.awardInfo.nav as Record<string, unknown>;

    const expectedSlugs = AWARD_DETAILS.map((a) => a.slug);

    expectedSlugs.forEach((slug) => {
      expect(viNav).toHaveProperty(slug);
      expect(enNav).toHaveProperty(slug);
    });
  });
});

describe("awardInfo i18n translation completeness", () => {
  it("all award titleKey values resolve to non-empty strings in both locales", () => {
    const viItems = viMessages.awardInfo.items as Record<
      string,
      Record<string, string>
    >;
    const enItems = enMessages.awardInfo.items as Record<
      string,
      Record<string, string>
    >;

    AWARD_DETAILS.forEach((award) => {
      const viTitle = viItems[award.slug.split(".").pop()!]?.title;
      const enTitle = enItems[award.slug.split(".").pop()!]?.title;

      expect(viTitle).toBeTruthy();
      expect(enTitle).toBeTruthy();
      expect(typeof viTitle).toBe("string");
      expect(typeof enTitle).toBe("string");
      expect(viTitle?.trim().length).toBeGreaterThan(0);
      expect(enTitle?.trim().length).toBeGreaterThan(0);
    });
  });

  it("all award descKey values resolve to non-empty strings in both locales", () => {
    const viItems = viMessages.awardInfo.items as Record<
      string,
      Record<string, string>
    >;
    const enItems = enMessages.awardInfo.items as Record<
      string,
      Record<string, string>
    >;

    AWARD_DETAILS.forEach((award) => {
      const viDesc = viItems[award.slug.split(".").pop()!]?.desc;
      const enDesc = enItems[award.slug.split(".").pop()!]?.desc;

      expect(viDesc).toBeTruthy();
      expect(enDesc).toBeTruthy();
      expect(typeof viDesc).toBe("string");
      expect(typeof enDesc).toBe("string");
      expect(viDesc?.trim().length).toBeGreaterThan(0);
      expect(enDesc?.trim().length).toBeGreaterThan(0);
    });
  });

  it("all award unitKey values resolve to non-empty strings in both locales", () => {
    const viUnits = viMessages.awardInfo.units as Record<string, string>;
    const enUnits = enMessages.awardInfo.units as Record<string, string>;

    AWARD_DETAILS.forEach((award) => {
      const unitKey = award.unitKey.split(".")[1];
      const viUnit = viUnits[unitKey];
      const enUnit = enUnits[unitKey];

      expect(viUnit).toBeTruthy();
      expect(enUnit).toBeTruthy();
      expect(typeof viUnit).toBe("string");
      expect(typeof enUnit).toBe("string");
      expect(viUnit?.trim().length).toBeGreaterThan(0);
      expect(enUnit?.trim().length).toBeGreaterThan(0);
    });
  });

  it("all award prize noteKey values resolve to non-empty strings in both locales (when present)", () => {
    const viValues = viMessages.awardInfo.values as Record<string, string>;
    const enValues = enMessages.awardInfo.values as Record<string, string>;

    AWARD_DETAILS.forEach((award) => {
      award.values.forEach((value) => {
        if (value.noteKey) {
          const noteKeySegment = value.noteKey.split(".")[1];
          const viNote = viValues[noteKeySegment];
          const enNote = enValues[noteKeySegment];

          expect(
            viNote,
            `Missing VI translation for ${value.noteKey}`,
          ).toBeTruthy();
          expect(
            enNote,
            `Missing EN translation for ${value.noteKey}`,
          ).toBeTruthy();
          expect(typeof viNote).toBe("string");
          expect(typeof enNote).toBe("string");
          expect(viNote?.trim().length).toBeGreaterThan(0);
          expect(enNote?.trim().length).toBeGreaterThan(0);
        }
      });
    });
  });

  it("no undefined/null/empty values in awardInfo namespace (data integrity)", () => {
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

    const viIssues = checkValues(viMessages.awardInfo);
    const enIssues = checkValues(enMessages.awardInfo);

    expect(
      viIssues,
      `VI awardInfo has integrity issues: ${viIssues.join("; ")}`,
    ).toEqual([]);
    expect(
      enIssues,
      `EN awardInfo has integrity issues: ${enIssues.join("; ")}`,
    ).toEqual([]);
  });
});
