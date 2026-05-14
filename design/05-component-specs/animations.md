# OOPUO — Animation Specs

## Easing Functions
| Name | Value | Use |
|---|---|---|
| ease-out-expo | cubic-bezier(0.16, 1, 0.3, 1) | Entrances, fade-ups |
| ease-in-out-smooth | cubic-bezier(0.65, 0, 0.35, 1) | Hover, color shifts |
| ease-out-quad | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Subtle movements |

## Duration Scale
| Token | Value | Use |
|---|---|---|
| fast | 150ms | Hover, color, focus |
| normal | 300ms | Card lifts, nav |
| slow | 600ms | Section entrances |
| counter | 800ms | Stat counters |

## Fade Up (primary entrance)
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
600ms ease-out-expo. Intersection Observer threshold 0.1. Fires once.

## Stagger: +100ms per item, max 400ms (5 items)

## Hero Sequence (page load):
0ms headline | 150ms subheadline | 300ms CTAs

## Card Hover
transform translateY(-2px), border-accent, shadow-accent-glow. 300ms ease-out-expo.

## Button Hover
translateY(-1px) on hover, translateY(0) on active. 150ms.

## Counter Animation
Intersection Observer 0.3, count 0→target, 800ms ease-out-expo, requestAnimationFrame.

## Page Transitions (optional)
Out: fade 200ms | In: fade + content fade-up 400ms

## prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Implementation: Framer Motion (motion.div whileInView viewport once) or CSS + Intersection Observer.
Only animate transform + opacity. Never height/width/margin.
