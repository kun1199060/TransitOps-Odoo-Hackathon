/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        console: {
          bg: "#0A0D12",
          panel: "#12161F",
          border: "#1F2530",
          muted: "#5B6472",
        },
        signal: {
          amber: "#FF9B3D",
          amberDim: "#B8672A",
        },
        status: {
          available: "#3ECF8E",
          onTrip: "#4C9EFF",
          shop: "#FF9B3D",
          retired: "#FF5C5C",
          suspended: "#FF5C5C",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
