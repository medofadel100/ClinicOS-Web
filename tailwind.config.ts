import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(0,212,170,0.3), 0 0 60px rgba(0,212,170,0.1)",
        "glow-primary-sm": "0 0 8px rgba(0,212,170,0.4), 0 0 20px rgba(0,212,170,0.15)",
        "glow-purple": "0 0 20px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1)",
        "card": "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-in-up": "slide-in-up 0.35s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "gradient-shift": "gradient-shift 4s ease infinite",
        "orb-1": "orb-drift-1 18s ease-in-out infinite",
        "orb-2": "orb-drift-2 22s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(1deg)" },
          "66%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 15px 2px rgba(0,212,170,0.2)" },
          "50%": { boxShadow: "0 0 30px 6px rgba(0,212,170,0.4)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "orb-drift-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(60px, -40px) scale(1.1)" },
          "50%": { transform: "translate(30px, 60px) scale(0.9)" },
          "75%": { transform: "translate(-40px, 20px) scale(1.05)" },
        },
        "orb-drift-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(-50px, 30px) scale(1.08)" },
          "50%": { transform: "translate(-20px, -50px) scale(0.92)" },
          "75%": { transform: "translate(50px, -20px) scale(1.04)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "400": "400ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
