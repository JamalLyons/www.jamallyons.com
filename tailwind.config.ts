import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "terminal-purple": "var(--terminal-purple)",
        "terminal-purple-dark": "var(--terminal-purple-dark)",
        "terminal-purple-light": "var(--terminal-purple-light)",
        "electric-blue": "var(--electric-blue)",
        "deep-gray": "var(--deep-gray)",
        "bg-dark": "var(--bg-dark)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 8s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        rotation: "rotation 2s linear infinite",
      },
      boxShadow: {
        neon: "var(--glow-effect)",
      },
    },
  },
  plugins: [],
} satisfies Config;
