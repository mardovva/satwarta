import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#345542", dark: "#2A4535" },
        secondary: "#6B8F71",
        accent: "#D87938",
        cream: "#F5F8F4",
        ink: "#171717",
        mist: "#F5F5F5",
      },
      fontFamily: { sans: ["Satoshi", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: { soft: "0 12px 36px rgba(20,40,30,0.12)", nav: "0 4px 18px rgba(20,40,30,0.08)" },
      keyframes: {
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        marquee: { "0%": { transform: "translate3d(0,0,0)" }, "100%": { transform: "translate3d(-50%,0,0)" } },
        sway: { "0%, 100%": { transform: "rotate(-1.2deg)" }, "50%": { transform: "rotate(1.5deg)" } },
        "pop-in": { "0%": { opacity: "0", transform: "translateY(0.75rem) scale(0.92)" }, "100%": { opacity: "1", transform: "translateY(0) scale(1)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "tab-in": { "0%": { opacity: "0", transform: "translateY(0.5rem)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { blink: "blink 0.9s step-end infinite", marquee: "marquee 60s linear infinite", sway: "sway 7s ease-in-out infinite", "pop-in": "pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both", "fade-in": "fade-in 0.25s ease-out both", "tab-in": "tab-in 0.35s ease-out both" },
    },
  },
  plugins: [],
};
export default config;

