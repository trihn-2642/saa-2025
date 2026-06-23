/**
 * Centralized app route paths.
 *
 * Single source of truth for internal links/redirects — change a path here once
 * and every place that imports ROUTES updates. Avoids scattered string literals
 * like "/home" / "/kudos" across headers, footers, redirects, etc.
 */
export const ROUTES = {
  home: "/",
  awardInformation: "/award-information",
  kudos: "/kudos",
  login: "/login",
  countdown: "/countdown",
} as const;

/** Union of the defined route paths, e.g. "/home" | "/award-information" | … */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
