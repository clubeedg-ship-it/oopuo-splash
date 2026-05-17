# OOPUO v2 — Moodboard: "The Lobby"

> A corporate landing page that feels like stepping into a game lobby.
> Japanese minimalism meets sci-fi interface design.
> Quiet authority, spatial depth, ambient intelligence.

---

## Design DNA

### The Feeling
When you boot Destiny and land in orbit — cursor drifting over a slowly rotating planet, panels sliding in from the edges, ambient music humming — you feel *present* in a space. Not reading a page. *Being* somewhere.

That's what oopuo.com should feel like. You arrive. You're in the lobby. Sections aren't pages — they're *rooms* you navigate through. The site breathes.

### Three Pillars

1. **Ma (間) — Intentional Void**
   Japanese concept of negative space as a *presence*, not an absence. Every gap is deliberate. Content breathes. The empty space between elements IS the design.

2. **Shibui (渋い) — Understated Depth**
   Beauty that reveals itself slowly. No flash. No gradients screaming for attention. Subtle textures, precise type, quiet motion that rewards attention.

3. **Lobby Presence — Spatial UI**
   The interface exists in a *space*, not on a *page*. Elements have depth (z-axis). Panels arrive and depart. A persistent HUD anchors you. Background layers create parallax depth.

---

## Visual References

### Game UI Inspiration

| Reference | What to Take |
|---|---|
| **Destiny orbit screen** | Cursor-based feel, ambient background, panels that slide from edges, information hierarchy through scale |
| **Armored Core VI garage** | Dark matte surfaces, mechanical precision, sparse HUD elements, monospace data readouts |
| **Halo Infinite lobby** | Clean geometric layout, translucent panels, status indicators, quiet confidence |
| **NieR: Automata menus** | Minimalist white-on-dark, deliberate spacing, elegant transitions, the way menus feel *physical* |
| **Death Stranding UI** | Translucent overlays, topographic textures, information density done beautifully |

### Japanese Design Inspiration

| Reference | What to Take |
|---|---|
| **Muji brand identity** | Radical simplicity, natural materials feel, "just enough" design |
| **Naoto Fukasawa products** | Objects that feel inevitable — nothing to add, nothing to remove |
| **Kengo Kuma architecture** | Light filtering through layers, natural materials, spatial depth |
| **Issey Miyake pleats** | Geometric precision with organic flow, texture as identity |
| **Sou Fujimoto "House N"** | Nested transparent layers creating depth without walls |

### Web / Digital References

| Reference | What to Take |
|---|---|
| **stripe.com (2024+)** | Ambient gradient backgrounds, floating card elements, depth |
| **linear.app** | Dark UI done right, sharp typography, purposeful motion |
| **vercel.com** | Monospace accents, grid precision, dark theme authority |
| **resend.com** | Minimal dark UI, focused messaging, developer-aesthetic |
| **raycast.com** | Command-palette-as-navigation, keyboard-first, spatial |

---

## Color System v2: "Ink & Stone"

Moving from the current "quiet authority" to something with more depth and atmosphere.

### Dark Field (primary canvas — the lobby IS dark)
```
--lobby-void:       #050507     /* deepest black — the void */
--lobby-surface:    #0A0B0F     /* raised panels */
--lobby-panel:      #111318     /* active panels, cards */
--lobby-glass:      rgba(17, 19, 24, 0.7)  /* translucent overlays */
```

### Stone (text, secondary surfaces)
```
--stone-100:        #E8E6E1     /* primary text — warm white, not blue-white */
--stone-200:        #C4C1B8     /* secondary text */
--stone-300:        #8A877E     /* muted text, labels */
--stone-400:        #5C5950     /* disabled, subtle borders */
--stone-500:        #2E2D28     /* panel borders, separators */
```

### Accent: Deep Teal (carry forward, refined)
```
--accent:           #1E7A6E     /* primary accent — unchanged */
--accent-glow:      rgba(30, 122, 110, 0.08)  /* subtle ambient glow */
--accent-line:      rgba(30, 122, 110, 0.25)  /* scan lines, grid marks */
```

### Signal: Warm (CTA, once per view)
```
--signal-warm:      #C4814A     /* unchanged — max 1x per viewport */
```

### Special: Scan Line / Grid
```
--grid-line:        rgba(30, 122, 110, 0.04)  /* background grid */
--scan-pulse:       rgba(30, 122, 110, 0.06)  /* ambient pulse effect */
```

---

## Typography v2

### Hierarchy
Same font stack — Instrument Sans / Satoshi / JetBrains Mono — but deployed differently:

- **Hero statement**: Instrument Sans Bold, 5rem+, tight tracking (-0.04em), max 12 words
- **Section headers**: Instrument Sans Semibold, 2rem, no sentence case — Title Case or ALL CAPS
- **Body**: Satoshi 400, 1.125rem, generous line height (1.7)
- **HUD labels**: JetBrains Mono 500, 0.75rem, UPPERCASE, tracking 0.12em, accent color
- **Data readouts**: JetBrains Mono 700, 3rem+, tabular numbers

