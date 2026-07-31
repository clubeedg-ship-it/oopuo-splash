# OOPUO Intelligence — repositioning design

**Date:** 2026-07-31
**Status:** design, awaiting operator approval
**Scope:** EN locale only. NL/FR propagate afterwards; pt-br untouched.

---

## 1. The problem

The site today is a competent EU lead-generation brochure for an AI services studio. It sells
four modules across 40 well-built pages. What it does not do is say who the operator is, what he
is actually working on, or what he thinks. In his words: *"there's literally nothing there."*

He wants people — anywhere, in any country he travels to — to see the projects he works on and
the topics he is engaged with, and to conclude that he is someone worth hiring. The current site
cannot produce that conclusion, because it contains no evidence of his real work and no trace of
his thinking.

## 2. Positioning (decided)

- **Entity:** OOPUO Intelligence — a personal lab, focused on high gain.
- **Goal:** credibility that converts into contracts and projects. Not investment.
- **Audience:** anyone evaluating whether to hire him, read anywhere in the world.
- **Signature trait — the unblocker.** The single thing the site exists to establish:
  *give him a problem that is blocked — legally, structurally, or by privacy — and he finds the
  configuration that unblocks it.* This is what distinguishes him from a competent implementer,
  and it is the bridge between the client automation work and the sovereign work, which otherwise
  sit far apart on the credibility ladder. Zenithcred is its proof: the research was impossible
  under employment because a wage relationship voids consent, and unpaid volunteers dissolve the
  imbalance. Every section should reinforce this trait; no section should assert it as an adjective.
- **Spine:** *systems where the gain is high and the stakes are too high to outsource.* Every
  section answers **what was the gain** — time removed, work eliminated, risk closed — and, where
  it applies, **why it could not be handed to a public cloud API**.
- **Bench:** specialist capability (cybersecurity, ML engineering, AI systems, IT and network
  work) described as capability, never as a named roster.
- **Discretion rule:** private and sovereign work is described **by capability, never by client
  type**. What is built — air-gapped deployment, on-premise models, private networks, nothing
  leaving the perimeter — is stated plainly. Who it is built for is not. The reader who needs it
  recognises themselves; the site never names sectors or clients in this category.
- **Honesty rule:** nothing on the site is claimed without a status tag. Shipped, running, and
  designed are visually distinct states, and "designed" is never dressed as "running."

## 3. Information architecture

Six sections on a five-stop journey, mirroring the existing router so no new navigation system
is introduced.

| # | Section | URL | Status |
|---|---|---|---|
| 01 | Arrival | `/` (room 1) | rewrite |
| 02 | Systems — built for clients | `/` (room 2) | rewrite |
| — | Cutting Edge case | `/systems/cutting-edge/` | new |
| — | Website work | `/systems/websites/` | new |
| 03 | The Lab — built by OOPUO | `/lab/` | new |
| — | Zenithcred | `/lab/zenithcred/` | new |
| — | Interwall | `/lab/interwall/` | new |
| — | Voice agent | `/lab/voice-agent/` | new |
| 04 | How I work | `/studio/` | retitle, keep URL |
| 05 | Services | `/services/` + 4 detail pages | demote, keep |
| — | Private & sovereign systems | `/services/private/` | new |
| 06 | Contact | `/contact/` | unchanged |
| — | Writing | `/blog/` + 3 posts | keep, linked from The Lab |
| — | Enterprise | `/enterprise/` | keep |

`/studio/` keeps its URL despite the retitle, because it is already indexed and in the sitemap.
Seven new EN pages result. `sitemap.xml` is regenerated; hreflang for the new pages points only
at `en` until NL/FR versions exist.

**Retirement:** the standalone "The Gap" room is removed as a section. Its strongest lines —
the argument that a company needs a few well-chosen systems rather than a transformation — move
into the Arrival sub-headline and the Services introduction. No copy is deleted without being
relocated.

## 4. Section designs

### 01 · Arrival

Split hero. The text column and the sculpture occupy separate space and never overlap; on mobile
the sculpture takes the top third and the text sits below it. This resolves the current defect
where body copy renders directly over the bright cyan core of the sculpture.

