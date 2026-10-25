// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://rami0291.com',
  // GitHub Pages serves /notes/ as a directory index; keep every internal link in that form.
  trailingSlash: 'always',
});
