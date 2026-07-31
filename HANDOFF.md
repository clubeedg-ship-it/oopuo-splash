# OOPUO Splash — next-agent handoff

Paste-ready brief. Read this, then `AGENTS.md §8`, then the spec and plan named below.
`DECISIONS.md` is the full decision log. **No build step exists or should exist.**

Last updated **2026-08-01**.

---

## Where the project is

The site is live-ready static HTML in `public_html/`, deployed by uploading to Hostinger.
EN, NL and FR each have a 13-page router tree; pt-br is still a single Brazil-native page.

**A repositioning is in flight, and it changes what EN is.** The site was a competent EU
lead-generation brochure that said nothing about who the operator is or what he works on. It is
becoming **OOPUO Intelligence — a personal lab**, whose job is credibility that converts into
contracts and projects. Decision: **D-028**.

Two documents govern the work. Read both before touching EN content or the room structure:

- **Spec** — `docs/superpowers/specs/2026-07-31-oopuo-intelligence-repositioning-design.md`
- **Plan** — `docs/superpowers/plans/2026-08-01-repositioning-build.md`

NL, FR and pt-br are **frozen** until EN is approved on the live domain. Do not propagate early.

---

## Start here

```bash
pwd && git branch --show-current && git status --porcelain
python3 -m http.server 4330 --directory public_html   # → http://localhost:4330/
```

Then: `AGENTS.md §8` (hot snapshot) → plan §2 (what is next) → `PROJECT.md §E` (handoff detail).
The plan is the assignment; work through §2 in order, one commit per task.

---

## What OOPUO is (D-018 — never mix the two tracks)

- **Europe track** (`en` root, `nl/`, `fr/`): € pricing, EU AI Act, Amsterdam, HubSpot + email.
- **Brazil track** (`pt-br/`): SMB strategy in Portuguese — WhatsApp-first automated service,
  "parceria não produto", R$ pricing, LGPD, Goiás PMEs. Outbound motion, low SEO need.
- Enterprise/EU content NEVER appears on Brazil; WhatsApp/LGPD/parceria NEVER on Europe.
- Internal Brazil strategy source: Google Doc "OOPUO — Guia estratégico interno" (indexed in
  context-mode as `oopuo-strategy-doc`).

---

## What you most need to know about the repositioning

**The positioning in one sentence.** *Give him a problem that is blocked — legally, structurally,
or by privacy — and he finds the configuration that unblocks it.* Every section reinforces this;
no section asserts it as an adjective.

**Zenithcred is the proof, and the interesting part is not the biofeedback.** It is that an
employer paying wages holds power over the employee, so consent to biometric measurement is not
freely given — while unpaid volunteers dissolve that imbalance. The foundation/university/BV
structure follows from that insight. `/lab/zenithcred/` is the most important page still unbuilt.

**Nothing ships without a status tag.** Shipped, running and designed are visually distinct, and
nothing marked designed may read as running. Zenithcred is designed: the foundation is not on its
feet, the BV is not opened, no university has been approached.

**One accordion, top level only.** Full-height panels, hover or tap expands, activating navigates
to a real crawlable URL. Nesting it inside a case page was built, rejected by the operator, and
removed. Do not reintroduce it.

**Private and sovereign work is described by capability, never by client type.** The audience is
named only as "people who run things". No sector, no client. Nothing goes on that page without a
matching entry on the operator's demonstrable-capability list (spec §9.9).

---

## Traps that have already cost time

- **Verify with the HTTP cache disabled.** A query string on the page URL does not bust an ES
  module import. A correct fix looked broken for two runs because of this.
- **Never stage a room by hand to measure layout.** Setting `.active` and `data-room` skips
  `placeScroll()`, so you measure inside the slack band and correct layout looks broken. Drive it
  with a real wheel gesture.
- **Wait for `decode()` before calling an image broken.** Mid-load sampling reports
  `complete: false` on healthy images.
- **Touch cannot be verified from here.** Synthetic touch events do not drive native scrolling.
  Say it is unverified rather than implying coverage — the operator deploys in seconds and can
  check on a real device.
- **HubSpot and Meta Pixel only work on the live https domain**, never on localhost.

---

## Blocked on the operator

Nine content inputs (spec §9, tabulated in plan §4) gate **publication**, not construction. Build
with placeholders and swap them in — that is the operator's stated preference for integration IDs,
and the same pattern applies to copy.

One has a clock on it: **§9.3 — Cutting Edge's name, floor plan and the €66.900,90 figure are
already live on oopuo.com.** That is a current exposure rather than a future one.

Older, unrelated to the repositioning: real Meta Pixel ID · real Meeting slug · NL+FR HubSpot
form IDs · legal entity details for the privacy and mentions-légales pages. Each is a one-line
swap into an in-place inert placeholder.

---

## Do not

- Reintroduce a build step, Astro or npm. Tried and removed (D-020, D-021).
- Mix Europe and Brazil framing (D-018).
- Translate the EU material into pt-br. Its deep content must be authored Brazil-native.
- Use WhatsApp green `#25D366`.
- Nest the accordion inside a case page.
- Position the site toward advertising defense or weapons capability. This was raised by the
  operator, considered, and declined for commercial reasons recorded in spec §10 — so that it is
  not reopened later as an oversight.