Headline leads with the number, sub-headline states the shape of the practice:

> **Two weeks of design work, done in two days.**
> Give me a problem that's blocked — legally, structurally, by privacy — and I find the
> configuration that unblocks it.

The headline proves competence with a number; the sub-headline states the trait. In that order,
because a stranger grants attention for evidence and spends it on a claim, not the reverse.

Two actions: **See the systems →** (room 2) and **Work with me →** (`/contact/`).

### 02 · Systems — built for clients

A horizontal accordion of full-height panels. Three panels: Cutting Edge, Website work, and a
doorway panel into The Lab. Hovering a panel expands it in place; the others compress to spines
carrying vertical labels. Clicking navigates into the case page.

Every card carries the same four lines: **what it was · what it is now · the gain · status.**

Cutting Edge is the flagship: an interior-design production company whose internal logic flow was
rebuilt, with sourcing, design/3D, the renovation-estimate pipeline and project management as
workflows inside it. Its headline figure is **1–2 weeks → 2 days maximum**.

### 03 · The Lab — built by OOPUO

The same accordion grammar, holding the operator's own ventures rather than client deliverables.
This separation is the reason the site can claim "I experiment with high-gain things" structurally
rather than rhetorically.

Three panels: **Zenithcred** (designed, not running), **Interwall** (running — inventory, stock,
support automation), **the voice agent** (running).

The voice agent is led by what makes it unusual, not by what it does: **a personal assistant that
runs without anything leaving the building.** Spoken intent drives the workflow executing behind
it, and no part of that round trip touches the public internet. It is the clearest single proof
of the private-and-sovereign capability described in §4.05, which is why it sits in The Lab as
evidence rather than only in Services as an offer.

`/lab/zenithcred/` is the most important new page on the site. It is not merely a project entry —
it is the evidence for the signature trait in §2, and steps 2 and 3 below are the load-bearing
part. It is structured as the argument the operator actually made:

1. **Thesis.** After universal basic income, people work for physical and mental health rather
   than money. Work centers become health centers rather than production centers.
2. **Why nobody has measured it.** An employer paying wages holds power over the employee, so
   consent to biometric measurement is not freely given and does not hold.
3. **The opening.** Unpaid volunteers have no such imbalance, so their consent is real. This is
   the insight the entire programme rests on.
4. **The setting.** A Dutch food-rescue foundation that redistributes food near expiry and uses
   the work to train people — often asylum seekers — back onto their feet, whose founder wants
   his methods formalised.
5. **The structure.** The foundation runs the work. A university holds the data, because a
   university is where research data belongs and where ethics approval comes from. A BV holds the
   platform IP, because a foundation cannot hold assets of that kind. The BV shields the
   foundation and gives it a route to the university.
6. **Where the line is.** Biofeedback is special-category health data. Free consent alone is not
   a sufficient legal basis; the university's ethics approval carries it. Stating this explicitly
   is evidence of rigour, not a disclaimer.
7. **Status and what is needed.** Designed, not running. The foundation is not yet on its feet,
   the BV is not yet opened, no university has been approached. The page ends by naming what
   would move it forward.

The operator has chosen **full disclosure**, including naming the foundation. That requires two
inputs (§9) before the page can ship in that form; until then it ships with the partner
anonymised, which costs the page nothing structurally.

### 04 · How I work

Absorbs the existing Studio room and keeps the copy sharpened in June 2026 (`162d472`), which is
good and is not rewritten. Adds the specialist bench as capability rather than roster, framed as
scoping honesty: work that is not his is handed to someone better, and he says so up front.

### 05 · Services

The four existing service pages survive intact and keep their reworked pricing (`e08acaa`). They
are re-cut into the same accordion for visual consistency and move from position 3 to position 5.
Nothing is discarded — services simply stop being the first thing a stranger meets.

A **fifth panel is added: Private & sovereign systems**, at `/services/private/`. It is the offer
form of the positioning in §2, and it is written strictly by capability:

