# OOPUO v2 — Interaction Spec: "The Lobby"

> ⚠️ **STALE — kept for archive.** This doc was written when the morph system was particle-based (DOM spans + CSS sin-wave wobble). The current implementation is **Three.js + AsciiEffect + bloom + multi-layered hue animations**. See [STATE.md](./STATE.md) for the current spec.

---

## Core Motion Principles

### 1. Nothing Moves Without Reason
Every animation communicates something: "you're moving", "this is new", "this is interactive". If the motion doesn't carry information, cut it.

### 2. Everything Has Weight
Elements don't just appear — they arrive. Not bouncy or playful. Measured and deliberate, like mechanical precision. Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) for entrances, `cubic-bezier(0.65, 0, 0.35, 1)` (smooth in-out) for state changes.

### 3. Stagger Creates Hierarchy
When multiple elements enter, they stagger. The most important element arrives first. The stagger interval is short (50-80ms) — it's a ripple, not a waterfall.

---

## Room Transition

### Scroll/Swipe Between Rooms

```
PHASE 1: Current room exits                    [0-300ms]
  - Content panel: opacity 1→0, translateY(0 → -20px)
  - HUD section label: crossfade to next label
  - Progress dot: shrink current, grow next

PHASE 2: Gap                                   [300-400ms]
  - Brief void — just the ambient grid visible
  - Grid shifts slightly (parallax layer moves)

PHASE 3: Next room enters                      [400-800ms]
  - Content panel: opacity 0→1, translateY(20px → 0)
  - Child elements stagger in (50ms intervals)
  - If room has special entrance (timeline draw, card cascade), trigger it

Total: ~800ms per transition
```

### Timing Function
```css
--ease-room: cubic-bezier(0.16, 1, 0.3, 1);
```

### Wheel/Trackpad Handling
```
Accumulator model:
  - Collect deltaY values over 200ms window
  - Trigger transition when accumulated |delta| >= 50
  - Lock transitions for 800ms after trigger (prevent double-fire)
  - Reset accumulator on direction change
```

---

## HUD Behaviors

### Section Counter
```
Current:  01 / 07
Next:     02 / 07

Animation: numbers use a slot-machine roll effect
  - Current number slides up and fades out   [200ms]
  - New number slides up from below           [200ms]
  - "/" and total remain static
```

### Section Label (next to counter)
```
Current:  ARRIVAL
Next:     THE GAP

Animation: crossfade with slight translateX
  - Old label: opacity 1→0, translateX(0 → -8px)   [150ms]
  - New label: opacity 0→1, translateX(8px → 0)     [150ms, 50ms delay]
```

### Nav Opacity
```
Room 01-06: opacity 1
Room 07 (footer): opacity 1→0 over 300ms (footer has own branding)
```

---

## Ambient Grid Layer

### Static State
```css
background-image:
  /* horizontal lines */
  repeating-linear-gradient(
    0deg,
    var(--grid-line) 0px,
    var(--grid-line) 1px,
    transparent 1px,
    transparent 80px
  ),
  /* vertical lines */
  repeating-linear-gradient(
    90deg,
    var(--grid-line) 0px,
    var(--grid-line) 1px,
    transparent 1px,
    transparent 80px
  );
```

### Parallax on Room Change
```
Grid layer translateY shifts at 0.3x rate of content
  - Content moves -100vh per room
  - Grid moves -30vh per room
  - Creates subtle depth separation
```

### Pulse Effect (CSS only)
```css
@keyframes grid-pulse {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 0.7; }
}

.grid-layer::after {
  /* radial gradient that follows a slow path */
  background: radial-gradient(
    600px circle at var(--pulse-x, 50%) var(--pulse-y, 50%),
    var(--scan-pulse),
    transparent
  );
  animation: grid-pulse 8s ease-in-out infinite;
}
```

---

## Card Interactions

### Service Cards (Room 03)

```
DEFAULT STATE:
  background: var(--lobby-panel)
  border: 1px solid var(--stone-500)
  transform: translateY(0)
  box-shadow: none

HOVER STATE (300ms ease):
  border-color: var(--accent-line)
  transform: translateY(-2px)
  box-shadow: 0 0 20px var(--accent-glow), inset 0 0 20px var(--accent-glow)

ENTRANCE (per card, staggered 80ms):
  from: opacity 0, translateY(16px)
  to:   opacity 1, translateY(0)
  duration: 400ms ease-out-expo
  order: top-left → top-right → bottom-left → bottom-right
```

