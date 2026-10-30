import type { APIRoute } from 'astro';
import { LANGS, findCounterpart, getAllPosts, getPosts } from '../i18n';
import { AUTHOR, llmsIntro, postMarkdown } from '../seo';
import { rawContent as aboutZh } from '../about/zh.md';

// Everything in one file, for agents that would rather fetch once than crawl: the about page, then every post.
export const GET: APIRoute = async () => {
  const all = await getAllPosts();
  const posts = (await Promise.all(LANGS.map((lang) => getPosts(lang)))).flat();
  const parts = [
    llmsIntro(),
    `# About ${AUTHOR.name}\n\n${aboutZh().trim()}`,
    ...posts.map((post) => postMarkdown(post, findCounterpart(post, all)).trim()),
  ];
  return new Response(parts.join('\n\n---\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
