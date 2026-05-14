# OOPUO — Claude Code Handoff (v3: Light Primary)

## What Changed (v2 → v3)

- **Theme flipped to light primary.** Cool gray (#F0F2F6) base, white cards, dark text.
- **Dark sections used for contrast:** hero, enterprise teaser, final CTA, footer.
- **Dual-context design system:** components work in both light and dark via data-theme="dark".
- **CSS tokens use custom property overrides** — one set of component code, two visual contexts.
- **Card styling on light:** subtle shadows (shadow-card) instead of glow borders.
- **Accent teal adjusted:** slightly darker (#1E7A6E) on light for WCAG contrast, brighter (#2D8A7E) on dark.
- **Nav is white** with black logo, dark text.

---

## Critical: The Dual-Context Pattern

The site has a **light default** with **dark accent sections** via `[data-theme="dark"]`.

```tsx
<section className="bg-bg-primary">           {/* Light */}
<section data-theme="dark" className="bg-bg-dark"> {/* Dark */}
```

**Dark sections on homepage:** Hero, Enterprise Teaser, Final CTA, Footer.

---

## Pages to Build

| Route | Source Copy | Source Wireframe |
|---|---|---|
| `/` | `03-copy/home.md` | `04-wireframes/home-wireframe.md` |
| `/enterprise` | `03-copy/enterprise.md` | `04-wireframes/enterprise-wireframe.md` |
| `/about` | `03-copy/about.md` | `04-wireframes/about-wireframe.md` |
| `/blog` | — | `05-component-specs/components.md` |
| `/blog/[slug]` | `07-blog/posts/*.md` | `05-component-specs/components.md` |
| `/contact` | `03-copy/contact.md` | `04-wireframes/contact-wireframe.md` |

## i18n: v1 English only. Architecture for: en, pt-br, en-us, nl, fr, rs, zh.

## Contact: HubSpot form (TBD) + Calendly embed (TBD) + WhatsApp wizard (client-side).

## Logo: `oopuo-logo-original.svg` (black, light bg) / `oopuo-logo-light.svg` (white, dark bg).

## Key Rules

1. No Inter/Roboto/Arial — Instrument Sans + Satoshi + JetBrains Mono
2. Light primary, dark accents — not a dark-mode site
3. Card shadows on light, glow borders on dark
4. Warm highlight max 1×/page — final CTA only
5. Respect prefers-reduced-motion
6. Max text width 720px for body content
7. Mobile-first
8. All strings in locale files, not hardcoded
9. Logo switches based on section context

## Fonts

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
```

## NOT in v1: Auth, CMS, payments, dark mode toggle, language switcher UI, backend API.
