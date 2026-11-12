import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts live in src/content/posts/<lang>/<slug>.md.
// The same <slug> under zh/, en/ and ja/ is treated as one article in several languages.
const posts = defineCollection({
  loader: glob({ pattern: '{zh,en,ja}/**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(['notes', 'analysis']),
    // Groups posts into a series page, e.g. the Agent course.
    series: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Analysis posts go stale; the page warns readers once this date is old.
    lastVerified: z.coerce.date().optional(),
    // Marks the machine-translated versions. scripts/translate.mjs only ever overwrites files
    // with this set, so set it to false after editing a translation by hand to keep your edits.
    machineTranslated: z.boolean().default(false),
    // Hash of the Chinese original this translation was made from; a mismatch means it is out of date.
    sourceHash: z.string().optional(),
    // Pinned on the home page as portfolio pieces.
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
