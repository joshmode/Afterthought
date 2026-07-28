import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        background: "#09090B",
        surface: "#111113",
        border: "#202026",
        accent: {
          amber: "#FFB03A", // Warm Amber
          gold: "#D4AF37",  // Muted Gold
          burgundy: "#800020" // Soft Burgundy
        },
      }
    },
  },
  plugins: [],
};
export default config;
