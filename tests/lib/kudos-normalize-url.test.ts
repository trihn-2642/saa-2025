import { describe, expect, it } from "vitest";

import { normalizeUrl } from "@/lib/kudos/normalize-url";

describe("normalizeUrl", () => {
  it("keeps safe schemes as-is", () => {
    expect(normalizeUrl("https://a.com")).toBe("https://a.com");
    expect(normalizeUrl("http://a.com")).toBe("http://a.com");
    expect(normalizeUrl("mailto:x@y.com")).toBe("mailto:x@y.com");
    expect(normalizeUrl("tel:+84")).toBe("tel:+84");
    expect(normalizeUrl("HTTPS://A.com")).toBe("HTTPS://A.com");
  });

  it("prepends https:// when there is no scheme", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("localhost:3000/kudos")).toBe(
      "https://localhost:3000/kudos",
    );
  });

  it("neutralizes dangerous schemes by prefixing https://", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBe(
      "https://javascript:alert(1)",
    );
    expect(normalizeUrl("data:text/html,x")).toBe("https://data:text/html,x");
  });

  it("trims and returns '' for empty input", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
    expect(normalizeUrl("  a.com  ")).toBe("https://a.com");
  });
});
