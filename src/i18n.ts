import { getCollection, type CollectionEntry } from 'astro:content';

export const LANGS = ['zh', 'ja'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'zh';

export const HTML_LANG: Record<Lang, string> = { zh: 'zh-CN', ja: 'ja' };

export const CATEGORIES = ['notes', 'analysis'] as const;
export type Category = (typeof CATEGORIES)[number];

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
    labIntro: '可以直接上手的小工具，全部纯前端运行、不收集数据。',
    footer: '[exit 0] © Rami0291 · static site on GitHub Pages',
  },
  ja: {
    siteName: 'Rami0291',
    tagline: 'Forward Deployed Engineer · AI Agent を企業の現場へ',
    whoami: ['日本在住のサイバー遊牧民 · OSS 作者 · 自称アナリスト', 'FDE の泥臭い仕事が日常。3 年以内に AGI は実現すると信じている。'],
    navLabel: 'メインナビゲーション',
    nav: { notes: '実践ノート', analysis: '業界分析', lab: 'ツール', about: 'About' },
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
    labIntro: 'すぐに試せる小さなツール。すべてブラウザ内で動作し、データは収集しません。',
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

/** Published posts in one language, newest first. */
export async function getPosts(lang: Lang, filter: (p: Post) => boolean = () => true) {
  const all = await getCollection('posts', (p: Post) => !p.data.draft && postLang(p) === lang);
  return all.filter(filter).sort((a: Post, b: Post) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(HTML_LANG[lang], { year: 'numeric', month: 'long', day: 'numeric' });
}
