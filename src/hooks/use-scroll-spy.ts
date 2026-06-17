"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which of the given element ids is the "active" section while scrolling.
 *
 * Uses a single IntersectionObserver over the elements found by id. The active
 * id is the topmost section currently intersecting the viewport band defined by
 * `rootMargin` — tuned so a section becomes active as it nears the top, under
 * the sticky header. SSR-safe (observer only runs on the client). Returns the
 * first id until scrolling determines otherwise.
 *
 * Unknown / missing ids are simply skipped — no throw (guards against an
 * invalid section id, per test case ID-13).
 */
export function useScrollSpy(
  ids: string[],
  rootMargin = "-96px 0px -55% 0px",
): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    if (typeof window === "undefined" || ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Track intersection ratios so we can pick the topmost visible section.
    const visible = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target.id, entry.isIntersecting);
        }
        // First id (in declared order) that is currently intersecting wins.
        const next = ids.find((id) => visible.get(id));
        if (next) setActiveId(next);
      },
      { rootMargin, threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return activeId;
}
