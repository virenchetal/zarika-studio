import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF8F3",
        cream2: "#F3EDE3",
        gold: { DEFAULT: "#B8973C", light: "#D4AF62", pale: "#F5EDD8" },
        maroon: { DEFAULT: "#6B1A2A", light: "#8B2238", pale: "#F9F0F2" },
        charcoal: "#1A1614",
        dark: "#2C2420",
        mid: "#6B635C",
        light: "#A09890",
        border: { DEFAULT: "#E4DAD0", light: "#EDE6DC" },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
