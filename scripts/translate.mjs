#!/usr/bin/env node
// Fills in the English and Japanese versions of every Chinese post (and the about page) with
// machine translations from Claude Haiku, through the local `claude` CLI and your own login.
//
//   npm run translate                     translate what is missing or out of date
//   npm run translate -- --dry-run        only list what would change
//   npm run translate -- --only <slug>    just one post (the file name without .md; "about" for the about page)
//   npm run translate -- --lang en        just one target language
//   npm run translate -- --force          retranslate even the translations that are up to date
//
// A translation is out of date when the hash of its original's title, description and body no
// longer matches its `sourceHash`. Other frontmatter (dates, category, flags) is copied from the
// original on every run without retranslating. Files with `machineTranslated: false` are never
// touched, so after fixing a translation by hand, set that flag and your edits are kept.
// The about page keeps the same information in its first line, an HTML comment; delete that
// line to keep hand edits there.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = join(ROOT, 'src/content/posts');
const ABOUT = join(ROOT, 'src/about');
const GLOSSARY = join(ROOT, 'scripts/translate-glossary.md');
const SOURCE = 'zh';
const TARGETS = { en: 'English', ja: 'Japanese' };
const MODEL = 'haiku';
const CONCURRENCY = 6;
// Long posts are sent in pieces cut at "## " headings, so no single reply gets near the output limit.
const CHUNK_CHARS = 6000;
const RETRIES = 2;

// ---------- arguments ----------

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const option = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const DRY = flag('dry-run');
const FORCE = flag('force');
const ONLY = option('only');
const LANG = option('lang');
if (LANG && !TARGETS[LANG]) die(`--lang must be one of: ${Object.keys(TARGETS).join(', ')}`);

function die(message) {
  console.error(message);
  process.exit(1);
}

// ---------- frontmatter ----------

/** Splits a Markdown file into ordered frontmatter entries (raw text per key) and the body. */
function parse(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { entries: [], body: text };
  const entries = [];
  for (const line of m[1].split(/\r?\n/)) {
    const key = line.match(/^([A-Za-z][\w-]*):/);
    if (key) entries.push({ key: key[1], raw: line });
    else if (entries.length > 0) entries[entries.length - 1].raw += '\n' + line;
  }
  return { entries, body: text.slice(m[0].length) };
}

/** The value of a one-line scalar entry, unquoted. */
function scalar(entries, key) {
  const entry = entries.find((e) => e.key === key);
  if (!entry) return undefined;
  const value = entry.raw.slice(key.length + 1).trim();
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("'")) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

function hash(...parts) {
  return createHash('sha256').update(parts.join('\u0000')).digest('hex').slice(0, 12);
}

/** The translation's frontmatter: the original's entries in order, with the translated title and description. */
function frontmatter(sourceEntries, title, description, sourceHash) {
  const lines = [];
  for (const entry of sourceEntries) {
    if (entry.key === 'title') lines.push(`title: ${JSON.stringify(title)}`);
    else if (entry.key === 'description') lines.push(`description: ${JSON.stringify(description)}`);
    else if (entry.key !== 'machineTranslated' && entry.key !== 'sourceHash') lines.push(entry.raw);
  }
  lines.push('machineTranslated: true', `sourceHash: ${sourceHash}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

// ---------- Markdown chunks ----------

/** Cuts the body at "## " headings outside code fences, packing sections into chunks of about CHUNK_CHARS. */
function chunks(body) {
  const sections = [];
  let current = [];
  let fence = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^## /.test(line) && current.length > 0) {
      sections.push(current.join('\n'));
      current = [];
    }
    current.push(line);
  }
  sections.push(current.join('\n'));

  const out = [];
  for (const section of sections) {
    const last = out[out.length - 1];
    if (last !== undefined && last.length + section.length + 1 <= CHUNK_CHARS) out[out.length - 1] = last + '\n' + section;
    else out.push(section);
  }
  return out;
}

/** Code blocks other than mermaid go out as placeholders, so the model cannot change them. */
function protect(text) {
  const blocks = [];
  const masked = text.replace(/^([ \t]*)(```|~~~)([^\n]*)\n[\s\S]*?\n\1\2[ \t]*$/gm, (block, _indent, _fence, info) => {
    if (info.trim().startsWith('mermaid')) return block;
    blocks.push(block);
    return `⟦CODE ${blocks.length - 1}⟧`;
  });
  return { masked, restore: (s) => s.replace(/⟦CODE (\d+)⟧/g, (_, i) => blocks[Number(i)]) };
}

