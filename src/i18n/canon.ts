// Canon (sculpture-site) strings. Kept separate from the legacy *.json so the
// conventional pages keep working untouched. Two tracks (D-018):
//   en / nl / fr  → Europe (enterprise framing)
//   pt-br         → Brazil SMB (WhatsApp-first, partnership) — NOT a translation.
// nl / fr / pt-br copy drafted by Claude — flag for native review before launch.

export const LOCALES = ['en', 'nl', 'fr', 'pt-br'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  nl: 'NL',
  fr: 'FR',
  'pt-br': 'PT',
};

// Section titles shown in the HUD (one per room 1–6).
const NAV: Record<Locale, string[]> = {
  en: ['Arrival', 'The Gap', 'Modules', 'Studio', 'Blog', 'Invitation'],
  nl: ['Aankomst', 'De Kloof', 'Modules', 'Studio', 'Blog', 'Uitnodiging'],
  fr: ['Arrivée', 'Le Fossé', 'Modules', 'Studio', 'Blog', 'Invitation'],
  'pt-br': ['Início', 'A Lacuna', 'Soluções', 'Estúdio', 'Blog', 'Convite'],
};

type HomeStrings = {
  eyebrow: string;
  h1: string;
  lead: string;
  cta1: string;
  cta2: string;
};

const HOME: Record<Locale, HomeStrings> = {
  en: {
    eyebrow: 'An engineering studio · Amsterdam',
    h1: 'We build your AI systems. You focus on growing.',
    lead: 'AI-powered websites, automation, and customer support for European businesses that want to move faster — without hiring a tech department.',
    cta1: 'See what we build',
    cta2: 'Book a free call',
  },
  nl: {
    eyebrow: 'Een engineering studio · Amsterdam',
    h1: 'Wij bouwen je AI-systemen. Jij focust op groei.',
    lead: 'AI-gedreven websites, automatisering en klantenservice voor Europese bedrijven die sneller willen — zonder een eigen tech-afdeling.',
    cta1: 'Bekijk wat we bouwen',
    cta2: 'Plan een gesprek',
  },
  fr: {
    eyebrow: "Un studio d'ingénierie · Amsterdam",
    h1: "Nous construisons vos systèmes d'IA. Vous vous concentrez sur la croissance.",
    lead: "Sites web, automatisation et support client propulsés par l'IA pour les entreprises européennes qui veulent avancer plus vite — sans recruter d'équipe technique.",
    cta1: 'Voir ce que nous construisons',
    cta2: 'Réserver un appel',
  },
  'pt-br': {
    eyebrow: 'Tecnologia sob medida · Goiás',
    h1: 'Cuidamos da tecnologia do seu negócio. Você foca em crescer.',
    lead: 'Atendimento automatizado no WhatsApp e automação do trabalho repetitivo — para a sua empresa vender mais e gastar menos, sem precisar contratar mais gente.',
    cta1: 'Falar no WhatsApp',
    cta2: 'Como funciona',
  },
};

export const canon = { NAV, HOME };

export function nav(locale: Locale = 'en'): string[] {
  return NAV[locale] ?? NAV.en;
}
export function home(locale: Locale = 'en'): HomeStrings {
  return HOME[locale] ?? HOME.en;
}

/** Localize a root-relative path for a locale. Default (en) stays unprefixed. */
export function localePath(path: string, locale: Locale = 'en'): string {
  if (locale === 'en') return path;
  if (path === '/') return `/${locale}/`;
  return `/${locale}${path}`;
}

/** Detect the active locale from a URL pathname. */
export function localeFromPath(pathname: string): Locale {
  const m = pathname.match(/^\/(nl|fr|pt-br)(\/|$)/);
  return (m?.[1] as Locale) ?? 'en';
}
