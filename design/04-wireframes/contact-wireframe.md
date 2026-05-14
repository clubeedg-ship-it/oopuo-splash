# Note: Section contexts for v3 (light primary)
# Header: LIGHT | Tabs: LIGHT | Direct contact: LIGHT | Footer: DARK

# Contact — Wireframe (Triple Path)

## HEADER (LIGHT)
mono: Get in touch
Let's figure out what you need. ← H1
30 minutes. No sales pitch. ← body-lg

## CONTACT PATHS (tabbed interface, LIGHT)

Container: bg-elevated, border-subtle, radius-lg
Tabs: [✉ Send a Message] [📅 Book a Call] [💬 WhatsApp]
Active: text-primary + accent-primary underline 2px
Inactive: text-secondary, hover text-primary
Transition: content fade 200ms, underline slide 300ms

### Tab A: Send a Message (HubSpot) — DEFAULT
Fields: Name (req) | Email (req) | Company (opt) | Interest dropdown (opt) | Message textarea (opt)
Inputs: bg-surface, border-subtle, focus border-accent
Submit: Send Message, full width, accent-primary
Success: "Message received" + WhatsApp fallback note

### Tab B: Book a Call (Calendly)
Pick a time that works. 30 minutes, no commitment.
Calendly inline embed, 650px height
Custom colors matching theme. Loading skeleton.

### Tab C: WhatsApp (wizard)
Fields: Name | Interest dropdown | One-sentence brief
Live message preview: bg-surface, font-mono, caption, border-subtle
Updates as user types
Button: Open WhatsApp → (accent-primary)
Opens wa.me/{number}?text={encoded} in new tab
Pure client-side, no backend

## BELOW TABS
Or reach me directly: hello@oopuo.com · WhatsApp · LinkedIn
text-muted, links in accent-primary

## MOBILE
Tabs → segmented control or accordion
Calendly needs full-width scroll container
