import type { Lang } from './i18n';

// Each tool is its own repo published as a GitHub Pages project site,
// which GitHub mounts under this domain at /<repo-name>/.
export const TOOLS: {
  id: string;
  href: string;
  ready: boolean;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    id: 'ainativebench',
    href: '/ainativebench/',
    ready: true,
    name: { zh: 'AI 原生诊断', ja: 'AI ネイティブ診断' },
    desc: {
      zh: '你的公司是哪种 AI 物种？测完生成可分享的海报。',
      ja: 'あなたの会社はどの AI 種族？診断結果をポスターでシェア。',
    },
  },
];

export const STATUS: Record<'ready' | 'building', Record<Lang, string>> = {
  ready: { zh: '可用', ja: '公開中' },
  building: { zh: '构建中…', ja: 'ビルド中…' },
};
