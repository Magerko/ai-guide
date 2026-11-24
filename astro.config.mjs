import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { REPO_URL } from './src/site-config.ts';

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
      components: {
        PageTitle: './src/components/overrides/PageTitle.astro',
      },
      sidebar: [
        group('С чего начать', 'З чого почати', 'start'),
        group('AI для каждого', 'AI для кожного', 'basics'),
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
