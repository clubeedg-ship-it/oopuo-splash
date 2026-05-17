# OOPUO v2 — Wireframes: "The Lobby"

> ⚠️ **STALE — kept for archive.** Original wireframes for the 6-room concept. The implementation has since added Modules sub-pages (col1 rail), URL hash routing, editorial blog ambience, asymmetric room slide, and per-room palette switching. See [STATE.md](./STATE.md) for current layout + behaviour.

> Each section is a "room". The viewport IS the frame.
> All content lives within one viewport height.
> Transitions slide vertically with staggered panel entrances.

---

## Persistent HUD (all rooms)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ◇ OOPUO                                        01 / 07    [● ● ●]│
│                                                  ─────              │
│                                           ENTERPRISE  ABOUT  BLOG  │
│                                                         [CONTACT ↗]│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Left:   Logo mark + wordmark (small, mono-weight)
Center: (empty — ma)
Right:  Section counter "01 / 07" in mono
        Nav links (text only, no bg)
        Contact CTA (bordered pill, accent)
```

The HUD is translucent (`lobby-glass`), floating 24px from edges. It subtly adapts opacity based on content underneath — more opaque when content is near the top.

---

## Room 01: ARRIVAL (Hero)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD: ◇ OOPUO ──────────────────────── 01/07  nav  [CONTACT]]    │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                                     │
│                                                                     │
│                                                                     │
│   ┌────────────────────────────────────────┐                        │
│   │                                        │                        │
│   │  SECTION 01 ─── ARRIVAL                │              ◇        │
│   │                                        │              │        │
│   │  We build your                         │              │        │
│   │  AI systems.                           │              ◇        │
│   │                                        │              │        │
│   │  ─── (thin accent line, 60px) ───      │              │        │
│   │                                        │              ◇        │
│   │  Engineering-first consultancy for     │              │        │
│   │  European businesses.                  │              │        │
│   │                                        │              ◇        │
│   │  [See what we build →]  Book a call →  │                       │
│   │                                        │              ◇        │
│   └────────────────────────────────────────┘                        │
│                                                             ◇      │
│                                                                     │
│        ╌╌╌╌╌╌╌╌╌ ambient grid layer (behind) ╌╌╌╌╌╌╌╌╌╌╌╌        │
│                                                                     │
│                                              SCROLL ↓              │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- Content panel: left-aligned, max 600px
- Hero text: 5rem, 2 lines max, tight leading
- Accent separator line below title
- Subtitle: 1.125rem, stone-200 color
- CTAs: primary button + text link
- Right edge: progress dots (vertical rail)
- Bottom center: subtle "scroll" indicator with animated chevron
- Background: topographic grid, very subtle
```

### Content Entrance Animation
```
1. Grid fades in                          [0ms,  600ms fade]
2. HUD label "SECTION 01 — ARRIVAL"      [200ms, slide-right 300ms]
3. Hero text line 1                       [400ms, fade-up 400ms]
4. Hero text line 2                       [500ms, fade-up 400ms]
5. Accent line grows from left            [700ms, width 0→60px 300ms]
6. Subtitle                              [800ms, fade 300ms]
7. CTA buttons                           [900ms, fade-up 300ms]
8. Scroll indicator pulses               [1200ms, perpetual]
```

---

## Room 02: THE PROBLEM

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD: ◇ OOPUO ──────────────────────── 02/07  nav  [CONTACT]]    │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                                     │
│                                                                     │
│   SECTION 02 ─── THE GAP                                           │
│                                                                     │
│                                                                     │
│   ┌──────────────────────────────┐    ┌──────────────────────────┐  │
│   │                              │    │                          │  │
│   │  "You're growing.            │    │   ◈  20+ hrs/week       │  │
│   │   Your tools aren't          │    │      saved               │  │
│   │   keeping up."               │    │                          │  │
│   │                              │    │   ◈  < 2 weeks           │  │
│   │  ── (accent line) ──         │    │      to deploy           │  │
│   │                              │    │                          │  │
│   │  You're answering the same   │    │   ◈  €0                  │  │
│   │  customer questions for the  │    │      WordPress fees      │  │
│   │  third time today...         │    │                          │  │
│   │                              │    └──────────────────────────┘  │
│   └──────────────────────────────┘                                  │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- Split layout: 60% text / 40% data panel
- Left: problem narrative (max 480px)
- Right: stat readouts in a bordered panel (lobby-panel bg)
  Stats use JetBrains Mono, large numbers, accent color
