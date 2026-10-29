import type { APIRoute } from 'astro';
import { HTML_LANG, getPosts, localeParams, localePath, postModified, postUrl, ui, type Lang } from '../../i18n';
import { AUTHOR, absoluteUrl, xml } from '../../seo';

export const getStaticPaths = localeParams;

// Each item carries the full article, so feed readers and AI ingestion pipelines never need to scrape the page.
export const GET: APIRoute = async ({ props }) => {
  const { lang } = props as { lang: Lang };
  const t = ui[lang];
  const posts = await getPosts(lang);

  const items = posts.map((post) => {
    const url = xml(absoluteUrl(postUrl(post)));
    const html = (post.rendered?.html ?? '').replaceAll(']]>', ']]]]><![CDATA[>');
    return [
      '    <item>',
      `      <title>${xml(post.data.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
      `      <dc:creator>${xml(AUTHOR.name)}</dc:creator>`,
      ...[t.nav[post.data.category], ...post.data.tags].map((c) => `      <category>${xml(c)}</category>`),
      `      <description>${xml(post.data.description)}</description>`,
      `      <content:encoded><![CDATA[${html}]]></content:encoded>`,
      '    </item>',
    ].join('\n');
  });

  const lastBuild = posts.length > 0 ? `    <lastBuildDate>${postModified(posts[0]).toUTCString()}</lastBuildDate>` : '';
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${xml(t.siteName)}</title>`,
    `    <link>${xml(absoluteUrl(localePath(lang, '/')))}</link>`,
    `    <description>${xml(t.tagline)}</description>`,
    `    <language>${HTML_LANG[lang]}</language>`,
    `    <atom:link href="${xml(absoluteUrl(localePath(lang, '/rss.xml')))}" rel="self" type="application/rss+xml"/>`,
    lastBuild,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter(Boolean)
    .join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
