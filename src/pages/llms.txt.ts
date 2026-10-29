import type { APIRoute } from 'astro';
import { CATEGORIES, LANGS, getPosts, localePath } from '../i18n';
import { absoluteUrl, llmsIntro, postIndexLine } from '../seo';
import { TOOLS } from '../tools';

// The index for language models described at https://llmstxt.org: what the site is, then every article.
const CATEGORY_NAMES = { notes: '实战笔记 · Field notes', analysis: '行业分析 · Industry analysis' };

export const GET: APIRoute = async () => {
  const zh = await getPosts('zh');
  const ja = await getPosts('ja');

  const sections = [
    `${llmsIntro()}\n- Every article in full, in one file: ${absoluteUrl('/llms-full.txt')}`,
    ...CATEGORIES.map((category) =>
      [`## ${CATEGORY_NAMES[category]}`, '', ...zh.filter((p) => p.data.category === category).map(postIndexLine)].join(
        '\n',
      ),
    ),
    ['## 日本語 · Japanese (machine translated)', '', ...ja.map(postIndexLine)].join('\n'),
    [
      '## Tools',
      '',
      ...TOOLS.filter((tool) => tool.ready).map(
        (tool) => `- [${tool.name.zh} · ${tool.name.ja}](${absoluteUrl(tool.href)}): ${tool.desc.zh}`,
      ),
    ].join('\n'),
    [
      '## Optional',
      '',
      `- [About the author](${absoluteUrl('/about/')}): background and what the author offers`,
      ...LANGS.map((lang) => `- [RSS feed (${lang})](${absoluteUrl(localePath(lang, '/rss.xml'))}): full-text feed`),
      `- [Sitemap](${absoluteUrl('/sitemap.xml')}): every page with its translations`,
    ].join('\n'),
  ];
  return new Response(sections.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