### New Pattern: "HUD Label"
Small mono labels that feel like game UI status indicators:
```
SECTION 01 / 07          ◇ SERVICES          STATUS: ACTIVE
```
These replace the current SectionLabel component with something more spatial.

---

## Layout Paradigm: "Rooms, Not Pages"

### The Lobby Structure

```
┌──────────────────────────────────────────────────────────────┐
│  PERSISTENT HUD NAV (translucent, top)                       │
│  ┌─logo──────────────────── 01/07 ─── dots ─── [CONTACT]─┐  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────── VIEWPORT (one "room" at a time) ──────┐  │
│  │                                                        │  │
│  │                     CONTENT PANEL                      │  │
│  │               (slides in from bottom/right)            │  │
│  │                                                        │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ AMBIENT LAYER (behind content) ──────────────────────┐  │
│  │  subtle grid / particle field / topographic texture     │  │
│  │  parallax responds to scroll position                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ SIDE RAIL (right edge) ──────────────────────────────┐  │
│  │  ◇ progress dots                                       │  │
│  │  current section label (vertical)                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Navigation Model
- **Scroll/swipe**: moves between rooms (full-viewport snap)
- **Side dots**: click to jump to any room
- **Keyboard**: arrows, page up/down, home/end
- **Cursor**: free-moving (not snapped to elements) — Destiny-style feel
- **HUD nav**: shows current position (01/07), section name

---

## Ambient Background Layer

The background is NOT static. It's a living, breathing canvas.

### Option A: Topographic Grid (recommended)
A subtle SVG/canvas grid pattern — think topographic map contour lines — that slowly shifts and pulses with accent-colored lines. Barely visible. On scroll between sections, the grid morphs slightly.

### Option B: Particle Field
Sparse floating dots/nodes connected by thin lines (constellation-style). Moves with subtle parallax. Similar to what linear.app does but more restrained.

### Option C: Gradient Fog
Soft, dark radial gradients that drift slowly — like looking at a nebula through frosted glass. Stripe-inspired but darker, more atmospheric.

**Recommendation**: Start with Option A (topographic grid). It's the most "Japanese" — references both traditional map-making and modern circuit board aesthetics. Can be done with pure CSS/SVG, no canvas needed for v1.

---

## Interaction Patterns

### Room Transitions
```
Current room:  opacity 1 → 0, translateY(0 → -30px)     [300ms ease-out]
Next room:     opacity 0 → 1, translateY(30px → 0)       [400ms ease-out-expo]
               content elements stagger in                 [50ms delay each]
```

### Panel Entrance (content blocks within a room)
```
Initial:   opacity: 0, transform: translateX(-20px)
Final:     opacity: 1, transform: translateX(0)
Timing:    400ms ease-out-expo, stagger 80ms per element
```

### HUD Elements
```
Section label:   crossfade text                           [200ms]
Progress dots:   scale active dot 1 → 1.4, color shift   [300ms]
Counter:         number rolls up/down (slot machine)      [250ms]
```

### Hover States
Cards don't just change color — they *lift*:
```
Default:   translateZ(0), shadow: none
Hover:     translateZ(8px), border-glow: accent-glow
           background shifts from panel → panel-hover
           subtle scale: 1.005
```

### Reduced Motion
All of the above collapses to instant state changes. No motion. Content appears immediately. Grid is static.

---

## Sound Design (stretch goal)
If the user opts in (muted by default):
- Ambient drone on load (low, warm)
- Soft tick on section change
- Click feedback on CTA hover
- Using Web Audio API, <2KB total

---

## What This Is NOT

- Not a gaming website. No pixel art, no 8-bit fonts, no neon.
- Not cyberpunk. No glitch effects, no matrix rain, no "hacker" aesthetic.
- Not maximalist. The game reference is the *spatial UI pattern*, not the visual loudness.
- Not dark mode for dark mode's sake. Dark because the lobby IS dark — like a theater before the show.

The vibe is: **if Muji designed a command center**.

---

## Reference Links
- [Game UI Database — Pre-Game & Lobby](https://www.gameuidatabase.com/index.php?scrn=43)
- [Destiny UI — HUDS+GUIS](https://www.hudsandguis.com/home/2015/5/25/destiny-ui)
- [Halo UX/UI — David Candland](http://www.cand.land/new-page)
- [Wabi-Sabi in Web Design — Silphium Design](https://silphiumdesign.com/wabi-sabi-web-design-understanding-imp-prin/)
- [Wabi-Sabi Aesthetic — WebFX](https://www.webfx.com/blog/web-design/wabi-sabi/)
- [Minimalist Web Design Trends 2026 — Digital Silk](https://www.digitalsilk.com/digital-trends/minimalist-web-design-trends/)
