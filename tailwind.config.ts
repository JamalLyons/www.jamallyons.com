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
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": {
            opacity: "0.4",
          },
          "50%": {
            opacity: "0.8",
          },
        },
        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
      },
      boxShadow: {
        neon: "var(--glow-effect)",
        "neon-lg": "0 0 20px rgba(168, 85, 247, 0.4)",
        "neon-blue": "0 0 15px rgba(0, 242, 255, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(var(--bg-dark) 1px, transparent 1px), linear-gradient(90deg, var(--bg-dark) 1px, transparent 1px)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.2), transparent)",
      },
      transitionProperty: {
        glow: "box-shadow, opacity, transform",
      },
    },
  },
  plugins: [],
} satisfies Config;
