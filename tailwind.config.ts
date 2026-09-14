import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#0a0d12",
          panel: "#12161d",
          line: "#1e242f",
          ember: "#ff4d2e",
          volt: "#c8ff3d",
          steel: "#8ea0b8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(200,255,61,0.06) 0%, rgba(10,13,18,0) 60%)",
      },
      keyframes: {
        "flip-in": {
          "0%": { transform: "translateY(-40%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.9" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
      },
      animation: {
        "flip-in": "flip-in 0.35s cubic-bezier(.2,.9,.3,1)",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(.2,.6,.4,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
