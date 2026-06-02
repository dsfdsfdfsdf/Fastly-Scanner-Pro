/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0c10",
        surface: {
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.1)",
          dark: "rgba(0, 0, 0, 0.3)",
        },
        brand: {
          primary: "#ff0062",
          secondary: "#6366f1",
          accent: "#f43f5e",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

module.exports = config;
