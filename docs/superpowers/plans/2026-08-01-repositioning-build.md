# Build plan — OOPUO Intelligence repositioning (EN)

**Spec:** `docs/superpowers/specs/2026-07-31-oopuo-intelligence-repositioning-design.md`
**Decision:** D-028 · **Scope:** EN only · **Started:** 2026-08-01

No build step. Plain static HTML/CSS/JS in `public_html/`. Preview at
`python3 -m http.server 4330 --directory public_html`. Every task below ends with a verification
that produces a number or a pass/fail, not an impression — and every task is one commit.

---

## 1. Done

| # | Task | Commit | Evidence |
|---|---|---|---|
| 1.1 | Track `AGENTS.md`; ignore `.screenshots/` + `/material/` | `ccaef78` | fresh clone keeps agent memory |
| 1.2 | Edge-scroll rework reviewed, wheel-clamp bug fixed | `c1dc092` | flicks 250–3000px scroll without skipping; edge still crosses at 100px |
| 1.3 | Case study + gallery + `media/` tracked; images to WebP | `3694c1b` | 4.4MB → 272KB, 251KB transferred |
| 1.4 | Repositioning spec | `eca3114` | 13 sections, no placeholders in the design |
| 1.5 | `willReadFrequently` on the AsciiEffect context | `5b37da1` | console silent, 0 messages |
| 1.6 | Snapshot the repositioning in `AGENTS.md §8` | `361518c` | ⚠️ flag at the top of the snapshot |
| 1.7 | Split hero + Systems deck on `/` | `ceb3724` | panels 222→749px on hover; text clear of the sculpture |
| 1.8 | Lazy bloom + font preload + deck fills the section | `431cf51` | sculpture **2372ms → 986ms**; deck 61% of viewport |
| 1.9 | `/systems/cutting-edge/` — card activates into a page | `7f3a4a1` | cold load + soft-nav, 41 sitemap URLs, exact parity |
| 1.10 | Drop the nested accordion; tighten side-page spacing | `1d84c6e` | 4 workflow rows, 0 nested decks, `120/120/84` → `88/72/48` |

---

## 2. Next, in order

### 2.1 `/lab/` — built by OOPUO
The Lab index: three panels in the same top-level accordion — **Zenithcred** (designed),
**Interwall** (running), **the voice agent** (running). The voice agent is led by what makes it
unusual, not by what it does: *a personal assistant that runs without anything leaving the
building.*

- Reuses the deck component unchanged. No new interaction.
- Clears one of the two remaining 404s from the Systems deck.
- **Verify:** cold load and soft-nav from `/`; 3 panels expand on hover and arrow keys; sculpture
  persists across the soft-nav; sitemap parity holds; 0 console errors.

### 2.2 `/lab/zenithcred/` — the most important new page
Structured as the argument itself, in this order: thesis → why nobody has measured it → the
volunteer-consent opening → the foundation / university / BV structure → where the legal line is
→ status and what is needed.

- Steps 2 and 3 are load-bearing. If a reader remembers one thing from the site, it is that
  consent under a wage relationship is not consent, and that unpaid volunteers dissolve it.
- Status is **designed, not running** and must read that way. No implied findings, no implied
  partner — the foundation is not on its feet, the BV is not opened, no university is approached.
- Say plainly that biofeedback is special-category data and that the university's ethics approval
  is what carries it. That is evidence of rigour, not a disclaimer.
- Ships with the partner **anonymised** ("a Dutch food-rescue foundation") until spec §9.4 lands,
  even though the operator chose full disclosure — naming a partner org and the population it
  serves is that partner's call.
- The page ends with what would move it forward, which is the honest call to action.
- **Verify:** cold load; every claim carries a status tag; no sentence implies data that does not
  exist; 0 console errors.

### 2.3 `/systems/websites/`
Gallery of the eight shipped sites, opening from the Systems deck. Images are already WebP and
already carry `loading`, `alt` and intrinsic dimensions.

- Clears the **last** 404 from the Systems deck.
- **Verify:** all 10 images decode; total transfer stays under ~300KB; sitemap parity.

### 2.4 Mobile overlay menu
The homepage still exposes about seven links under 900px, four of them the locale switcher, and
the nav rail is `display:none`. A phone visitor cannot reach Services or Contact except by
swiping the whole journey in order.