- AI that runs on the client's own hardware, with no data leaving the perimeter.
- Private networks and hardened devices for reaching those systems.
- On-premise assistants and retrieval over private data, rather than cloud APIs.
- IT and infrastructure work, not only AI — the network is part of the deliverable.

Two things this page never does: name a client, or name a sector. The audience is described only
as **people who run things** — those for whom the exposure created by ordinary tooling is the
problem being solved. Anyone who needs this recognises it without being told who else bought it.

Because this page invites vetting, it carries no capability that cannot be demonstrated on
request. The concrete list is an operator input (§9.9), and the page ships with only what that
list supports.

### 06 · Contact

Structurally unchanged. The live EN HubSpot form (`2fef7ceb-b34c-4792-9a0d-1a2d618767b9`) stays,
as do the inert NL/FR placeholders and the mailto fallback.

## 5. The accordion component

One component, used at three levels: the Systems deck, the Lab deck, and the workflow deck inside
a case page. Building it once and reusing it is what makes the interaction read as a grammar
rather than an effect.

**States.** Resting: N equal full-height panels. Hover (pointer devices): the hovered panel
expands, siblings compress to spines with vertical labels. Activated: the panel expands to fill
the viewport and the router soft-navigates to its URL, where the panel's content is itself an
accordion one level down.

**The activated state is a real page.** `/systems/cutting-edge/` loads cold as a complete static
HTML file showing the workflow accordion. The expansion animation is presentation; the URL is the
truth. This follows the existing invariant that every section is a crawlable URL, and it is the
difference between a page that can be sent to someone and one that can only be demonstrated.

**Input parity.**

- Pointer: hover previews, click activates.
- Touch: hover does not exist, so below 900px panels stack vertically and tap expands in place.
  A second tap on an expanded panel activates it.
- Keyboard: panels are a roving-tabindex group; arrow keys move between them, Enter or Space
  activates, and focus is visible at all times.
- Screen readers: panels are links with accessible names; the deck is a list. Compressed spines
  are not hidden from the accessibility tree.
- `prefers-reduced-motion`: expansion is instantaneous. No slide, no FLIP animation.

## 6. Mobile navigation

The homepage currently exposes seven links, four of which are the locale switcher, and the nav
rail is `display:none` below 900px. A visitor on a phone cannot reach Services or Contact except
by swiping the entire journey in order. This suppresses both conversion and internal linking.

A hamburger control in the HUD opens a full-screen overlay listing all six sections plus
Enterprise and the locale switcher. It closes on Escape, on backdrop click, and on navigation;
focus is trapped while open and returned to the trigger on close.

## 7. Engine work

The uncommitted edge-scroll rework was reviewed on 2026-07-31 against the EN pages at 1440×900.
It passes on content travel, edge deadzone, centred placement, side-page exemption, sustained
scrolling, soft-nav across the boundary, reduced motion, and horizontal overflow, with zero
console errors.

**One defect to fix before commit.** A single wheel event of roughly 500px or more from the top
of a section navigates instead of scrolling, skipping the section's entire content. Measured:
420px scrolls and clamps correctly at the edge; 600px jumps to the next room. The fix is to
consume the gesture as scroll whenever travel remains in that direction, and to require a
separate gesture to cross the edge.

Touch behaviour is unverified — synthetic touch events do not drive native scrolling, so this
needs a real device on the deployed site.

## 8. Performance and hygiene

- **Images.** The ten work screenshots are 1440×900 PNGs totalling 4.4MB, rendered into a
  324×202 box. Converting to WebP at twice display size reduces this to roughly 400KB with no
  visible change. Markup already has `loading="lazy"`, `alt`, and intrinsic `width`/`height`.
- **`willReadFrequently`.** `AsciiEffect.js:181` performs repeated `getImageData` calls without
  the hint, warned on every page load. One-line fix in the vendored file, with a comment marking
  it as a local modification so it is not lost on a future Three.js update.
- **Repository coherence.** `AGENTS.md` is untracked while `CLAUDE.md` is a ten-byte pointer to
  it, so a fresh clone loses the agent memory entirely. `public_html/media/` is untracked while
  eleven of its images are referenced by shipped pages. Both are committed before any new work.
