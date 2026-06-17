import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge configured with our custom theme tokens so it resolves
 * conflicts correctly:
 *  - `text-body` / `text-subtitle` / `text-cta` are FONT SIZES (from @theme),
 *    not colors — otherwise twMerge treats `text-cta` as a text-color and
 *    drops the variant's `text-text-primary-2`, turning button text white.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["body", "subtitle", "cta"] }],
    },
  },
});

/** Merge class names, resolving Tailwind conflicts (shadcn-style). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
