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
        sans: ["var(--font-geist-sans)"],
        nunito: ["var(--font-nunito)"], // Our custom font for the logo
      },
      colors: {
        // Brand color scale. DEFAULT uses the design token so editing the
        // CSS variable propagates everywhere, while fixed shades offer
        // semantic range for hovers, borders, subtle backgrounds, etc.
        brand: {
          DEFAULT: 'var(--brand-color)',
          50: '#f5f5ff',
          100: '#ebebff',
            // Light tints for subtle backgrounds / focus rings
          200: '#cccaff',
          300: '#aba8ff',
          400: '#7a72ff',
          500: '#160ffc', // Core brand
          600: '#140dda',
          700: '#100aac',
          800: '#0c077f',
          900: '#070448',
          950: '#040226',
        },
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