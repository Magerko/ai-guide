import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { GOATCOUNTER_CODE, REPO_URL } from './src/site-config.ts';

const site = process.env.SITE_URL || 'http://localhost:4321';
const rawBase = process.env.BASE_PATH || '/';
// Normalise to "/" or "/name" so both "name" and "/name/" work in CI variables.
const base = rawBase === '/' ? '/' : '/' + rawBase.replace(/^\/+|\/+$/g, '');

const group = (label, uk, directory) => ({
  label,
  translations: { uk },
  items: [{ autogenerate: { directory } }],
});

export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: {
        ru: 'MagerDev AI Guide',
        uk: 'MagerDev AI Guide',
      },
      defaultLocale: 'ru',
      locales: {
        ru: { label: 'Русский', lang: 'ru' },
        uk: { label: 'Українська', lang: 'uk' },
      },
      editLink: { baseUrl: `${REPO_URL}/edit/main/` },
      social: [{ icon: 'github', label: 'GitHub', href: REPO_URL }],
      head: GOATCOUNTER_CODE
        ? [
            {
              tag: 'script',
              // I skip framed loads so the blurred preview on the language page is not counted as a visit.
              content:
                `if (window.top === window.self) {` +
                `var s = document.createElement('script');` +
                `s.async = true; s.src = 'https://gc.zgo.at/count.js';` +
                `s.dataset.goatcounter = 'https://${GOATCOUNTER_CODE}.goatcounter.com/count';` +
                `document.head.appendChild(s); }`,
            },
          ]
        : [],
      components: {
        PageTitle: './src/components/overrides/PageTitle.astro',
        Sidebar: './src/components/overrides/Sidebar.astro',
      },
      sidebar: [
        group('С чего начать', 'З чого почати', 'start'),
        group('AI для каждого', 'ШІ для кожного', 'basics'),
        group('Agent Labs', 'Agent Labs', 'labs'),
        group('Справочник', 'Довідник', 'reference'),
      ],
      plugins: [
        starlightLinksValidator({
          errorOnInconsistentLocale: true,
        }),
      ],
    }),
  ],
});
