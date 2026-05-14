# OOPUO — Tailwind Config Tokens (v3: Light Primary)

Drop into tailwind.config.ts under theme.extend.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: { primary: "#F0F2F6", elevated: "#FFFFFF", surface: "#E6E8EF", hover: "#DCDFE8" },
        "bg-dark": { DEFAULT: "#070709", elevated: "#0E0F13", surface: "#151720", hover: "#1C1E2A" },
        text: { primary: "#1A1C24", secondary: "#5A5E72", muted: "#8A8FA8" },
        "text-on-dark": { DEFAULT: "#EAEDF3", secondary: "#8A8FA8", muted: "#505469" },
        accent: { DEFAULT: "#1E7A6E", hover: "#24917F", muted: "#1A5C54", glow: "rgba(30,122,110,0.10)", "on-dark": "#2D8A7E", "on-dark-hover": "#36A094" },
        highlight: { warm: "#C4814A", "warm-hover": "#D4945E" },
        border: { subtle: "#D8DBE5", visible: "#C4C8D6", accent: "rgba(30,122,110,0.25)", dark: "#1E2030", "dark-visible": "#2A2D42" },
      },
      fontFamily: {
        display: ['"Instrument Sans"', "system-ui", "sans-serif"],
        body: ['"Satoshi"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        hero: ["4rem", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        h2: ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h3: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        caption: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
      },
      spacing: { section: "8rem" },
      maxWidth: { site: "1200px" },
      borderRadius: { sm: "6px", md: "10px", lg: "16px" },
      transitionTimingFunction: { "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)", "in-out-smooth": "cubic-bezier(0.65, 0, 0.35, 1)" },
      boxShadow: {
        "accent-glow": "0 0 20px rgba(30,122,110,0.10)",
        "accent-glow-lg": "0 0 40px rgba(30,122,110,0.15)",
        card: "0 1px 3px rgba(26,28,36,0.06), 0 1px 2px rgba(26,28,36,0.04)",
        "card-hover": "0 4px 12px rgba(26,28,36,0.08), 0 2px 4px rgba(26,28,36,0.04)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
```

## Dark Section Pattern
Use data-theme="dark" on section wrappers. CSS custom properties override automatically.

## Card Shadows (light context)
Default: shadow-card | Hover: shadow-card-hover + border-accent

## Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
```
