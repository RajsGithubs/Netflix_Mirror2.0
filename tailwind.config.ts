import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#141414",
        foreground: "#FFFFFF",
        surface: {
          DEFAULT: "#181818",
          elevated: "#242424",
          card: "#2F2F2F",
        },
        brand: {
          DEFAULT: "#E50914",
          50: "#FFF1F3",
          100: "#FFE4E8",
          400: "#F40612",
          500: "#E50914", // Signature Netflix red
          600: "#B81D24",
          700: "#99141B",
          glow: "rgba(229, 9, 20, 0.45)",
        },
        netflix: {
          black: "#141414",
          dark: "#181818",
          elevated: "#242424",
          red: "#E50914",
          redHover: "#F40612",
          gray: "#808080",
          lightGray: "#E5E5E5",
        },
      },
      fontFamily: {
        sans: [
          "Netflix Sans",
          "Helvetica Neue",
          "Segoe UI",
          "Roboto",
          "Ubuntu",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "scale-up": "scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
