import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      colors: {
        mist: "rgba(255,255,255,0.14)",
        mist2: "rgba(255,255,255,0.08)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(8px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.9", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        fall: {
          "0%": { transform: "translateY(-6px)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "translateY(14px)", opacity: "0" },
        },
      },
      animation: {
        drift: "drift 6s ease-in-out infinite",
        rise: "rise 0.5s ease-out both",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        fall: "fall 1.1s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
