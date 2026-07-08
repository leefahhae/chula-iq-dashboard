import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans Thai", "system-ui", "sans-serif"],
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
          50: "#fff1f5",
          100: "#ffe4ec",
          200: "#ffc8da",
          300: "#ff9fbe",
          400: "#ff6d9c",
          500: "#f9457f",
          600: "#e42768",
          700: "#c11955",
          800: "#a1174b",
          900: "#881744",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          // Pantone 9044 (mint) — DEFAULT for fills/badges/buttons; "text" is a
          // darker shade of the same hue for use as plain readable text/icons
          // (the pastel DEFAULT is too pale to read as text on a white bg).
          DEFAULT: "#A9D9C0",
          foreground: "#15171a",
          text: "#1f7a4d",
        },
        warning: {
          // Pantone 9241 (peach)
          DEFAULT: "#F3C6A4",
          foreground: "#15171a",
          text: "#b5651d",
        },
        orchid: {
          // Pantone 14-3612 "Orchid Bloom"
          DEFAULT: "#C7AEDD",
          foreground: "#15171a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 6px)",
        "2xl": "calc(var(--radius) + 12px)",
      },
      boxShadow: {
        soft: "0 2px 12px 0 rgb(249 69 127 / 0.08)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        // Neo-brutalist hard offset shadows — no blur, solid black, so
        // cards/buttons read as physical blocks stacked on the page.
        brutal: "4px 4px 0 0 hsl(var(--foreground))",
        "brutal-sm": "2px 2px 0 0 hsl(var(--foreground))",
        "brutal-lg": "6px 6px 0 0 hsl(var(--foreground))",
        "brutal-pressed": "1px 1px 0 0 hsl(var(--foreground))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
