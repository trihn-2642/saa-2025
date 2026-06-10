/**
 * Prettier config. Defaults (2-space, double quotes, semicolons, trailing
 * commas, 80 print width) already match the codebase, so only the Tailwind
 * class-sorting plugin is configured.
 *
 * @type {import('prettier').Config}
 */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4 is CSS-first — point the plugin at the stylesheet that holds
  // the @theme tokens so it can sort custom utilities correctly.
  tailwindStylesheet: "./src/app/globals.css",
  // Also sort classes passed to these helpers.
  tailwindFunctions: ["cn", "clsx", "cva"],
};

export default config;
