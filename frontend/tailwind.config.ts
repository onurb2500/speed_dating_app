import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // TikTok-like dark palette.
        brand: {
          pink: "#fe2c55",
          cyan: "#25f4ee",
        },
        background: "#000000",
        surface: "#121212",
        muted: "#8a8b91",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "heart-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "heart-pop": "heart-pop 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
