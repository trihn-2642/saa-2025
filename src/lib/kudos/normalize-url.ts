/**
 * Normalize a user-entered URL for use in a link.
 *
 * Keeps the safe schemes (http, https, mailto, tel) as-is; anything else gets a
 * `https://` prefix. This neutralizes dangerous schemes too — e.g.
 * `javascript:alert(1)` becomes `https://javascript:alert(1)` (inert) — as a
 * first line of defense (the server still sanitizes the stored HTML).
 */
export function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  return /^(https?:|mailto:|tel:)/i.test(u) ? u : `https://${u}`;
}
