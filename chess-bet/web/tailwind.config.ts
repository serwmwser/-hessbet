import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      colors: {
        ink: { 950: "#060a1c", 900: "#0a1030", 800: "#0f1740", 700: "#18225a" },
        brand: { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", violet: "#5b3df5" },
        emerald: { 400: "#c4b5fd", 500: "#a78bfa", 600: "#7c3aed", 900: "#2e1065" },
      },
      borderRadius: { xl2: "20px" },
      boxShadow: { soft: "0 10px 40px -12px rgba(5,8,30,.6)", glow: "0 0 40px -8px rgba(139,92,246,.45)" },
    },
  },
  plugins: [],
};
export default config;