- Merge of old "problem" + "trust strip" + "proof points"
  (combining 3 weak rooms into 1 strong room)
```

---

## Room 03: SERVICES

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD: ◇ OOPUO ──────────────────────── 03/07  nav  [CONTACT]]    │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                                     │
│   SECTION 03 ─── SERVICES                                          │
│                                                                     │
│   ┌─────────────────────┐  ┌─────────────────────┐                 │
│   │  ◇                  │  │  ◇                  │                 │
│   │  WEBSITES           │  │  AI SUPPORT         │                 │
│   │  ───                │  │  ───                │                 │
│   │  Modern, fast,      │  │  24/7 AI assistant  │                 │
│   │  conversion-focused │  │  trained on your    │                 │
│   │  No WordPress.      │  │  product & tone.    │                 │
│   │                     │  │                     │                 │
│   │       [LEARN MORE]  │  │       [LEARN MORE]  │                 │
│   └─────────────────────┘  └─────────────────────┘                 │
│   ┌─────────────────────┐  ┌─────────────────────┐                 │
│   │  ◇                  │  │  ◇                  │                 │
│   │  AUTOMATION         │  │  INTEGRATIONS       │                 │
│   │  ───                │  │  ───                │                 │
│   │  Data entry, reports│  │  CRM ↔ invoicing ↔  │                 │
│   │  invoices — all     │  │  inventory. Connect │                 │
│   │  automated.         │  │  what you have.     │                 │
│   │                     │  │                     │                 │
│   │       [LEARN MORE]  │  │       [LEARN MORE]  │                 │
│   └─────────────────────┘  └─────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- 2x2 grid of service cards
- Cards: lobby-panel bg, thin border (stone-500), accent glow on hover
- Each card: icon (geometric symbol), TITLE (mono, uppercase), accent line, description, subtle link
- Cards stagger-enter from bottom: 80ms delay each (TL → TR → BL → BR)
- Hover: card lifts (translateY -2px), border shifts to accent-line color, subtle glow
```

---

## Room 04: THE PROCESS

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD: ◇ OOPUO ──────────────────────── 04/07  nav  [CONTACT]]    │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                                     │
│   SECTION 04 ─── PROCESS                                           │
│                                                                     │
│   ┌─────────── timeline track (thin accent line) ─────────────┐    │
│   │                                                            │    │
│   ◈──────────────◈──────────────◈──────────────◈              │    │
│   │              │              │              │               │    │
│   │              │              │              │               │    │
│  ┌┴────────┐  ┌──┴───────┐  ┌──┴───────┐  ┌──┴───────┐      │    │
│  │ 01      │  │ 02       │  │ 03       │  │ 04       │      │    │
│  │         │  │          │  │          │  │          │      │    │
│  │DISCOVERY│  │PROPOSAL  │  │BUILD &   │  │SUPPORT & │      │    │
│  │CALL     │  │&TIMELINE │  │DEPLOY    │  │ITERATION │      │    │
│  │         │  │          │  │          │  │          │      │    │
│  │ 30 min  │  │ 48 hrs   │  │ 1-4 wks  │  │ ongoing  │      │    │
│  │         │  │          │  │          │  │          │      │    │
│  │You tell │  │Clear     │  │We build, │  │Available │      │    │
│  │us what's│  │scope,    │  │test, and │  │for adj-  │      │    │
│  │eating   │  │fixed     │  │deploy it.│  │ustments. │      │    │
│  │your time│  │price.    │  │          │  │          │      │    │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘      │    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- Horizontal timeline with connected nodes (accent dots)
- 4 step cards hanging below timeline
- Cards use lobby-panel bg
- Step number: mono, accent, large (2rem)
- Title: display font, semibold
- Duration: mono, muted, small
- Description: body text, stone-200
- Animation: timeline draws left-to-right (600ms), then cards drop in sequentially (100ms stagger)
```

---

## Room 05: COMPLIANCE (Enterprise Teaser)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD: ◇ OOPUO ──────────────────────── 05/07  nav  [CONTACT]]    │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                                     │
│                                                                     │
│   SECTION 05 ─── COMPLIANCE                                        │
│                                                                     │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │   ┌─ ALERT PANEL ─────────────────────────────────────────┐│   │
│   │   │                                                       ││   │
│   │   │  ◈ EU AI ACT                                         ││   │
│   │   │                                                       ││   │
│   │   │  Need EU AI Act                                      ││   │
│   │   │  compliance?                                         ││   │
│   │   │                                                       ││   │
│   │   │  Fines reach €35M. We run audits, deploy             ││   │
│   │   │  observability, and write the documentation          ││   │
│   │   │  that regulators accept.                             ││   │
│   │   │                                                       ││   │
│   │   │  [Learn about compliance services →]                 ││   │
│   │   │                                                       ││   │
│   │   └───────────────────────────────────────────────────────┘│   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- Centered panel with double border (outer: stone-500, inner: accent-line)
- "Alert" aesthetic — like a game notification/mission briefing
- HUD label "EU AI ACT" in mono, accent color, with diamond marker
- Title: display, bold, 2.5rem
- Body: max 600px
- CTA: primary button
- Panel entrance: scale(0.98) → scale(1) + opacity, 400ms
- Border draws in after panel appears (like a scan line)
```

