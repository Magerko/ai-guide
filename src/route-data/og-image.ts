import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { OG_ALT, OG_HEIGHT, OG_WIDTH } from '../site-config';

// Starlight already sets twitter:card=summary_large_image, so I only add the image itself.
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const lang = route.locale === 'uk' ? 'uk' : 'ru';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const url = new URL(`${base}/og/${lang}.png`, context.site ?? 'http://localhost:4321').href;
  route.head.push(
    { tag: 'meta', attrs: { property: 'og:image', content: url } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: String(OG_WIDTH) } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: String(OG_HEIGHT) } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: OG_ALT[lang] } },
  );
});
