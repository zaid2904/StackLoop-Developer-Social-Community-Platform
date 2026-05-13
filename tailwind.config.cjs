/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "sans-serif"],
        display: ["Syne", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#ef4444",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#450a0a",
        },
        surface: {
          light: "#111111",
          dim: "#070707",
          dark: "#000000",
        },
      },
      boxShadow: {
        soft: "0 24px 50px -35px rgba(0, 0, 0, 1)",
        glow: "0 0 40px rgba(239, 68, 68, 0.22)",
        panel: "0 30px 80px -45px rgba(0, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
