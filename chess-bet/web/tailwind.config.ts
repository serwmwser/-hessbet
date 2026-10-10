import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      colors: {
        ink: { 950: "#07090f", 900: "#0c1018", 800: "#131925", 700: "#1b2332" },
        brand: { 400: "#34d399", 500: "#10b981", 600: "#059669", violet: "#8b5cf6" },
      },
      borderRadius: { xl2: "20px" },
      boxShadow: { soft: "0 10px 40px -12px rgba(0,0,0,.35)" },
    },
  },
  plugins: [],
};
export default config;
