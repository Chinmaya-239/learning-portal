/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14213D",
          light: "#1E2F52",
          dark: "#0D1626",
        },
        paper: {
          DEFAULT: "#FBF7EE",
          dim: "#F1EADA",
        },
        gold: {
          DEFAULT: "#E8A33D",
          light: "#F3C374",
          dark: "#C9832A",
        },
        slateink: "#2B2D42",
        line: "#C9C2B2",
        leaf: "#4C7A5D",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 8px 24px -12px rgba(20, 33, 61, 0.35)",
      },
    },
  },
  plugins: [],
};
