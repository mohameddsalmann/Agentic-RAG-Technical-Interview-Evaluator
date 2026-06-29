import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0d1117",
          card: "#161b22",
          elevated: "#1c2128",
          hover: "#21262d",
        },
        border: {
          DEFAULT: "#30363d",
          subtle: "#21262d",
        },
        accent: {
          DEFAULT: "#58a6ff",
          light: "#79b8ff",
        },
        success: "#3fb950",
        warning: "#d29922",
        danger: "#f85149",
        muted: "#8b949e",
        text: {
          primary: "#f0f6fc",
          secondary: "#8b949e",
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "slide-right": "slide-right 0.2s ease-out",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
