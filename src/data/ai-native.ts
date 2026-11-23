import type zh from './ai-native/zh.json';

// Structure of the AI-native two-axis diagnosis: ids, weights and links are shared by every language.
// Wording lives in ./ai-native/<lang>.json and is loaded by ./ai-native-content.ts, so the browser bundle stays free of it.
// `tag` is the English subtitle shown under Chinese and Japanese names.

export type Content = typeof zh;

export const LEVELS = [0, 0.25, 0.5, 0.75, 1];

export const Y_ITEMS = [
  { id: 'y1', w: 15, tag: 'Access Policy & Enterprise Infrastructure' },
  { id: 'y2', w: 20, tag: 'Enterprise Knowledge Base · stack-agnostic' },
  { id: 'y3', w: 20, tag: 'Workflow Acceleration · beyond the chat box' },
  { id: 'y4', w: 15, tag: 'Depth in Core Production' },
  { id: 'y5', w: 15, tag: 'Compliance & Governance Guardrails' },
  { id: 'y6', w: 15, tag: 'Outcome Measurement & Rework Control' },
] as const;

export const X_ITEMS = [
  { id: 'x1', w: 25, tag: 'Connected' },
  { id: 'x2', w: 25, tag: 'Programmable' },
  { id: 'x3', w: 25, tag: 'Autonomous' },
  { id: 'x4', w: 25, tag: 'Empowered' },
] as const;

export const TRAP_GROUPS = [
  {
    id: 'ai',
    items: [
      { id: 'a1', link: 'y5', tag: 'Prompt Bloat & Fuzzy Negatives' },
      { id: 'a2', link: 'y2', tag: 'Digital Landfill RAG' },
      { id: 'a3', link: 'y3', tag: 'Human Copy-Paste Glue' },
      { id: 'a4', link: 'y4', tag: 'Day-One Autonomy without Hard Limits' },
      { id: 'a5', link: 'y6', tag: 'Flagship-for-Everything' },
      { id: 'a6', link: 'y6', tag: 'Vanity Metrics' },
      { id: 'a7', link: 'y1', tag: 'Shadow AI' },
      { id: 'a8', link: 'y3', tag: 'Pilot Purgatory' },
      { id: 'a9', link: 'y5', tag: 'Vibe-based Evaluation' },
      { id: 'a10', link: 'y5', tag: 'Agent Sprawl' },
      { id: 'a11', link: 'y5', tag: 'Over-privileged Tools' },
    ],
  },
  {
    id: 'digital',
    items: [
      { id: 'd1', link: 'x2', tag: 'RPA Masquerading as APIs' },
      { id: 'd2', link: 'x1', tag: 'Manual Warehouse & Zombie Lake' },
      { id: 'd3', link: 'x1', tag: 'Master Data Chaos' },
      { id: 'd4', link: 'x3', tag: 'Paving the Cow Path' },
      { id: 'd5', link: 'x2', tag: 'Agent-Hostile APIs' },
      { id: 'd6', link: 'x4', tag: 'Shadow IT Sprawl' },
      { id: 'd7', link: 'x4', tag: 'Report Factory' },
    ],
  },
] as const;

export const Z_QS = [
  { id: 'z1', tag: 'Dedicated Budget' },
  { id: 'z2', tag: 'Named Owner' },
  { id: 'z3', tag: 'Leader Uses It' },
  { id: 'z4', tag: 'Role Redesign' },
  { id: 'z5', tag: 'Safe to Fail' },
  { id: 'z6', tag: 'Written Roadmap' },
] as const;

// tr / br / tl / bl are positions on the matrix (split at 60). `mirage` overrides the position
// whenever AI aggressiveness runs more than OVERREACH points ahead of the digital foundation.
export const QUADS = {
  tr: { tone: 'ok', tag: 'AI-Native Frontier' },
  br: { tone: 'info', tag: 'Digital Powerhouse' },
  tl: { tone: 'warn', tag: 'AI Running Ahead' },
  bl: { tone: 'warn', tag: 'Legacy Laggards' },
  mirage: { tone: 'danger', tag: 'High-Risk Mirage' },
} as const;

// AI aggressiveness A: the items that push AI into live operations, rescaled to 0–100.
export const AGGRESSIVE = ['y3', 'y4'] as const;
export const OVERREACH = 20;
export const WARN_BAND = 10;
export const PENALTY_RATE = 0.6;

export const STAB_TAGS = { ok: 'Solid', warn: 'Wobbly', danger: 'Fragile' } as const;

// Illustrative reference points on the matrix, not measurements.
export const REFS = [{ x: 95, y: 92, name: 'Google' }];

export const EXAMPLE = {
  scores: { y1: 4, y2: 3, y3: 2, y4: 3, y5: 2, y6: 2, x1: 1, x2: 1, x3: 2, x4: 2 },
  evid: { y1: true, y2: false, y3: true, y4: false, y5: true, y6: false, x1: true, x2: true, x3: true, x4: false },
  traps: {
    a1: false, a2: true, a3: true, a4: false, a5: false, a6: true, a7: true, a8: false, a9: true, a10: false, a11: false,
    d1: true, d2: true, d3: true, d4: false, d5: false, d6: false, d7: true,
  },
  z: { z1: false, z2: false, z3: true, z4: false, z5: false, z6: false },
  example: true,
};

export const STORAGE_KEY = 'ai-native-diagnostic-v1';
