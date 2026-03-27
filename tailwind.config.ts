import type { Config } from "tailwindcss"

const config = {
  darkMode: "class", // Make sure this is a string, not an array
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        nunito: ["var(--font-nunito)"], // Our custom font for the logo
      },
      colors: {
        brand: {
          DEFAULT: '#2563EB', // Updated to inspiration primary blue
          50: '#F8F9FC', // Light background tone
          100: '#ebebff',
          200: '#cccaff',
          300: '#aba8ff',
          400: '#7a72ff',
          500: '#2563EB', 
          600: '#1D4ED8',
          700: '#100aac',
          800: '#0F172A', // Dark text
          900: '#070448',
          950: '#040226',
        },
        muted: '#64748B',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(0,0,0,0.06)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // This line should be here
} satisfies Config

export default config