import Image from "next/image";

import { AwardsSection } from "@/components/homepage/awards-section";
import { Hero } from "@/components/homepage/hero";
import { KudosSection } from "@/components/homepage/kudos-section";
import { RootFurther } from "@/components/homepage/root-further";
import { WidgetButton } from "@/components/homepage/widget-button";

/**
 * Homepage SAA.
 *
 * Auth guard, profile read, shared header + footer all live in the
 * (protected) layout. This page owns only the homepage body composition.
 *
 * Hero + RootFurther share one continuous keyvisual background that fades from
 * the colorful roots (top) down to the solid details-background (bottom), so
 * the description text sits over a dimmed part of the same image (per design).
 */
export default function HomePage() {
  return (
    <>
      {/* -mt-20 slides this up behind the sticky header (h-20) so the keyvisual
          shows through the header's translucent background (per design). */}
      <div className="relative isolate -mt-20 overflow-hidden bg-details-background">
        {/* Shared keyvisual — pinned to the top at its natural aspect (not
            stretched), fading into the solid bg toward the bottom. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
          <div className="relative w-full">
            <Image
              src="/images/homepage-saa/keyvisual.jpg"
              alt=""
              width={1508}
              height={1392}
              sizes="100vw"
              priority
              aria-hidden
              className="h-auto w-full"
            />
            {/* Figma "Cover" gradient (node 2167-9029): transparent at the top
                (keyvisual visible) → solid #00101A toward the bottom. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,19,32,0) 51%, rgba(0,18,29,0.462) 64%, rgba(0,16,26,1) 81%)",
              }}
              aria-hidden
            />
          </div>
        </div>

        <Hero />
        <RootFurther />
      </div>

      <AwardsSection />
      <KudosSection />
      <WidgetButton />
    </>
  );
}
