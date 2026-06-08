import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050816",
        surface: "#0B1020",
        elevated: "#11162A",
        line: "#1E2542",
        cyan: { DEFAULT: "#22D3EE", soft: "#67E8F9" },
        violet: { DEFAULT: "#8B5CF6", soft: "#A78BFA" },
        ink: "#F8FAFC",
        muted: "#94A3B8",
        danger: "#FB7185",
        success: "#34D399",
        warning: "#FBBF24",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 8px 40px -8px rgba(139,92,246,0.35)",
        panel: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(34,211,238,0.10), transparent 60%), radial-gradient(ellipse at bottom, rgba(139,92,246,0.10), transparent 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
