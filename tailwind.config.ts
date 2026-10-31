import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#345542", dark: "#2A4535" },
        secondary: "#6B8F71",
        accent: "#D87938",
        cream: "#FAF8F2",
        ink: "#171717",
        mist: "#F5F5F5",
      },
      fontFamily: { sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,0.18)", nav: "0 4px 14px rgba(0,0,0,0.08)" },
      keyframes: { blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } } },
      animation: { blink: "blink 0.9s step-end infinite" },
    },
  },
  plugins: [],
};
export default config;
