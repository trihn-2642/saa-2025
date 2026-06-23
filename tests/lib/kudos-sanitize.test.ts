import { describe, expect, it } from "vitest";

import {
  isHtmlContentEmpty,
  sanitizeKudosHtml,
} from "@/lib/kudos/sanitize-html";

/**
 * sanitize-html.ts — the authoritative XSS guard for kudos messages
 * (submitKudos is directly callable). Pure, runs in Node via isomorphic-dompurify.
 */

describe("sanitizeKudosHtml", () => {
  it("keeps allowed formatting tags", () => {
    const html =
      "<p><strong>bold</strong> <em>i</em> <s>x</s></p><ol><li>one</li></ol><blockquote>q</blockquote>";
    const out = sanitizeKudosHtml(html);
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>i</em>");
    expect(out).toContain("<li>one</li>");
    expect(out).toContain("<blockquote>q</blockquote>");
  });

  it("strips <script> and inline event handlers", () => {
    const out = sanitizeKudosHtml(
      '<p onclick="alert(1)">hi</p><script>alert(2)</script>',
    );
    expect(out).not.toContain("<script");
    expect(out).not.toContain("onclick");
    expect(out).toContain("hi");
  });

  it("drops a javascript: href (no executable link survives)", () => {
    const out = sanitizeKudosHtml('<a href="javascript:alert(1)">x</a>');
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("keeps a safe http(s) link and forces safe rel/target", () => {
    const out = sanitizeKudosHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('rel="noopener nofollow"');
    expect(out).toContain('target="_blank"');
  });

  it("normalizes non-breaking spaces to regular spaces", () => {
    expect(sanitizeKudosHtml("<p>a&nbsp;b</p>")).toBe("<p>a b</p>");
    expect(sanitizeKudosHtml("<p>a b</p>")).toBe("<p>a b</p>");
  });
});

describe("isHtmlContentEmpty", () => {
  it("is true for empty, whitespace, or tags/entities only", () => {
    expect(isHtmlContentEmpty("")).toBe(true);
    expect(isHtmlContentEmpty("   ")).toBe(true);
    expect(isHtmlContentEmpty("<p></p>")).toBe(true);
    expect(isHtmlContentEmpty("<p><br></p>")).toBe(true);
    expect(isHtmlContentEmpty("<p>&nbsp;</p>")).toBe(true);
  });

  it("is false when there is visible text", () => {
    expect(isHtmlContentEmpty("<p>hello</p>")).toBe(false);
    expect(isHtmlContentEmpty("<ol><li>x</li></ol>")).toBe(false);
  });
});
