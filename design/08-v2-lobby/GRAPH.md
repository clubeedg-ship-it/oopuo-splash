# Site graph + multi-column nav schema

> Prototype plan for the OOPUO site as a navigable tree of balls.
> Each level of depth = one vertical column of balls. Active column sits to the right;
> previous columns shift left and fade. macOS Finder column view, but as a game lobby.

---

## 1. The tree

```
ROOT
├─ 01  Arrival                                  (leaf — hero / splash)
├─ 02  The Gap                                  (leaf — problem framing)
├─ 03  Modules                                  (branch)
│       ├─ M.01  Websites
│       │       ├─ Overview
│       │       ├─ Examples
│       │       ├─ Process
│       │       └─ Pricing
│       ├─ M.02  AI Support
│       │       ├─ Overview
│       │       ├─ Examples
│       │       ├─ Process
│       │       └─ Pricing
│       ├─ M.03  Automation
│       │       ├─ Overview
│       │       ├─ Examples
│       │       ├─ Process
│       │       └─ Pricing
│       └─ M.04  Integrations
│               ├─ Overview
│               ├─ Examples
│               ├─ Process
│               └─ Pricing
└─ 04  Invitation                               (branch)
        ├─ Book a Call
        ├─ Send a Message
        └─ WhatsApp
```

**Symmetry**: 4 modules × 4 sub-pages = 16 templated leaves, identical structure.
That's the "very symmetric work tree" feel — every module is the same shape.

**Addressing**: `03/M.01/Process` is a unique coordinate.

---

## 2. Visual schema by state

### State A — root (default)
```
COL 0
●     01 Arrival
│
●     02 The Gap                ← active
│
●     03 Modules
│
●     04 Invitation
```
Rail centered (left: 56px). Top section title: `02 THE GAP`.

---

### State B — entered Modules (clicked M.01 Websites)
```
COL 0           COL 1
                  ●   Overview        ← active
                  │
●  Modules        ●   Examples
                  │
                  ●   Process
                  │
                  ●   Pricing
```
- COL 0 collapses to a **single parent crumb** (the room you came from) at left edge.
- COL 1 slides in from the right with the 4 sub-pages.
- COL 1's active ball gets the full glow + horizontal stick.
- Other balls in COL 1 use DOF blur falloff like the main rail does today.
- Top section title: `M.01 WEBSITES · OVERVIEW`.

---

### State C — gone one level deeper (Pricing)
```
COL 0           COL 1             COL 2
                                    ●  Starter
                ●  Pricing          │
●  Websites                         ●  Premium      ← active
                                    │
                                    ●  Custom
```
- 3 columns. Each previous column = single parent crumb.
- Active column always rightmost, brightest.
- Top title: `M.01 / PRICING / PREMIUM`.

---

### State D — back out
- Clicking any parent crumb (COL 0 or COL 1) collapses everything to the right of it.
- ESC = up one level.
- The main rail's full vertical chain only ever appears at COL 0 when nothing is drilled into.

---

## 3. Active-path highlighting

Across columns, the active path glows in a *gradient of authority*:

| Position             | State                                              |
|----------------------|----------------------------------------------------|
| Deepest active ball  | Bright teal, scale 2x, triple-glow halo, stick     |
| Parent crumbs        | Solid teal, no scale, soft glow, no stick          |
| Siblings of active   | Inherit DOF blur by distance from active           |
| Unrelated columns    | Don't render                                       |

Like a metro-line diagram lit only along your current route.

---

## 4. Per-column behavior

- **Independent scroll**: wheel/touch on a column scrolls only that column. Cursor position determines which column receives the event.
- **Width**: each column is ~40px wide (ball + padding). Three columns = 120px gutter on the left.
- **Connector lines**: thin horizontal teal filaments between adjacent columns at the height of the parent ball, lit only while that parent's child is active.
- **Empty children**: leaves (like 01 Arrival) never spawn a COL 1.

---

## 5. Content map (templated per module)

Every M.0X module has the same 4 sub-pages:

| Sub-page  | Purpose                                  | Length     |
|-----------|------------------------------------------|------------|
| Overview  | Hero + lead + key promise                | ~80 words  |
| Examples  | 2–3 mini case cards (client / outcome)   | ~120 words |
| Process   | 4-step timeline tuned to the module      | ~140 words |
| Pricing   | Starter / Premium tiers + "scope after call" | ~100 words |

That's ~440 words per module → ~1,760 total — light enough to write in one sitting, structured enough to feel like a proper services site.

The **Invitation** branch is asymmetric on purpose:
- Book a Call → embedded scheduler
- Send a Message → contact form
- WhatsApp → deep link

These don't need templated sub-pages; they're action endpoints.

---

## 6. Open questions

1. **Depth ceiling**: 3 columns (root → module → sub-page) feels like the right max. Going 4 deep starts to feel like file-explorer hell. Confirm?
2. **Do 01 Arrival and 02 The Gap need branches?** Currently designed as leaves. Could add (e.g., 02 → "common patterns" / "why now") if we want the symmetry. Probably overkill.
3. **Section title at top** — does it need to display the full path (`MODULES / WEBSITES / PRICING`) or just the deepest active label?
4. **Where does the warm CTA live?** Currently on 04 Invitation. In a multi-column world, maybe it also appears at the end of every Pricing sub-page.
5. **Mobile fallback** — columns collapse to a single rail with breadcrumb back button at top. Drilling = the whole column gets replaced (no parallel display).
6. **SEO routing** — each leaf needs a real URL (`/modules/websites/pricing`). The column UI is purely visual; the routes are flat.

---

## 7. What to build next (in prototype)

If we ship just enough to feel the multi-column behavior:

- [ ] Replace current horizontal branch with **second vertical column**
- [ ] Wire **1 module (M.01 Websites) only** with its 4 sub-pages
- [ ] Active-path highlighting across columns
- [ ] Parent-crumb click = collapse back to that level
- [ ] Top title shows path
- [ ] Other 3 modules: cards still clickable, sub-rooms reuse Websites' content as a stub (so the column behavior is fully testable without writing 16 sub-pages of copy)

Once that lands and reads right, fill the other 11 sub-pages with real copy.