/** Structure that must survive translation unchanged; a mismatch means the model dropped or mangled something. */
function shape(text) {
  const lines = text.split('\n');
  const count = (re) => (text.match(re) ?? []).length;
  return {
    placeholders: count(/⟦CODE \d+⟧/g),
    fences: lines.filter((l) => /^\s*(```|~~~)/.test(l)).length,
    // Only the number: a heading whose level the model changed is put back by fixHeadings.
    headings: lines.filter((l) => /^#{1,6} /.test(l)).length,
    tableRows: lines.filter((l) => /^\s*\|/.test(l)).length,
    links: count(/\]\(/g),
    images: count(/!\[/g),
    // A bare $ opens a math formula on this site; currency must come out as \$, which is not counted.
    mathDollars: count(/(?<!\\)\$/g),
  };
}

function compare(a, b) {
  return Object.keys(a)
    .filter((k) => a[k] !== b[k])
    .map((k) => `${k} ${a[k]} -> ${b[k]}`);
}

// ---------- the model ----------

const glossary = existsSync(GLOSSARY) ? readFileSync(GLOSSARY, 'utf8').trim() : '';

function systemPrompt(lang) {
  const style =
    lang === 'ja'
      ? '- Japanese: write in the plain だ・である style throughout, as in the existing translations. Use full-width Japanese punctuation, but keep a half-width space between Japanese and Latin words or numbers, as the original does.'
      : '- English: American spelling. Write as a native technical writer would, not word for word.';
  return `You translate a Chinese technical blog into ${TARGETS[lang]}. The author, Rami0291, is a Forward Deployed Engineer living in Japan who writes field notes and industry analysis about putting AI agents to work inside companies. Readers are engineers, hiring managers and business leaders.

Rules:
- Reply with the translation only: no preface, no notes, and do not wrap it in a code block.
- Translate everything a reader sees: prose, headings, list items, table cells, blockquotes, link text, image alt text, and the labels inside mermaid diagrams.
- Keep exactly as they are: the Markdown structure, line breaks and blank lines, URLs, HTML tags and attributes, inline code, math between $ or $$, placeholders such as ⟦CODE 3⟧, and mermaid syntax and node IDs. Keep every heading at its level: ## stays ##.
- On this site a bare $ starts a math formula. An escaped dollar sign \\$ stays escaped, and any dollar sign you add for money (for example 美元 → US dollars) must be written \\$, as in \\$50 million.
- Keep the English terms the author leaves in English (Agent, Skill, Prompt, Vibe Coding, FDE, product and company names).
- Keep the author's voice: direct, opinionated, sometimes sarcastic. Do not soften, summarize, explain or add anything.
${style}${glossary ? `\n\nGlossary (use these renderings):\n${glossary}` : ''}`;
}

function claude(system, input) {
  return new Promise((resolve, reject) => {
    const args = ['-p', '--model', MODEL, '--tools', '', '--strict-mcp-config', '--no-session-persistence', '--system-prompt', system];
    // Run outside the repository so no project instructions are loaded into the translator.
    const child = spawn('claude', args, { cwd: tmpdir(), stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    let out = '';
    let err = '';
    child.stdout.setEncoding('utf8').on('data', (d) => (out += d));
    child.stderr.setEncoding('utf8').on('data', (d) => (err += d));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve(out) : reject(new Error(`claude exited with ${code}: ${(err || out).trim().slice(0, 500)}`)),
    );
    child.stdin.end(input, 'utf8');
  });
}

/** Strips a code fence the model may have wrapped the whole reply in, and matches the input's edge whitespace. */
function clean(reply, input) {
  let s = reply.replace(/^\s*```(?:markdown|md)?\n([\s\S]*?)\n```\s*$/, '$1').trim();
  const lead = input.match(/^\s*/)[0];
  const trail = input.match(/\s*$/)[0];
  return lead + s + trail;
}

let running = 0;
const queue = [];
function limited(fn) {
  return new Promise((resolve, reject) => {
    const run = () => {
      running++;
      fn()
        .then(resolve, reject)
        .finally(() => {
          running--;
          queue.shift()?.();
        });
    };
    running < CONCURRENCY ? run() : queue.push(run);
  });
}

async function translateChunk(lang, title, chunk, index, total) {
  const { masked, restore } = protect(chunk);
  if (!masked.trim() || !/[㐀-鿿]/.test(masked)) return chunk;
  const want = shape(masked);
  const note = total > 1 ? `\n\nYou get part ${index + 1} of ${total} of the article "${title}"; translate just this part.` : '';
  let problems = [];
  let fallback;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const text = fixHeadings(masked, clean(await limited(() => claude(systemPrompt(lang) + note, masked)), masked));
    problems = compare(want, shape(text));
    if (problems.length > 0) continue;
    const laid = relayout(masked, text);
    if (laid) return restore(laid);
    fallback ??= text;
  }
  if (fallback) {
    console.warn(`! ${title} (${lang}) part ${index + 1}/${total}: lines were merged or split; kept the model's line breaks.`);
    return restore(fallback);
  }
  throw new Error(`part ${index + 1}/${total} keeps changing the Markdown structure (${problems.join(', ')})`);
}

/** Models like to promote the first heading to "#"; give every heading the original's level back. */
function fixHeadings(original, translated) {
  const levels = original
    .split('\n')
    .filter((l) => /^#{1,6} /.test(l))
    .map((l) => l.indexOf(' '));
  let i = 0;
  const out = translated.split('\n').map((l) => {
    if (!/^#{1,6} /.test(l)) return l;
    const level = levels[i++];
    return level ? '#'.repeat(level) + l.slice(l.indexOf(' ')) : l;
  });
  return i === levels.length ? out.join('\n') : translated;
}

/** Models like to add blank lines (after headings, between list items), which turns tight lists loose.
 *  When the translation has one line per non-blank original line, put it back on the original's exact layout. */
function relayout(original, translated) {
  const src = original.split('\n');
  const out = translated.split('\n').filter((l) => l.trim() !== '');
  if (src.filter((l) => l.trim() !== '').length !== out.length) return undefined;
  let i = 0;
  return src.map((l) => (l.trim() === '' ? l : out[i++])).join('\n');
}

async function translateMeta(lang, title, description) {
  const input = JSON.stringify({ title, description }, null, 2);
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const reply = await limited(() =>
      claude(
        systemPrompt(lang) +
          '\n\nThis time you get the title and description of one article as JSON. Reply with the same JSON object, values translated, and nothing else.',
        input,
      ),
    );
    try {
      const json = JSON.parse(reply.slice(reply.indexOf('{'), reply.lastIndexOf('}') + 1));
      if (typeof json.title === 'string' && typeof json.description === 'string') return json;
    } catch {}
  }
  throw new Error('could not get the title and description back as JSON');
}

async function translateBody(lang, title, body) {
  const parts = chunks(body);
  const done = await Promise.all(parts.map((part, i) => translateChunk(lang, title, part, i, parts.length)));
  return done.join('\n');
}

// ---------- jobs ----------

const ABOUT_MARK = /^<!-- machine translation of zh\.md, sourceHash: (\w+)\. Delete this line to keep hand edits\. -->\r?\n/;
const aboutMark = (h) => `<!-- machine translation of zh.md, sourceHash: ${h}. Delete this line to keep hand edits. -->\n`;

function postJobs() {
  const dir = join(POSTS, SOURCE);
  const jobs = [];
  for (const file of readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
    const slug = file.replace(/\.mdx?$/, '');
    if (ONLY && ONLY !== slug) continue;
    const text = readFileSync(join(dir, file), 'utf8').replace(/\r\n/g, '\n');
    const { entries, body } = parse(text);
    const title = scalar(entries, 'title');
    const description = scalar(entries, 'description');
    const sourceHash = hash(title, description, body);
    for (const lang of Object.keys(TARGETS)) {
      if (LANG && LANG !== lang) continue;
      jobs.push({ kind: 'post', name: `${lang}/${file}`, lang, path: join(POSTS, lang, file), entries, title, description, body, sourceHash });
    }
  }
  return jobs;
}

function aboutJobs() {
  if (ONLY && ONLY !== 'about') return [];
  const body = readFileSync(join(ABOUT, `${SOURCE}.md`), 'utf8').replace(/\r\n/g, '\n');
  const sourceHash = hash(body);
  return Object.keys(TARGETS)
    .filter((lang) => !LANG || LANG === lang)
    .map((lang) => ({ kind: 'about', name: `about/${lang}.md`, lang, path: join(ABOUT, `${lang}.md`), body, sourceHash }));
}

/** What to do with one job: skip, resync frontmatter only, or translate. */
function plan(job) {
  if (!existsSync(job.path)) return { action: 'translate', why: 'missing' };
  const current = readFileSync(job.path, 'utf8').replace(/\r\n/g, '\n');
  if (job.kind === 'about') {
    const mark = current.match(ABOUT_MARK);
    if (!mark) return { action: 'skip', why: 'hand-edited (no machine-translation line)' };
    if (mark[1] === job.sourceHash && !FORCE) return { action: 'skip', why: 'up to date' };
    return { action: 'translate', why: FORCE ? 'forced' : 'original changed' };
  }
  const { entries, body } = parse(current);
  if (scalar(entries, 'machineTranslated') !== 'true') return { action: 'skip', why: 'hand-edited (machineTranslated is not true)' };
  const had = scalar(entries, 'sourceHash');
  const title = scalar(entries, 'title');
  const description = scalar(entries, 'description');
  if (FORCE) return { action: 'translate', why: 'forced' };
  // A translation from before this script existed is taken as current and stamped, rather than redone.
  if (!had || had === job.sourceHash) {
    const next = frontmatter(job.entries, title, description, job.sourceHash) + body;
    if (next === current) return { action: 'skip', why: 'up to date' };
    return { action: 'resync', why: had ? 'frontmatter changed' : 'adopting existing translation', content: next };
  }
  return { action: 'translate', why: 'original changed' };
}

async function run(job) {
  if (job.kind === 'about') {
    const text = await translateBody(job.lang, 'About', job.body);
    return aboutMark(job.sourceHash) + text;
  }
  const [meta, body] = await Promise.all([
    translateMeta(job.lang, job.title, job.description),
    translateBody(job.lang, job.title, job.body),
  ]);
  return frontmatter(job.entries, meta.title, meta.description, job.sourceHash) + body;
}

// ---------- main ----------

const jobs = [...postJobs(), ...aboutJobs()];
if (ONLY && jobs.length === 0) die(`No original named ${ONLY} in src/content/posts/${SOURCE}/.`);

// Translations whose original is gone would otherwise linger as orphan pages.
for (const lang of Object.keys(TARGETS)) {
  const dir = join(POSTS, lang);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!existsSync(join(POSTS, SOURCE, file))) console.warn(`! ${lang}/${file} has no original in ${SOURCE}/; delete it if the post is gone.`);
  }
}

const planned = jobs.map((job) => ({ job, ...plan(job) }));
for (const { job, action, why } of planned) console.log(`${action.padEnd(9)} ${job.name}  (${why})`);
if (DRY) process.exit(0);

let failed = 0;
await Promise.all(
  planned.map(async ({ job, action, content }) => {
    if (action === 'skip') return;
    try {
      const next = action === 'resync' ? content : await run(job);
      mkdirSync(dirname(job.path), { recursive: true });
      writeFileSync(job.path, next);
      if (action === 'translate') console.log(`✓ ${job.name}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${job.name}: ${e.message}`);
    }
  }),
);
if (failed > 0) die(`${failed} translation(s) failed; nothing was written for them. Run again to retry.`);
console.log('Done. Read the diff before you commit.');
