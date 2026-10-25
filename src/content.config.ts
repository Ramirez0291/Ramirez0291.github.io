import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts live in src/content/posts/<lang>/<slug>.md.
// The same <slug> under zh/ and ja/ is treated as one article in two languages.
const posts = defineCollection({
  loader: glob({ pattern: '{zh,ja}/**/*.{md,mdx}', base: './src/content/posts' }),
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
    // Marks the Japanese machine-translated versions.
    machineTranslated: z.boolean().default(false),
    // Pinned on the home page as portfolio pieces.
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
