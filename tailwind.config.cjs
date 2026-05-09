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
          50: "#ecfff8",
          100: "#cbffe9",
          200: "#9affd6",
          300: "#63f3bc",
          400: "#2ce6a2",
          500: "#00d18d",
          600: "#00a970",
          700: "#00855a",
          800: "#006747",
          900: "#004d35",
        },
        surface: {
          light: "#111111",
          dim: "#070707",
          dark: "#000000",
        },
      },
      boxShadow: {
        soft: "0 24px 50px -35px rgba(0, 0, 0, 1)",
        glow: "0 0 40px rgba(0, 209, 141, 0.22)",
        panel: "0 30px 80px -45px rgba(0, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};
