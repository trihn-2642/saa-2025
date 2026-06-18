import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Google account avatars (user_metadata.picture / avatar_url) are served
    // from this host; next/image must allow-list it to optimize remote images.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  turbopack: {
    rules: {
      // Import .svg as a React component (SVGR). Colors are NOT forced to
      // currentColor globally (that would flatten multicolor icons like the
      // Sun* mark). Single-color icons opt in by using fill="currentColor" in
      // their own .svg file; multicolor icons keep their exported colors.
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: { overrides: { removeViewBox: false } },
                  },
                ],
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default withNextIntl(nextConfig);
