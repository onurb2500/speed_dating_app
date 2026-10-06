import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sway palette — coral↔rose "flirt". No purple/violet/magenta.
        accent: {
          coral: "#f5714a", // gradient start
          mid: "#f05a7a", // gradient transition stop
          rose: "#f0577f", // primary — buttons, links, active states
          hot: "#ff486f", // highest energy — REC dot, like heart
        },
        // Light creation surfaces.
        canvas: "#fdfaf8",
        ink: "#1a0e12",
        ink2: "#2a1016",
        // Dark / video surfaces.
        videoInk: {
          a: "#170a0f", // recording / preview / filters base
          b: "#160a0f", // feed base
        },
        onDark: "#ffffff",
        onDarkSoft: "#fbeef0",
        onDarkBlush: "#ffd9e1",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        field: "17px",
        card: "24px",
        thumb: "18px",
        sticker: "14px",
        square: "9px",
      },
      boxShadow: {
        cta: "0 12px 32px rgba(245,113,74,0.40)",
        "card-glow": "0 0 30px rgba(240,87,127,0.18)",
        chip: "0 6px 18px rgba(245,113,74,0.45)",
        label: "0 1px 3px rgba(0,0,0,0.08)",
        "glow-segment": "0 0 10px rgba(240,87,127,0.5)",
      },
      backgroundImage: {
        "grad-cta": "linear-gradient(110deg, #f5714a, #f05a7a 48%, #f0577f)",
        "grad-pill": "linear-gradient(120deg, #f5714a, #f0577f)",
        "grad-progress": "linear-gradient(90deg, #f5714a, #f0577f)",
        "grad-chip": "linear-gradient(135deg, #f5714a, #f0577f)",
        "grad-avatar": "linear-gradient(150deg, #f5714a, #f0577f)",
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
        swayBlob: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(16px,-20px) scale(1.1)" },
        },
        swayBlob2: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-18px,14px) scale(1.12)" },
        },
        recPulse: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        ringOut: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "75%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        caretBlink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        bob: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "heart-pop": "heart-pop 0.3s ease-out",
        swayBlob: "swayBlob 9s ease-in-out infinite",
        swayBlob2: "swayBlob2 11s ease-in-out infinite",
        recPulse: "recPulse 1.1s ease-in-out infinite",
        ringOut: "ringOut 1.8s ease-out infinite",
        caretBlink: "caretBlink 1s step-end infinite",
        "bob-slow": "bob 4s ease-in-out infinite",
        "bob-fast": "bob 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
