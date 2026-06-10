/**
 * CountdownDigit — a single LED 7-segment digit in its own translucent box.
 *
 * Visual values are taken verbatim from the Figma design (node Rectangle 1):
 *   box 76.8×122.88px, radius 12px, 0.75px #FFEA9E border, opacity 0.5,
 *   linear-gradient(180deg, #FFF 0%, rgba(255,255,255,.1) 100%), backdrop-blur 25px.
 * The digit glyph (font "Digital Numbers" in Figma) is rendered with DSEG7
 * Classic at full white opacity, layered above the translucent box.
 *
 * Boxes scale down on small screens to stay on one row.
 */

export interface CountdownDigitProps {
  /** Single character to display, e.g. "0", "5". */
  char: string;
}

export function CountdownDigit({ char }: CountdownDigitProps) {
  return (
    // mm:digit-box
    <div className="relative flex h-24 w-15 items-center justify-center sm:h-30.75 sm:w-19.25">
      {/* translucent gradient box (design opacity 0.5) */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl border-[0.75px] border-text-primary-1 opacity-50 backdrop-blur-[49.92px]"
        style={{
          background:
            "linear-gradient(180deg, var(--text-secondary-1) 0%, color-mix(in srgb, var(--text-secondary-1) 10%, transparent) 100%)",
        }}
      />
      {/* lit digit */}
      <span className="relative z-10 font-digital text-[58px] leading-none text-text-secondary-1 sm:text-[74px]">
        {char}
      </span>
    </div>
  );
}
