// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://oopuo.com',
  vite: {
    plugins: [tailwindcss()]
  },
  // Launch locales (D-019): en (Europe/enterprise default), nl, fr (Europe),
  // pt-br (Brazil/SMB track). en-us/rs/zh deferred post-launch.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'fr', 'pt-br'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