---

## Room 06: CONTACT / CTA

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD: ◇ OOPUO ──────────────────────── 06/07  nav  [CONTACT]]    │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                                                                     │
│                                                                     │
│                                                                     │
│              SECTION 06 ─── CONNECT                                 │
│                                                                     │
│                                                                     │
│              Ready to get                                           │
│              your time back?                                        │
│                                                                     │
│              ── (accent line) ──                                    │
│                                                                     │
│              30 minutes. That's all it takes.                       │
│                                                                     │
│                                                                     │
│              [◈ Book a Free Call]    or message us →                │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- Centered, minimal, maximum whitespace (ma)
- Title: display, bold, 3rem
- Accent separator
- Subtitle: one line, stone-200
- CTA: warm button (ONLY warm usage on homepage) + text link
- This room breathes. Nothing else. Just the ask.
- Background grid intensifies slightly here (subtle pulse)
```

---

## Room 07: FOOTER

```
┌─────────────────────────────────────────────────────────────────────┐
│  [HUD fades out on this room]                                       │
│                                                                     │
│                                                                     │
│   ◇ OOPUO                                                          │
│   AI automation and compliance                                      │
│   for European businesses.                                          │
│                                                                     │
│   ──────────────────────────────────────────────────────────────    │
│                                                                     │
│   Navigation          Contact            Legal                      │
│   ───                 ───                 ───                       │
│   Home                hello@oopuo.com     Privacy Policy            │
│   Enterprise          WhatsApp            Terms of Service          │
│   About               LinkedIn            Manage Cookies            │
│   Blog                                    Accessibility             │
│   Contact                                                           │
│                                                                     │
│   ──────────────────────────────────────────────────────────────    │
│                                                                     │
│   (c) 2025 OOPUO. Amsterdam, Netherlands.                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Layout:
- Standard footer content but styled as final "room"
- HUD nav fades to 0 opacity (footer has its own nav)
- 3-column grid: branding / nav / contact+legal
- Same dark surface as all other rooms
- Progress dots show final position (7/7)
- Feels like "credits" in a game — the quiet end
```

---

## Mobile Adaptation (< 768px)

### Key Changes
- HUD simplifies: logo + hamburger only (no counter, no inline nav)
- Progress dots move to bottom-center (horizontal)
- Cards stack to single column
- Timeline becomes vertical
- Touch: swipe up/down to navigate rooms
- Content panels take full width with 24px padding
- Hero text scales to 2.75rem

### Mobile HUD
```
┌────────────────────────────────────┐
│  ◇ OOPUO                    [≡]   │
└────────────────────────────────────┘
```

### Mobile Progress (bottom)
```
┌────────────────────────────────────┐
│           ● ○ ○ ○ ○ ○ ○           │
└────────────────────────────────────┘
```

---

## Room Count: 7 → 6 (Recommendation)

Consider merging Room 06 (CTA) into Room 05 (Compliance) or Room 07 (Footer) to reduce total rooms. 7 is a lot of scrolls. 5-6 is the sweet spot for full-page sites:

**Option A (6 rooms):**
1. Arrival (Hero)
2. The Gap (Problem + Stats)
3. Services (4 cards)
4. Process (Timeline)
5. Compliance + CTA (combined)
6. Footer

**Option B (5 rooms):**
1. Arrival (Hero)
2. The Gap + Services (split layout)
3. Process (Timeline)
4. Compliance + CTA
5. Footer

Recommendation: **Option A (6 rooms)**. Each room has one clear purpose.
