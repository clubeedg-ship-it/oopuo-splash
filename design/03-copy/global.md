# OOPUO — Global Copy

## Navigation

| Item | Label | Link |
|---|---|---|
| Logo | [network ring] + OOPUO (wordmark) | / |
| Nav 1 | Enterprise | /enterprise |
| Nav 2 | About | /about |
| Nav 3 | Blog | /blog |
| CTA | Book a Call | /contact |

Mobile menu: same items, slide-in from right, full-height overlay on `bg-elevated`.

## Footer

```
[logo mark] OOPUO

AI automation and EU AI Act compliance
for European businesses.

Navigation:
Home · Enterprise · About · Blog · Contact

Direct:
hello@oopuo.com
WhatsApp: +31 XX XXX XXXX
LinkedIn: [icon]

© 2025 OOPUO. All rights reserved.
Amsterdam, Netherlands.
```

## Meta / SEO

### Homepage
- **Title**: OOPUO — AI Automation & Digital Systems for Growing Businesses
- **Description**: We build AI-powered websites, automation, and customer support that save growing European businesses time and money. Engineering-first, no slide decks.
- **OG Title**: OOPUO — We Build Your AI Systems. You Focus on Growing.
- **OG Description**: AI automation, modern websites, and intelligent support for European businesses. Built to save you hours every week.

### Enterprise Page
- **Title**: EU AI Act Compliance & AI Governance — OOPUO
- **Description**: Compliance audits, risk assessments, agent observability, and technical documentation. Avoid fines up to €35M with proper AI governance.

### About
- **Title**: About OOPUO — Engineering-First AI Consultancy
- **Description**: Founded by Otavio Alves. Deep technical knowledge in AI systems, local and cloud infrastructure, and practical delivery for European businesses.

### Contact
- **Title**: Get in Touch — OOPUO
- **Description**: Book a free 30-minute consultation about AI automation or EU AI Act compliance. No sales pitch, just clarity.

### Blog
- **Title**: OOPUO Blog — AI Automation & Compliance Insights
- **Description**: Practical guides on AI automation, EU AI Act compliance, and building reliable AI systems for European businesses.

## i18n Note (v2+)

Architecture should support future translations:
- PT-BR (Portuguese, Brazil)
- EN-US (English, US — minor copy adjustments from EN-EU)
- NL (Dutch)
- FR (French)
- RS (Serbian)
- ZH (Mandarin Chinese)

v1 ships English only. Routing structure: `/en/`, `/pt-br/`, `/nl/` etc.
Copy lives in locale JSON/MD files, not hardcoded in components.
