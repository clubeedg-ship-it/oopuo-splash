# OOPUO — Custom Theme: "Quiet Authority" (v3: Light Primary)

A light, high-contrast theme with dark accent sections.

## Color Palette

### Light Context (default)
| Token | Hex | Role |
|---|---|---|
| bg-primary | #F0F2F6 | Page background — cool gray |
| bg-elevated | #FFFFFF | Cards, nav, elevated surfaces |
| bg-surface | #E6E8EF | Input fields, subtle surfaces |
| bg-hover | #DCDFE8 | Hover states |

### Dark Context (hero, footer, CTA blocks)
| Token | Hex | Role |
|---|---|---|
| bg-dark | #070709 | Dark section background |
| bg-dark-elevated | #0E0F13 | Cards within dark sections |
| bg-dark-surface | #151720 | Inputs within dark sections |

### Text — Light Context
| Token | Hex | Role |
|---|---|---|
| text-primary | #1A1C24 | Primary body text |
| text-secondary | #5A5E72 | Secondary text, labels |
| text-muted | #8A8FA8 | Disabled, placeholder |

### Text — Dark Context
| Token | Hex | Role |
|---|---|---|
| text-on-dark | #EAEDF3 | Primary on dark |
| text-on-dark-secondary | #8A8FA8 | Secondary on dark |
| text-on-dark-muted | #505469 | Muted on dark |

### Accent — Deep Teal
| Token | Hex | Role |
|---|---|---|
| accent-primary | #1E7A6E | On light (darker for contrast) |
| accent-hover | #24917F | Hover state |
| accent-muted | #1A5C54 | Accent backgrounds |
| accent-glow | rgba(30,122,110,0.10) | Glow effects |
| accent-on-dark | #2D8A7E | On dark (brighter) |

### Warm Highlight (CTA only)
| Token | Hex | Role |
|---|---|---|
| highlight-warm | #C4814A | Urgent CTAs |
| highlight-warm-hover | #D4945E | Hover |

### Borders
| Token | Hex | Role |
|---|---|---|
| border-subtle | #D8DBE5 | Light context |
| border-visible | #C4C8D6 | Prominent |
| border-accent | rgba(30,122,110,0.25) | Hover/focus |
| border-dark | #1E2030 | Dark sections |

## Typography
| Role | Font | Weight |
|---|---|---|
| Display/H1 | Instrument Sans | 700 |
| Headings/H2-H4 | Instrument Sans | 600 |
| Body | Satoshi | 400, 500 |
| Monospace | JetBrains Mono | 400 |

## Section Context Map
| Section | Context | Background |
|---|---|---|
| Nav bar | Light | bg-elevated |
| Hero | **Dark** | bg-dark |
| Trust strip | Light | bg-primary |
| The Problem | Light | bg-elevated |
| Services | Light | bg-primary + bg-elevated cards |
| How It Works | Light | bg-elevated |
| Proof Points | Light | bg-primary |
| Enterprise teaser | **Dark** | bg-dark |
| Final CTA | **Dark** | bg-dark |
| Footer | **Dark** | bg-dark |

## Accent Rules
1. Teal on light: accent-primary (#1E7A6E)
2. Teal on dark: accent-on-dark (#2D8A7E)
3. Warm highlight max 1x/page, final CTA only
4. No gradients between accent and highlight
5. Use CSS variable switching via [data-theme="dark"]
