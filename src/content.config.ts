import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        lessonId: z.string().regex(/^[A-Z]+\d+$/, 'lessonId looks like B01').optional(),
        track: z.enum(['core', 'practice', 'lab', 'project', 'troubleshooting', 'reference']),
        requires: z.array(z.string()).default([]),
        lastVerified: z.coerce.date(),
        status: z.enum(['draft', 'review', 'published']),
      }),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
