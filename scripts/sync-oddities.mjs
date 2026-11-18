// Copies the static oddity sites that live in sibling folders into public/, so they ship at
// rami0291.com/<slug>/ with the blog. Run after changing one of them, then commit public/<slug>/.
//   node scripts/sync-oddities.mjs
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dev = resolve(root, '..');

// slug → source folder and the files in it that make up the site (no READMEs or dev tools).
const SITES = {
  bowerbird: { from: join(dev, 'bowerbird-site'), files: ['index.html', 'style.css', 'main.js', 'assets'] },
  // Built output: run `node build.mjs` in solar-terminal-site first.
  'solar-terminal': { from: join(dev, 'solar-terminal-site', 'site'), files: ['.'] },
};

for (const [slug, { from, files }] of Object.entries(SITES)) {
  if (!existsSync(join(from, 'index.html'))) throw new Error(`${slug}: no index.html in ${from}`);
  const to = join(root, 'public', slug);
  rmSync(to, { recursive: true, force: true });
  for (const file of files) cpSync(join(from, file), join(to, file === '.' ? '' : file), { recursive: true });
  console.log(`${slug}: ${from} → public/${slug}/`);
}
