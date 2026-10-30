import type { APIRoute } from 'astro';
import {
  DEFAULT_LANG,
  HTML_LANG,
  LANGS,
  SECTIONS,
  SERIES,
  findCounterpart,
  getAllPosts,
  localePath,
  postLang,
  postModified,
  postUrl,
  type Lang,
  type Post,
} from '../i18n';
import { absoluteUrl, xml } from '../seo';

// One page in each language it exists in. Every URL in a group lists the whole group as hreflang alternates.
type Group = Partial<Record<Lang, { path: string; lastmod?: Date }>>;

const newest = (posts: Post[]) =>
  posts.length > 0 ? new Date(Math.max(...posts.map((p) => postModified(p).valueOf()))) : undefined;

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const groups: Group[] = [];

  // A listing page changes whenever a post it lists does, so its lastmod is that post's.
  const listing = (path: string, lists: (p: Post) => boolean, keepEmpty = true) => {
    const group: Group = {};
    for (const lang of LANGS) {
      const listed = posts.filter((p) => postLang(p) === lang && lists(p));
      if (keepEmpty || listed.length > 0) group[lang] = { path: localePath(lang, path), lastmod: newest(listed) };
    }
    if (Object.keys(group).length > 0) groups.push(group);
  };
  listing('/', () => true);
  for (const section of SECTIONS) listing(`/${section}/`, (p) => p.data.category === section);
  // Empty series pages are noindex, so they stay out of the sitemap as well.
  for (const series of Object.keys(SERIES)) listing(`/series/${series}/`, (p) => p.data.series === series, false);

  const grouped = new Set<string>();
  for (const post of posts) {
    if (grouped.has(post.id)) continue;
    const group: Group = {};
    for (const version of [post, findCounterpart(post, posts)]) {
      if (!version) continue;
      grouped.add(version.id);
      group[postLang(version)] = { path: postUrl(version), lastmod: postModified(version) };
    }
    groups.push(group);
  }

  const urls = groups.flatMap((group) => {
    const versions = Object.entries(group) as [Lang, { path: string; lastmod?: Date }][];
    const alternates = versions.length > 1 ? versions.map(([lang, { path }]) => [HTML_LANG[lang], path]) : [];
    if (alternates.length > 0 && group[DEFAULT_LANG]) alternates.push(['x-default', group[DEFAULT_LANG].path]);
    return versions.map(([, { path, lastmod }]) =>
      [
        '  <url>',
        `    <loc>${xml(absoluteUrl(path))}</loc>`,
        lastmod && `    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`,
        ...alternates.map(
          ([hreflang, href]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${xml(absoluteUrl(href))}"/>`,
        ),
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    );
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