### Card Inner Elements
```
On card hover:
  - Icon: color shifts to accent (200ms)
  - Title underline: width 0 → 100% (300ms)
  - "Learn more" text: opacity 0.5 → 1, translateX(0 → 4px) (200ms)
```

---

## Timeline (Room 04)

### Draw Animation
```
Phase 1: Horizontal line draws left-to-right
  - stroke-dashoffset animation
  - Duration: 600ms
  - Each node dot appears when line reaches it

Phase 2: Cards drop in below nodes
  - from: opacity 0, translateY(-12px)
  - to: opacity 1, translateY(0)
  - Duration: 300ms each
  - Stagger: 100ms
  - Start: after line completes (600ms delay)
```

### Node Dots
```
Inactive: 6px circle, stone-400 border, transparent fill
Active (reached by timeline): 8px, accent border, accent fill
Transition: scale(0.8 → 1.2 → 1), fill-opacity 0→1  [300ms]
```

---

## Compliance Panel (Room 05)

### Entrance
```
Phase 1: Outer border draws (like a scan frame)
  - Top line:    left → right  [0-200ms]
  - Right line:  top → bottom  [200-400ms]
  - Bottom line: right → left  [400-600ms]
  - Left line:   bottom → top  [600-800ms]

Phase 2: Content fades in inside frame
  - HUD label "EU AI ACT": 800ms, slide-right
  - Title: 900ms, fade-up
  - Body: 1000ms, fade
  - CTA: 1100ms, fade-up
```

This creates a "mission briefing loading" effect — the frame scans into existence, then the content materializes within it.

---

## Scroll Indicator (Room 01 only)

### Design
```
      ↓
   SCROLL

Chevron: thin, accent color, 16px
Text: mono, 0.625rem, stone-300, uppercase, tracking 0.15em
```

### Animation
```css
@keyframes scroll-hint {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50%      { opacity: 0.8; transform: translateY(6px); }
}
/* 2s cycle, ease-in-out, infinite */
/* Disappears after first scroll (JS removes class) */
```

---

## Progress Dots (Side Rail)

### Desktop: Right edge, vertically centered
```
Dot layout:
  ○   (inactive: 8px, stone-400 border, transparent)
  ○
  ●   (active: 10px, accent fill, accent border, scale 1.3)
  ○
  ○
  ○

Spacing: 16px between dots
Position: right 24px, top 50%, transform -50%
```

### Active Dot Transition
```
Outgoing: scale 1.3→1, fill-opacity 1→0, border-color accent→stone-400  [250ms]
Incoming: scale 1→1.3, fill-opacity 0→1, border-color stone-400→accent  [250ms]
```

### Mobile: Bottom center, horizontal
```
○ ○ ● ○ ○ ○

Position: bottom 24px, left 50%, transform -50%
Same animations but horizontal layout
```

---

## Reduced Motion

When `prefers-reduced-motion: reduce`:
- All transitions: 0ms duration
- Room changes: instant cut (no slide)
- Grid: static, no pulse
- Cards: instant hover state (no lift animation)
- Timeline: fully visible immediately (no draw animation)
- Compliance border: fully visible immediately
- Scroll indicator: static (no bob)

Everything still works. Nothing moves.

---

## Keyboard Navigation

| Key | Action |
|---|---|
| `↓` `PageDown` `Space` | Next room |
| `↑` `PageUp` | Previous room |
| `Home` | First room |
| `End` | Last room |
| `Tab` | Focus next interactive element within room |
| `1-7` | Jump to room N (stretch goal) |

Focus trap: Tab cycles within the current room's interactive elements. On the last focusable element, Tab advances to the next room.

---

## Performance Budget

| Asset | Target |
|---|---|
| Grid CSS (no JS) | 0 KB JS |
| Scroll engine | < 3 KB minified |
| Entrance animations (CSS) | 0 KB JS |
| Total JS for lobby | < 5 KB |
| First paint | < 1s |
| Room transition | < 16ms per frame (60fps) |

No external libraries. No GSAP, no fullPage.js. Pure CSS transitions + a tiny scroll controller. The constraint is the design.
