import type { Lang } from './i18n';

// External project sites keep their paths; local explainers follow the blog locale.
export const TOOLS: {
  id: string;
  href: string;
  ready: boolean;
  localized?: boolean;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
}[] = [
  {
    id: 'graph-workflow',
    href: '/lab/graph-workflow/',
    ready: true,
    localized: true,
    name: { zh: 'Graph Workflow', en: 'Graph Workflow', ja: 'Graph Workflow' },
    desc: {
      zh: '让 Agent 分工，把验收交给规则。探索多 Agent 开发工作流与交互流程图。',
      en: 'Separate agent roles. Enforce acceptance with code. Explore the interactive workflow.',
      ja: 'Agent の役割を分け、コードで検証する。対話型フロー図で開発の仕組みを読む。',
    },
  },
  {
    id: 'ainativebench',
    href: '/ainativebench/',
    ready: true,
    name: { zh: 'AI 原生诊断', en: 'AI-Native Diagnosis', ja: 'AI ネイティブ診断' },
    desc: {
      zh: '你的公司是哪种 AI 物种？测完生成可分享的海报。',
      en: 'What kind of AI species is your company? Take the test and get a poster to share.',
      ja: 'あなたの会社はどの AI 種族？診断結果をポスターでシェア。',
    },
  },
];

export const STATUS: Record<'ready' | 'building', Record<Lang, string>> = {
  ready: { zh: '可用', en: 'live', ja: '公開中' },
  building: { zh: '构建中…', en: 'building…', ja: 'ビルド中…' },
};
