# OOPUO — Navigation Spec (v3: Light Nav)

## Nav Items
Logo: network ring (~28px) + OOPUO wordmark (font-display, 700, 20px)
Links: Enterprise · About · Blog
CTA: Book a Call → /contact

## Logo Context Switching
- Light nav: oopuo-logo-original.svg (black)
- Dark sections: oopuo-logo-light.svg (off-white #EAEDF3)
- Height: 28px desktop, 24px mobile

## Scroll States
1. Top (<50px): bg-elevated white, no border
2. Scrolled: bg-elevated + backdrop-blur(12px) 95% opacity, border-subtle fade in 300ms
3. Stay white over dark hero (simpler)

## Colors (light)
Wordmark: text-primary | Links: text-secondary, hover text-primary | Active: accent-primary underline 2px
CTA: accent-primary bg, white text

## Mobile (<768px)
Hamburger → slide-in panel from right (300ms ease-out-expo)
Panel: full height, bg-elevated, space-xl padding
Overlay: bg-primary 40% opacity. Body scroll locked.
Items: stacked, font-body 500 18px. Active: accent-primary left border 3px.
CTA at bottom: full-width accent-primary bg.

## Blog Breadcrumbs
Blog / [Category] / [Post Title]
font-body 400 caption text-muted. Links: accent-primary.
