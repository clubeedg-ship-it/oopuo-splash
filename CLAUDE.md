# OOPUO Splash — Claude Code Identity

## 1. What This Is
Marketing website for OOPUO (AI systems consultancy). Astro + Tailwind, light-primary theme with dark accent sections. 5 pages + blog.

## 2. Session Start
- Read `design/00-milestone/HANDOFF.md` for current scope.
- Run `npm run build` to confirm clean state.
- Check `gh issue list --state open` for active work.

## 3. Stack
Astro 5 · Tailwind 4 · TypeScript strict · MDX content collections · Astro built-in i18n (7 locales, EN only populated).

## 4. Design Source of Truth
All design intent lives in `design/`. If code disagrees with a design doc, fix the code — never edit the doc without operator approval.

## 5. Vocabulary (use these class/token names consistently)
- `bg-primary` / `bg-elevated` / `bg-surface` — light context surfaces
- `bg-dark` / `bg-dark-elevated` / `bg-dark-surface` — dark context surfaces
- `data-theme="dark"` — applied to dark sections (hero, enterprise teaser, final CTA, footer)
- `accent-primary` (#1E7A6E) — teal on light
- `accent-on-dark` (#2D8A7E) — teal on dark
- `highlight-warm` (#C4814A) — warm CTA, max 1x per page, final CTA only
- `font-display` — Instrument Sans (headings)
- `font-body` — Satoshi (body text)
- `font-mono` — JetBrains Mono (code, labels)
- `shadow-card` / `shadow-card-hover` — card elevation on light
- `accent-glow` / `accent-glow-lg` — glow effects on dark

## 6. Key Rules (verbatim from HANDOFF.md — do not alter)
1. No Inter/Roboto/Arial — Instrument Sans + Satoshi + JetBrains Mono
2. Light primary, dark accents — not a dark-mode site
3. Card shadows on light, glow borders on dark
4. Warm highlight max 1x/page — final CTA only
5. Respect prefers-reduced-motion
6. Max text width 720px for body content
7. Mobile-first
8. All strings in locale files, not hardcoded
9. Logo switches based on section context

## 7. Invariants
- Never ship Inter, Roboto, or Arial.
- `[data-theme="dark"]` sections: hero, enterprise teaser, final CTA, footer.
- Nav is always light (bg-elevated, white).
- Footer is always dark.
- Warm highlight (#C4814A) appears at most once per page.
- All animations honor `prefers-reduced-motion: reduce`.
- Body text max-width: 720px.
- Strings live in locale JSON files, never hardcoded in components.

## 8. Session Snapshot

**Active work: v2 lobby prototype** (separate from the v1 Astro site in `src/pages/`).

- **Live prototype:** `public/lobby.html` (served at `http://localhost:4321/lobby.html`)
- **Canonical state doc:** `design/08-v2-lobby/STATE.md` ← **READ THIS FIRST every session**
- **DECISIONS.md** has D-002+ covering v2 architecture choices

The v2 lobby is a single-file HTML prototype with Three.js + AsciiEffect + bloom pipeline, six rooms with animated cyan/warm sculpture, hash-based routing, editorial blog. The v1 invariants in §6–7 above describe the v1 Astro site — **the v2 lobby intentionally departs from several** (dark-first hero, full-viewport animation, no card shadows on the lobby). Do not enforce v1 invariants on v2 work without checking STATE.md.

**Top priorities for next session:**
1. Morph abort bug (sculpture shows wrong shape during fast scrolling — architectural fix)
2. Blog post reading view (currently stub)
3. v1/v2 production merge decision

Last session: 2026-05-17 — finished alien-pulse color system (cyan/warm families with 4s palette transitions, narrow hue band, dancing gradient center), URL hash routing for state persistence, asymmetric room slide, bigger logo lockup. All documented in STATE.md.
