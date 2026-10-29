import {
  HTML_LANG,
  LANGS,
  localePath,
  postLang,
  postMarkdownUrl,
  postModified,
  postUrl,
  ui,
  type Lang,
  type Post,
} from './i18n';

/** Absolute URL on the production domain, for anything read outside the page: feeds, sitemaps, structured data. */
export function absoluteUrl(path: string): string {
  return new URL(path, import.meta.env.SITE).href;
}

export const AUTHOR = {
  name: 'Rami0291',
  jobTitle: 'Forward Deployed Engineer',
  twitter: '@nekotorune',
  // Listed on the about page and as sameAs in structured data,
  // which is how search engines tie this site to the same person on other platforms.
  links: [
    { label: 'GitHub', handle: 'Ramirez0291', href: 'https://github.com/Ramirez0291' },
    { label: 'X', handle: '@nekotorune', href: 'https://x.com/nekotorune' },
  ],
};

// One static card for social shares and article rich results.
// It shows the name and tagline, so redraw it if either changes.
export const OG_IMAGE = {
  path: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Rami0291 — Forward Deployed Engineer',
};

const PERSON_ID = absoluteUrl('/#person');
const WEBSITE_ID = absoluteUrl('/#website');
const articleId = (post: Post) => `${absoluteUrl(postUrl(post))}#article`;

/** The site and its author, present on every page so each one identifies who wrote it. */
export function siteSchema(lang: Lang) {
  const t = ui[lang];
  return [
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: absoluteUrl('/'),
      name: t.siteName,
      description: t.tagline,
      inLanguage: LANGS.map((l) => HTML_LANG[l]),
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
    },
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: AUTHOR.name,
      // One person, one URL: the original about page, whichever language links to it.
      url: absoluteUrl('/about/'),
      jobTitle: AUTHOR.jobTitle,
      description: t.whoami.join('。'),
      knowsAbout: ['AI agents', 'Forward deployed engineering', 'Agent Skills', 'Enterprise AI adoption'],
      sameAs: AUTHOR.links.map((link) => link.href),
    },
  ];
}

export function postSchema(post: Post, counterpart?: Post) {
  const lang = postLang(post);
  const t = ui[lang];
  const url = absoluteUrl(postUrl(post));
  const { title, description, date, category, tags, machineTranslated } = post.data;

  const article: Record<string, unknown> = {
    '@type': 'BlogPosting',
    '@id': articleId(post),
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: HTML_LANG[lang],
    datePublished: date.toISOString(),
    dateModified: postModified(post).toISOString(),
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
    articleSection: t.nav[category],
    image: absoluteUrl(OG_IMAGE.path),
    ...(tags.length > 0 && { keywords: tags }),
  };
  // Machine translations point at their original, so answer engines cite the source.
  if (counterpart && machineTranslated) article.translationOfWork = { '@id': articleId(counterpart) };
  if (counterpart?.data.machineTranslated) article.workTranslation = { '@id': articleId(counterpart) };

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { name: t.siteName, item: absoluteUrl(localePath(lang, '/')) },
      { name: t.nav[category], item: absoluteUrl(localePath(lang, `/${category}/`)) },
      { name: title, item: url },
    ].map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
  };

  return [article, breadcrumb];
}

export function profileSchema(lang: Lang) {
  return [
    {
      '@type': 'ProfilePage',
      url: absoluteUrl(localePath(lang, '/about/')),
      inLanguage: HTML_LANG[lang],
      mainEntity: { '@id': PERSON_ID },
    },
  ];
}

/** A post as standalone Markdown: the source text plus the metadata an agent needs to cite it. */
export function postMarkdown(post: Post, counterpart?: Post): string {
  const lang = postLang(post);
  const t = ui[lang];
  const { title, description, date, updated, lastVerified, machineTranslated } = post.data;
  const meta = [
    `- Author: ${AUTHOR.name}, ${AUTHOR.jobTitle} (${absoluteUrl(localePath(lang, '/about/'))})`,
    `- Published: ${date.toISOString().slice(0, 10)}`,
    updated && `- Updated: ${updated.toISOString().slice(0, 10)}`,
    lastVerified && `- Last verified: ${lastVerified.toISOString().slice(0, 10)}`,
    `- Language: ${HTML_LANG[lang]}`,
    `- Canonical URL: ${absoluteUrl(postUrl(post))}`,
    machineTranslated && counterpart && `- Machine translation of: ${absoluteUrl(postMarkdownUrl(counterpart))}`,
    !machineTranslated && counterpart && `- Translation: ${absoluteUrl(postMarkdownUrl(counterpart))}`,
  ].filter(Boolean);
  const notice = machineTranslated ? `\n\n> ${t.machineTranslated}` : '';
  return `# ${title}\n\n> ${description}\n\n${meta.join('\n')}${notice}\n\n${(post.body ?? '').trim()}\n`;
}

/** Opening of llms.txt and llms-full.txt: who writes here, what about, and how the site is laid out. */
export function llmsIntro(): string {
  return `# ${AUTHOR.name}

> Personal site of ${AUTHOR.name}, a ${AUTHOR.jobTitle} living in Japan who puts AI agents to work inside real companies. Field notes and industry analysis on AI agents, written in Chinese; the Japanese versions are machine translations.

${ui.zh.tagline}

The author writes:
- Field notes from real enterprise AI agent deployments (${absoluteUrl('/notes/')})
- Open course material and methodology for deploying agents
- Industry analysis that neither hypes nor dismisses AI (${absoluteUrl('/analysis/')})

The author offers AI training for decision makers, and hands-on help for managers and teams moving AI from demos into real workflows. Contact: ${AUTHOR.links.map((link) => `${link.label} ${link.href}`).join(' · ')}

How this site is laid out:
- Chinese (zh-CN) originals live at the site root; Japanese (ja) machine translations live under /ja/.
- Every article has a plain Markdown copy: replace the trailing "/" of its URL with ".md".
- Analysis posts carry a "last verified" date. The field moves fast, so check that date before quoting figures.
- Cite the canonical HTML URL, which each Markdown copy lists.`;
}

/** One line per post for llms.txt: link to the Markdown copy, then the summary and date. */
export function postIndexLine(post: Post): string {
  const { title, description, date } = post.data;
  return `- [${title}](${absoluteUrl(postMarkdownUrl(post))}): ${description} (${date.toISOString().slice(0, 10)})`;
}

/** Escapes text for XML element content and attribute values. */
export function xml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`);
}
