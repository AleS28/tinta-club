import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FBF8F3",
        terracotta: "#D97757",
        ink: "#1F1F1F",
        muted: "#6B7280",
        sidebar: "#F4EFE6",
        imperial: {
          dark: "#2C1810",
          deep: "#8B3A2B",
        },
        gold: {
          DEFAULT: "#C9A961",
          light: "#E8D5A3",
          cream: "#F5E6C8",
        },
        home: {
          dark: "#2A1D17",
          cream: "#FDFBF7",
          parchment: "#F5EDD8",
          border: "#8B6914",
          gold: "#D4A359",
          terracotta: "#C06240",
        },
      },
      boxShadow: {
        editorial: "0 4px 24px -4px rgba(44, 24, 16, 0.12), 0 2px 8px -2px rgba(44, 24, 16, 0.06)",
        "editorial-lg": "0 12px 40px -8px rgba(44, 24, 16, 0.18), 0 4px 16px -4px rgba(44, 24, 16, 0.08)",
        inset: "inset 0 2px 8px rgba(44, 24, 16, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-merriweather)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "var(--font-merriweather)", "Georgia", "serif"],
      },
      backgroundImage: {
        "parchment-texture":
          "linear-gradient(135deg, rgba(245,237,216,0.95) 0%, rgba(253,251,247,0.98) 50%, rgba(235,220,190,0.92) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
