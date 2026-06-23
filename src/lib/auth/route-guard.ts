/**
 * Pure route-protection decision — no Next/Supabase imports so it's trivially
 * unit-testable. Used by the Supabase middleware (updateSession).
 */
// "/" is the protected home (exact match — a prefix would match everything).
export const PROTECTED_EXACT = ["/"];
export const PROTECTED_PREFIXES = ["/kudos", "/award-information"];
export const AUTH_ONLY_PATHS = ["/login"]; // redirect away when already signed in

export function decideRedirect(args: {
  hasUser: boolean;
  pathname: string;
}): string | null {
  const { hasUser, pathname } = args;
  const isProtected =
    PROTECTED_EXACT.includes(pathname) ||
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PATHS.includes(pathname);

  if (!hasUser && isProtected) return "/login";
  if (hasUser && isAuthOnly) return "/";
  return null;
}
