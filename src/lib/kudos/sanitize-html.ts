/**
 * Shared HTML sanitization for Kudos messages.
 *
 * Allowlist: structural + inline formatting tags only; scripts/styles stripped.
 * Links: forced rel="noopener nofollow" + target="_blank" for safety.
 *
 * Uses `sanitize-html` (pure JS, no DOM) so it runs identically in Node (server
 * actions) and the browser (card render). NOTE: do NOT use a jsdom-backed
 * sanitizer here — jsdom fails to load on Vercel's serverless runtime
 * (html-encoding-sniffer require()s an ESM-only dep), which 500s every server
 * action in the kudos feature.
 */

import sanitizeHtml from "sanitize-html";

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

/**
 * Sanitizes an HTML string using the kudos allowlist.
 * Safe to call on server (Node) and client (browser).
 *
 * @param html - Raw HTML from the rich-text editor.
 * @returns Sanitized HTML string.
 */
export function sanitizeKudosHtml(html: string): string {
  const clean = sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    // target/rel are added by transformTags below — they must be allow-listed
    // here too, otherwise sanitize-html strips them right back off.
    allowedAttributes: { a: ["href", "target", "rel"] },
    // Only http(s) and mailto links survive (blocks javascript:, data:, etc.).
    allowedSchemes: ["http", "https", "mailto"],
    // Force every surviving link to open safely.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener nofollow",
        },
      }),
    },
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
