# OOPUO — Component Inventory (v3: Light + Dark)

Components use CSS custom properties that auto-switch via data-theme="dark".

## 1. NavBar
64px, fixed z-50, bg-elevated white. Logo black 28px + wordmark.
Links: text-secondary, hover text-primary. CTA: accent-primary bg white text.
Mobile: hamburger → slide-in panel.

## 2. Button
Light: Primary (accent-primary/white) | Warm (highlight-warm/white, 1/page max) | Ghost (transparent/accent-primary/border-accent)
Dark: Primary (accent-on-dark/white) | Ghost (transparent/accent-on-dark/border-accent)
Shared: font-body 500 16px, 12px 24px padding, radius-sm, 150ms transitions. Focus: 2px accent outline.

## 3. Service Card
Light: bg-elevated, border-subtle, shadow-card. Hover: shadow-card-hover + border-accent + translateY(-2px).
Dark: bg-dark-elevated, border-dark. Hover: border-accent + accent-glow.
Icon 32px accent-primary. Title: font-display 600 H3. Desc: font-body 400 text-secondary.

## 4. Section Label
font-mono 400 caption, text-muted, uppercase, letter-spacing 0.08em.

## 5. Stat Block
Number: font-mono 700 48-56px accent-primary. Label: font-body 400 caption text-secondary.
Counter animation 800ms on scroll.

## 6. Footer (always dark)
bg-dark, border-dark top. Logo: off-white SVG. Links: accent-on-dark.
Two columns desktop, stack mobile.

## 7. Contact Tabs
bg-elevated, border-subtle, radius-lg. Active: text-primary + accent-primary underline. Content fade 200ms.

## 8. Blog Post Card
bg-elevated, border-subtle, shadow-card, radius-md. Cover 16/9.
Category: font-mono caption accent-primary uppercase. Title: font-display 600 H3.
Hover: shadow-card-hover + border-accent. Grid: 3/2/1 col.

## 9. Blog Post Layout
Max 720px centered. Title: font-display 700 48px. Meta: font-mono caption text-muted.
Body: font-body 400 body-lg line-height 1.7. H2: font-display 600.
Inline code: font-mono bg-surface radius-sm. Links: accent-primary.
