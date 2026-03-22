import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#03045E",
          50: "#e6e6f5",
          100: "#c0c0e6",
          200: "#9797d6",
          300: "#6b6bc5",
          400: "#4747b8",
          500: "#03045E",
          600: "#020352",
          700: "#020246",
          800: "#01013a",
          900: "#01012e",
        },
        text: {
          DEFAULT: "#22223B",
          secondary: "#6C6C6C",
        },
        background: {
          DEFAULT: "#F8F9FA",
          neutral: "#EDEDE9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: theme("colors.text.DEFAULT"),
            a: { color: theme("colors.primary.DEFAULT") },
            h1: { color: theme("colors.primary.DEFAULT") },
            h2: { color: theme("colors.primary.DEFAULT") },
            h3: { color: theme("colors.primary.DEFAULT") },
          },
        },
      }),
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};

export default config;
