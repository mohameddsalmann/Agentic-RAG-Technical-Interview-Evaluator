import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          card: "#12121a",
          hover: "#1a1a25",
        },
        accent: {
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
          glow: "#8b5cf6",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(124, 58, 237, 0.6)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
