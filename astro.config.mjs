// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://rami0291.com',
  // GitHub Pages serves /notes/ as a directory index; keep every internal link in that form.
  trailingSlash: 'always',
  markdown: {
    // Mermaid blocks stay as plain <pre><code class="language-mermaid"> for the post page script to draw.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid', 'math'] },
  },
});