- Hamburger in the HUD → full-screen overlay: six sections + Enterprise + locale.
- Closes on Escape, backdrop click, and navigation. Focus trapped while open, returned to the
  trigger on close.
- **Verify:** at 390px, every section reachable in one tap from any page; focus trap holds;
  Escape closes; 0 console errors.

### 2.5 `/services/private/` — private & sovereign systems
**Gated on operator input §9.9.** Written strictly by capability: AI on the client's own
hardware, private networks and hardened devices, on-premise retrieval, IT and infrastructure as
part of the deliverable.

- Names no client and no sector. The audience is "people who run things".
- Carries no capability without a matching entry on the §9.9 list. This page invites vetting;
  written from ambition rather than evidence it does more harm than not existing.
- **Verify:** every stated capability maps to a §9.9 entry; no client, sector or proper noun.

### 2.6 Demote Services, retitle Studio
Services moves from position 3 to position 5 and is re-cut into the same accordion, keeping the
existing four detail pages and their reworked pricing. `/studio/` becomes "How I work" and keeps
its URL (indexed, in the sitemap), gaining the capability bench described as capability rather
than a roster.

- **Verify:** journey order and counters correct on every page; `/studio/` still resolves; the
  four service detail pages unchanged; sitemap parity.

---

## 3. After EN is approved live

Nothing below starts until the operator has seen EN on oopuo.com and approved it.

- **NL + FR propagation.** The router already supports any locale; this is translation plus
  locale-prefixed scaffolding. Full hreflang matrix and sitemap regeneration.
- **pt-br.** Still the single-page Brazil canvas. D-018 forbids translating the EU material —
  its deep content must be authored Brazil-native (R$, WhatsApp, parceria) and needs operator
  direction on the Brazil offer set.
- **Blog pipeline.** `tools/render_posts.py`, stdlib-only, so posts come from markdown. Deferred,
  operator convenience.
- **Phase 3.** Compliance and conversion: consent gate, legal pages, then the real Meta Pixel ID
  and Meeting slug.

---

## 4. Operator inputs (spec §9)

Each is a one-line swap. None blocks construction; each blocks publication of the section that
depends on it.

| # | Input | Gates |
|---|---|---|
| 9.1 | Cutting Edge workflow list, in his words | `/systems/cutting-edge/` copy |
| 9.2 | Is the Power BI / inventory / assistant work client work or Interwall? | `/lab/`, Systems |
| 9.3 | **Cutting Edge's agreement to be named** + the floor plan + €66.900,90 | **already live on oopuo.com** |
| 9.4 | The foundation's name and its founder's consent | `/lab/zenithcred/` full disclosure |
| 9.5 | Is Zenithcred the programme or the platform? Registered or provisional? | `/lab/zenithcred/` |
| 9.6 | What should a Lab reader do? | how the Lab section ends |
| 9.7 | A name for the voice agent | `/lab/voice-agent/` |
| 9.8 | What "power business integrations" means | Services |
| 9.9 | **Demonstrable private/sovereign capability list** | `/services/private/` entirely |

Older, unrelated to the repositioning: real Meta Pixel ID · real Meeting slug · NL+FR HubSpot
form IDs · legal entity details for the privacy and mentions-légales pages.

---

## 5. Standing constraints

- No build step. No Astro, no npm. This was tried and removed (D-020, D-021).
- Never mix Europe and Brazil framing (D-018).
- WhatsApp CTAs use brand colours, never `#25D366`.
- The accordion is used at the **top level only**. Nesting it inside a case page was built,
  rejected by the operator, and removed — do not reintroduce it.
- No claim ships without a status tag. Nothing marked "designed" may read as running.
- `/services/private/` names no client and no sector.
- The site is not positioned toward advertising defense or weapons capability (spec §10).

## 6. Verification habits that earned their place

- **Verify in a fresh context with the HTTP cache disabled.** A query string on the page URL does
  not bust an ES module import; the `willReadFrequently` fix looked like it had failed for two
  runs because of exactly this.
- **Never stage a room by hand to measure it.** Setting `.active` and `data-room` skips
  `placeScroll()`, so measurements land inside the slack band and correct layout looks broken.
  Drive it with a real wheel gesture.
- **Wait for `decode()` before calling an image broken.** Sampling mid-load reports `complete:
  false` on images that are perfectly fine.
- **Touch cannot be verified here.** Synthetic touch events do not drive native scrolling. Say so
  rather than implying coverage; the operator can check on a real device in seconds.