- **Screenshots.** Root PNG debris and stale Playwright traces were archived to `.screenshots/`
  and the directory added to `.gitignore`, along with `/material/`, which holds client working
  files that must never enter the upload set.

## 9. Content required from the operator

Each is a one-line swap into a placeholder. None blocks construction; all block publication of
the section that depends on them.

1. The full workflow list for Cutting Edge, in the operator's own words.
2. Whether the Power BI / business-intelligence, inventory, and personal-assistant agent work is
   client work or belongs to Interwall and the voice agent.
3. Cutting Edge's agreement to be named, with the floor plan and the €66.900,90 figure. **This
   case is already live on oopuo.com**, so it is a current exposure rather than a future one.
4. The food-rescue foundation's name, and its founder's agreement to be named alongside a
   description of the population it serves.
5. Whether "Zenithcred" is the public name, whether it denotes the research programme or the
   platform, and whether it is registered or provisional.
6. What a reader of The Lab should do: make contact as a university, fund it, volunteer,
   introduce someone, or nothing.
7. A name for the voice-agent project.
8. Whether "power business integrations" means Microsoft Power Platform and Power BI specifically,
   or something broader.
9. **The demonstrable capability list for `/services/private/`** — what can actually be shown or
   evidenced today: self-hosted models on owned hardware, air-gapped deployment, private network
   builds, hardened devices, on-premise retrieval over private data, and any certification or
   completed delivery that backs them. Nothing goes on that page without a corresponding entry
   here. This is the input that most directly determines whether the section reads as capability
   or as claim.

## 10. Not positioned toward

Recorded so a later session does not reopen it as an oversight. The operator raised, and then
excluded, advertising defense or weapons-development capability on the site. The reasoning was
commercial rather than moral, and it stands:

- That market is entered through clearances, nationality and facility requirements, export-control
  registration and prime-contractor relationships — not through public marketing. Advertising the
  capability signals distance from the system rather than access to it.
- Dual-use and munitions work from the Netherlands runs through EU Regulation 2021/821 and
  national licensing. Publishing capability that cannot be lawfully delivered creates exposure
  without creating access.
- It would collide directly with Zenithcred. A university ethics committee vets its partners
  before approving a biofeedback study involving asylum seekers, and such marketing is a plausible
  reason to decline — trading a designed structure for an inaccessible market.

The high-stakes appetite is expressed instead through the signature trait (§2) and the private and
sovereign capability (§4.05), both of which reach the same callers without an unbackable claim.

## 11. Out of scope

pt-br, which stays the single-page Brazil-native canvas per D-018 and whose deep content must be
authored rather than translated. NL and FR, which propagate only after EN is approved on the live
domain. The blog markdown pipeline. Phase 3 compliance work. No build step is introduced — the
site remains plain static HTML, CSS and JavaScript in `public_html/`.

## 12. Order of work

1. Commit `AGENTS.md` and `public_html/media/`; fix the wheel clamp; commit the edge-scroll work.
2. Build the accordion component and prove it in the Systems deck.
3. Split hero, then the mobile overlay menu.
4. The seven new pages, with placeholders where §9 inputs are missing.
5. Demote Services, retitle Studio, relocate the Gap copy.
6. WebP conversion, `willReadFrequently`, regenerate `sitemap.xml`.
7. Verify on a fresh browser context; operator verifies touch on a real device.

## 13. Done means

Every new URL loads cold as a complete static page with the persistent sculpture and HUD intact.
The accordion works under pointer, touch, and keyboard, and collapses instantly under reduced
motion. The homepage is reachable in one tap from any section on a phone. No text renders over
the bright region of the sculpture at any breakpoint. Zero console errors across every EN page.
`sitemap.xml` matches the page tree exactly in both directions, as it does today. No claim
appears on the site without a status tag, and nothing marked "designed" is presented as running.
The private and sovereign section names no client and no sector, and states no capability that
is not backed by an entry on the §9.9 list.
