import { getCollection, type CollectionEntry } from 'astro:content';

export const LANGS = ['zh', 'ja'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'zh';

export const HTML_LANG: Record<Lang, string> = { zh: 'zh-CN', ja: 'ja' };
export const OG_LOCALE: Record<Lang, string> = { zh: 'zh_CN', ja: 'ja_JP' };

export const CATEGORIES = ['notes', 'analysis'] as const;
export type Category = (typeof CATEGORIES)[number];

// Top-level pages that exist in every language, in nav order.
export const SECTIONS = [...CATEGORIES, 'lab', 'about'] as const;

export const SERIES: Record<string, Record<Lang, string>> = {
  'agent-course': { zh: 'Agent 落地课程', ja: 'Agent 導入コース' },
};

export const ui = {
  zh: {
    siteName: 'Rami0291',
    tagline: 'Forward Deployed Engineer · 把 AI Agent 落到企业现场',
    whoami: ['生活在日本的赛博游民 · 开源软件作者 · 自封分析师', '日常干着 FDE 的脏活累活，坚信三年内 AGI 必将实现。'],
    navLabel: '主导航',
    nav: { notes: '实战笔记', analysis: '行业分析', lab: '工具', about: '关于' },
    navDesc: {
      notes: 'AI Agent 在企业现场真实落地的实战笔记：Skill 迭代、调研方法与踩过的坑。',
      analysis: '不贩卖焦虑的 AI 行业分析：看清 AI 的真实能力与边界。',
      lab: '可以直接上手的小工具，全部纯前端运行、不收集数据。',
      about: 'Rami0291：生活在日本的 Forward Deployed Engineer，提供 AI Agent 落地培训与咨询。',
    },
    langSwitch: '日本語',
    featured: '精选案例',
    latest: '最新文章',
    more: '更多',
    noPosts: '还没有文章。',
    machineTranslated: '本文为机器翻译。',
    readOriginal: '阅读中文原文',
    readTranslation: '日本語で読む',
    lastVerified: '信息最后核实于',
    staleWarning: '本文信息已超过半年未核实，行业变化很快，请谨慎参考。',
    updated: '更新于',
    series: '系列',
    footer: '[exit 0] © Rami0291 · static site on GitHub Pages',
  },
  ja: {
    siteName: 'Rami0291',
    tagline: 'Forward Deployed Engineer · AI Agent を企業の現場へ',
    whoami: ['日本在住のサイバー遊牧民 · OSS 作者 · 自称アナリスト', 'FDE の泥臭い仕事が日常。3 年以内に AGI は実現すると信じている。'],
    navLabel: 'メインナビゲーション',
    nav: { notes: '実践ノート', analysis: '業界分析', lab: 'ツール', about: 'About' },
    navDesc: {
      notes: 'AI Agent を企業の現場に導入した実践ノート：Skill の改善、調査の方法、ハマりどころ。',
      analysis: '不安を煽らない AI 業界分析：AI の本当の実力と限界を見極める。',
      lab: 'すぐに試せる小さなツール。すべてブラウザ内で動作し、データは収集しません。',
      about: 'Rami0291：日本在住の Forward Deployed Engineer。AI Agent 導入の研修とコンサルティングを提供。',
    },
    langSwitch: '中文',
    featured: '注目の事例',
    latest: '最新記事',
    more: 'もっと見る',
    noPosts: '日本語の記事はまだありません。',
    machineTranslated: 'この記事は中国語原文の機械翻訳です。',
    readOriginal: '中国語の原文を読む',
    readTranslation: '日本語で読む',
    lastVerified: '情報の最終確認日',
    staleWarning: 'この記事の情報は半年以上確認されていません。参考にする際はご注意ください。',
    updated: '更新',
    series: 'シリーズ',
    footer: '[exit 0] © Rami0291 · static site on GitHub Pages',
  },
} as const;

/** Prefixes a site path with the language segment; zh lives at the root. */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === DEFAULT_LANG ? clean : `/${lang}${clean}`;
}

/** Static paths for the [...locale] routes: undefined renders the root (zh). */
export function localeParams() {
  return LANGS.map((lang) => ({
    params: { locale: lang === DEFAULT_LANG ? undefined : lang },
    props: { lang },
  }));
}

export type Post = CollectionEntry<'posts'>;

export function postLang(post: Post): Lang {
  return post.id.split('/')[0] as Lang;
}

export function postSlug(post: Post): string {
  return post.id.split('/').slice(1).join('/');
}

export function postUrl(post: Post): string {
  return localePath(postLang(post), `/${post.data.category}/${postSlug(post)}/`);
}

/** Route params shared by a post page and its Markdown copy. */
export function postParams(post: Post) {
  const lang = postLang(post);
  return { locale: lang === DEFAULT_LANG ? undefined : lang, category: post.data.category, slug: postSlug(post) };
}

/** The plain Markdown copy of a post that agents can read without parsing HTML. */
export function postMarkdownUrl(post: Post): string {
  return postUrl(post).replace(/\/$/, '.md');
}

/** The newest of the publish, update and verification dates: when the page last changed for readers. */
export function postModified(post: Post): Date {
  const { date, updated, lastVerified } = post.data;
  return new Date(Math.max(...[date, updated, lastVerified].filter((d) => d !== undefined).map((d) => d.valueOf())));
}

/** Published posts in every language. */
export function getAllPosts() {
  return getCollection('posts', (p: Post) => !p.data.draft);
}

/** The same article in the other language, if it exists. */
export function findCounterpart(post: Post, posts: Post[]): Post | undefined {
  return posts.find((p) => postSlug(p) === postSlug(post) && postLang(p) !== postLang(post));
}

/** Published posts in one language, newest first. */
export async function getPosts(lang: Lang, filter: (p: Post) => boolean = () => true) {
  const all = await getAllPosts();
  return all
    .filter((p) => postLang(p) === lang && filter(p))
    .sort((a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(HTML_LANG[lang], { year: 'numeric', month: 'long', day: 'numeric' });
}
