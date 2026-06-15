/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0EA5E9",
          hover: "#0284C7",
          light: "#E0F2FE",
        },
        secondary: {
          DEFAULT: "#22C55E",
          hover: "#16A34A",
          light: "#DCFCE7",
        },
        accent: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
          light: "#FEF3C7",
        },
        bgLight: "#F8FAFC",
        bgDark: "#0F172A",
        cardLight: "#FFFFFF",
        cardDark: "#1E293B",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        premium: "0 4px 30px rgba(0, 0, 0, 0.03)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      backdropFilter: {
        glass: "blur(8px)",
      }
    },
  },
  plugins: [],
}
