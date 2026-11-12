import type { APIRoute } from 'astro';
import { DEFAULT_LANG, findTranslations, getAllPosts, getPosts } from '../i18n';
import { AUTHOR, llmsIntro, postMarkdown } from '../seo';
import { rawContent as aboutZh } from '../about/zh.md';

// Everything in one file, for agents that would rather fetch once than crawl: the about page, then every
// Chinese original. The machine translations add nothing new, so llms.txt links them instead.
export const GET: APIRoute = async () => {
  const all = await getAllPosts();
  const posts = await getPosts(DEFAULT_LANG);
  const parts = [
    llmsIntro(),
    `# About ${AUTHOR.name}\n\n${aboutZh().trim()}`,
    ...posts.map((post) => postMarkdown(post, findTranslations(post, all)).trim()),
  ];
  return new Response(parts.join('\n\n---\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
