// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/markdown/katex.mjs';
import { headingAnchorsPlugin } from './src/markdown/heading-anchors.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://rami0291.com',
  // GitHub Pages serves /notes/ as a directory index; keep every internal link in that form.
  trailingSlash: 'always',
  markdown: {
    // Code follows the reader's light/dark setting (see .astro-code in global.css).
    // Mermaid is left as plain code and drawn in the browser by src/scripts/mermaid.ts.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false },
    processor: satteri({
      // $…$ is inline math, so a literal dollar sign in prose must be written \$ (e.g. \$132 Billion).
      features: { math: true },
      mdastPlugins: [katexPlugin],
      hastPlugins: [headingAnchorsPlugin],
    }),
  },
});
