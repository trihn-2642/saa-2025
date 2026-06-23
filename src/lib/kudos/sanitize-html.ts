/**
 * Shared HTML sanitization for Kudos messages.
 *
 * Allowlist: structural + inline formatting tags only; scripts/styles stripped.
 * Links: forced rel="noopener nofollow" + target="_blank" for safety.
 *
 * Works in both Node (server actions) and browser (card render) via
 * isomorphic-dompurify which switches between DOMPurify and jsdom under the hood.
 */

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "s",
  "ol",
  "ul",
  "li",
  "a",
  "blockquote",
];

const ALLOWED_ATTR = ["href"];

/**
 * Sanitizes an HTML string using the kudos allowlist.
 * Safe to call on server (Node) and client (browser).
 *
 * @param html - Raw HTML from the rich-text editor.
 * @returns Sanitized HTML string.
 */
export function sanitizeKudosHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force all links to open safely — applied after sanitize via hook.
    ADD_ATTR: ["target", "rel"],
  });
  // Normalize non-breaking spaces to regular spaces: some editors emit &nbsp;
  // between every word, which turns a whole sentence into one unbreakable
  // "word" and forces mid-word line breaks. Regular spaces let it wrap by word.
  return clean.replace(/\u00a0|&nbsp;/g, " ");
}

/**
 * Returns true if the given HTML has non-empty visible text content
 * (i.e. stripping all tags leaves at least one non-whitespace character).
 */
export function isHtmlContentEmpty(html: string): boolean {
  const stripped = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .trim();
  return stripped.length === 0;
}

// Force all <a> tags to have safe attributes after DOMPurify cleans them.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("rel", "noopener nofollow");
    node.setAttribute("target", "_blank");
  }
});
