/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "space-navy":   "#080D1A",
        "hive-dark":    "#0D1525",
        "honey-gold":   "#F4B400",
        "cyber-yellow": "#FFD54F",
        "pollen-white": "#E8D9A0",
        "hex-border":   "rgba(244,180,0,0.20)",
      },
      fontFamily: {
        display: ["'Orbitron'", "sans-serif"],
        body:    ["'Syne'",     "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "gold-glow":  "0 0 24px rgba(244,180,0,0.45), 0 0 8px rgba(244,180,0,0.25)",
        "gold-soft":  "0 0 40px rgba(244,180,0,0.15)",
        "card-hover": "0 0 32px rgba(244,180,0,0.22), inset 0 0 20px rgba(244,180,0,0.06)",
      },
      keyframes: {
        float:     { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-18px)" } },
        pulseGlow: { "0%, 100%": { boxShadow: "0 0 16px rgba(244,180,0,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(244,180,0,0.7)" } },
      },
      animation: {
        float:     "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};