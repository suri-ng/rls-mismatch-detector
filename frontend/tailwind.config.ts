import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",       // Primary Canvas
        surface: "#FFFFFF",      // Surfaces / Cards
        ink: "#0F172A",          // Primary Text & Stroke (Deep Slate)
        muted: "#64748B",        // Muted Text & Stroke (Medium Slate)
        divider: "#F1F5F9",      // Whisper Divider
        border: "#E2E8F0",       // default input/secondary border
        "glacier-blue": "#0284C7",
        "frosty-teal": "#0D9488",
        "code-line": "#334155",  // muted slate for code
      },
      backgroundImage: {
        "glacier-gradient": "linear-gradient(90deg, #0284C7 0%, #0D9488 100%)",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],           // hero headers, titles
        sans: ['"Satoshi"', "ui-sans-serif", "system-ui"], // UI labels, buttons
        mono: ['"JetBrains Mono"', "monospace"],     // code / file names
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.04)",
      },
      backdropBlur: {
        frost: "12px",
      },
      spacing: {
        "18": "4.5rem", // 72px, for the 64/96px vertical rhythm rule
      },
    },
  },
  plugins: [],
};

export default config;