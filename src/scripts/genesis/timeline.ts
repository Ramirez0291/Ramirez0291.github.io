// Scenes and transitions of the homepage intro ("genesis").
// Everything here is a pure function of progress, so the wheel can scrub forwards and backwards.

export type Lang = 'zh' | 'ja';
export type Vec2 = [number, number];
export type Fx = [id: number, a: number, b: number, c: number];

export const FX = { none: 0, split: 1, fire: 2, mosaic: 3, chroma: 4, glow: 5 } as const;
export const KIND = { still: 0, warp: 1, flow: 2, fire: 3, streak: 4, swirl: 5, diffuse: 6, latent: 7, end: 8, emerge: 9 } as const;

export interface SceneState {
  cx: number;
  cy: number;
  /** Zoom relative to "cover"; negative values mean a multiple of "contain". */
  z: number;
  fx: Fx;
  /** [gain, gamma] applied to the painting colours. */
  gain: Vec2;
}

export interface Scene {
  key: string;
  src: string;
  year: string;
  /** Painting UV of the >_ cursor. */
  focus: Vec2;
  /** Painting UV of a secondary point (the candle flame in Wright). */
  aux?: Vec2;
  dur: number;
  title: Record<Lang, string>;
  artist: Record<Lang, string>;
  state(p: number): SceneState;
}

type Ease = 'io' | 'in' | 'out' | 'lin';
type Key = [t: number, cx: number, cy: number, z: number, ease?: Ease];

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
const EASE: Record<Ease, (t: number) => number> = {
  io: smooth,
  in: (t) => t * t * t,
  out: (t) => 1 - (1 - t) ** 3,
  lin: (t) => t,
};

/** Camera keyframes; zoom interpolates in log space so pull-backs feel even. */
function keys(list: Key[], p: number): { cx: number; cy: number; z: number } {
  if (p <= list[0][0]) return { cx: list[0][1], cy: list[0][2], z: list[0][3] };
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i];
    const b = list[i + 1];
    if (p <= b[0]) {
      const t = EASE[b[4] ?? 'io'](clamp((p - a[0]) / (b[0] - a[0])));
      // A scene keeps one zoom mode (all cover or all contain), so the sign never flips mid-segment.
      const za = Math.abs(a[3]);
      const zb = Math.abs(b[3]);
      const sign = b[3] < 0 ? -1 : 1;
      return { cx: lerp(a[1], b[1], t), cy: lerp(a[2], b[2], t), z: sign * Math.exp(lerp(Math.log(za), Math.log(zb), t)) };
    }
  }
  const l = list[list.length - 1];
  return { cx: l[1], cy: l[2], z: l[3] };
}

const NOFX: Fx = [FX.none, 0, 0, 0];

export const SCENES: Scene[] = [
  {
    key: 'adam',
    src: '/intro/adam.webp',
    year: '1512',
    focus: [0.3825, 0.444],
    dur: 6.5,
    title: { zh: '《创造亚当》', ja: '《アダムの創造》' },
    artist: { zh: '米开朗基罗', ja: 'ミケランジェロ' },
    state: (p) => {
      // End slightly left of centre so narrow screens still frame both hands.
      const c = keys([[0, 0.3825, 0.444, 7], [0.82, 0.4, 0.5, 1.02], [1, 0.4, 0.5, 1]], p);
      // b = half-gap between the two hands as a fraction of the visible width.
      const gap = 0.3 * (1 - smooth(clamp(p / 0.78)));
      return { ...c, fx: [FX.split, 0.3825, gap, 0.12], gain: [1.0, 1.0] };
    },
  },
  {
    key: 'tulp',
    src: '/intro/tulp.webp',
    year: '1632',
    focus: [0.528, 0.655],
    dur: 4.5,
    title: { zh: '《杜尔普医生的解剖学课》', ja: '《テュルプ博士の解剖学講義》' },
    artist: { zh: '伦勃朗', ja: 'レンブラント' },
    state: (p) => ({ ...keys([[0, 0.5, 0.5, 1], [1, 0.53, 0.6, 1.9]], p), fx: NOFX, gain: [1.35, 0.8] }),
  },
  {
    key: 'vermeer',
    src: '/intro/vermeer.webp',
    year: '1668',
    focus: [0.392, 0.447],
    dur: 4.5,
    title: { zh: '《天文学家》', ja: '《天文学者》' },
    artist: { zh: '维米尔', ja: 'フェルメール' },
    state: (p) => ({ ...keys([[0, 0.392, 0.447, 2.6], [1, 0.5, 0.45, 1]], p), fx: NOFX, gain: [1.4, 0.8] }),
  },
  {
    key: 'wright',
    src: '/intro/wright.webp',
    year: '1768',
    focus: [0.517, 0.268],
    aux: [0.497, 0.68],
    dur: 4.5,
    title: { zh: '《空气泵里的鸟实验》', ja: '《空気ポンプの中の鳥の実験》' },
    artist: { zh: '约瑟夫·赖特', ja: 'ジョセフ・ライト' },
    state: (p) => ({
      ...keys([[0, 0.5, 0.56, 1], [1, 0.5, 0.42, 1.45]], p),
      fx: [FX.fire, 0.497, 0.68, 1],
      gain: [1.45, 0.78],
    }),
  },
  {
    key: 'turner',
    src: '/intro/turner.webp',
    year: '1844',
    focus: [0.655, 0.61],
    dur: 4,
    title: { zh: '《雨、蒸汽和速度——西部大铁路》', ja: '《雨、蒸気、速度―グレート・ウェスタン鉄道》' },
    artist: { zh: '透纳', ja: 'ターナー' },
    state: (p) => ({ ...keys([[0, 0.5, 0.5, 1], [1, 0.655, 0.6, 3.4, 'in']], p), fx: NOFX, gain: [1.3, 0.8] }),
  },
  {
    key: 'boccioni',
    src: '/intro/boccioni.webp',
    year: '1910',
    focus: [0.74, 0.34],
    dur: 4,
    title: { zh: '《城市的兴起》', ja: '《立ち上がる都市》' },
    artist: { zh: '波丘尼', ja: 'ボッチョーニ' },
    state: (p) => ({ ...keys([[0, 0.5, 0.48, 1.6], [1, 0.5, 0.5, 1]], p), fx: NOFX, gain: [1.0, 1.0] }),
  },
  {
    key: 'dali',
    src: '/intro/dali.webp',
    year: '1976',
    focus: [0.346, 0.797],
    dur: 6,
    title: { zh: '《林肯在达利视觉中》', ja: '《ダリビジョンのリンカーン》' },
    artist: { zh: '达利', ja: 'ダリ' },
    state: (p) => {
      const c = keys([[0, 0.5, 0.42, -1.9], [0.55, 0.5, 0.5, -1], [1, 0.5, 0.5, -0.92]], p);
      // Blocks grow until Lincoln's face shows through the mosaic.
      const m = smooth(clamp((p - 0.3) / 0.5));
      return { ...c, fx: [FX.mosaic, m * 0.075, 0, m], gain: [1.05, 0.95] };
    },
  },
  {
    key: 'belamy',
    src: '/intro/belamy.webp',
    year: '2018',
    focus: [0.771, 0.85],
    dur: 5,
    title: { zh: '《埃德蒙·德·贝拉米肖像》', ja: '《エドモン・ド・ベラミーの肖像》' },
    artist: { zh: 'Obvious', ja: 'Obvious' },
    state: (p) => ({
      ...keys([[0, 0.55, 0.6, -1.5], [0.6, 0.5, 0.5, -1], [1, 0.5, 0.5, -1]], p),
      fx: [FX.chroma, 0.0035, 0, 0],
      gain: [1.15, 0.9],
    }),
  },
  {
    key: 'opera',
    src: '/intro/opera.webp',
    year: '2022',
    focus: [0.527, 0.7],
    aux: [0.54, 0.43],
    dur: 5,
    title: { zh: '《太空歌剧院》', ja: '《宇宙オペラ座》' },
    artist: { zh: 'Jason M. Allen × Midjourney', ja: 'Jason M. Allen × Midjourney' },
    state: (p) => ({
      ...keys([[0, 0.5, 0.5, 1], [1, 0.535, 0.52, 1.5]], p),
      fx: [FX.glow, 0.54, 0.43, 1],
      gain: [1.15, 0.9],
    }),
  },
];

export type Segment =
  | { type: 'scene'; i: number; dur: number }
  | { type: 'trans'; a: number; b: number; kind: number; dur: number; status?: string }
  | { type: 'outro'; dur: number };

const TRANSITIONS: [kind: number, dur: number][] = [
  [KIND.warp, 2.6], // adam -> tulp: rush forward, scatter, regroup
  [KIND.flow, 2.6], // tulp -> vermeer
  [KIND.fire, 3.0], // vermeer -> wright: the digits catch fire
  [KIND.streak, 2.4], // wright -> turner: characters race past
  [KIND.swirl, 2.8], // turner -> boccioni: the train drags the fog into a vortex
  [KIND.diffuse, 4.4], // boccioni -> dali: oil melts into noise, then denoises
  [KIND.latent, 3.2], // dali -> belamy
  [KIND.latent, 3.2], // belamy -> opera
];

export const SEGMENTS: Segment[] = (() => {
  const s: Segment[] = [{ type: 'trans', a: -1, b: 0, kind: KIND.emerge, dur: 2.2 }];
  SCENES.forEach((scene, i) => {
    s.push({ type: 'scene', i, dur: scene.dur });
    if (i < SCENES.length - 1) {
      const [kind, dur] = TRANSITIONS[i];
      s.push({ type: 'trans', a: i, b: i + 1, kind, dur });
    }
  });
  s.push({ type: 'trans', a: SCENES.length - 1, b: -1, kind: KIND.end, dur: 1.4 });
  s.push({ type: 'outro', dur: 2.4 });
  return s;
})();

export const TOTAL = SEGMENTS.reduce((t, s) => t + s.dur, 0);

/** Start time of each scene, for the timeline rail. */
export const SCENE_START: number[] = (() => {
  const out: number[] = [];
  let t = 0;
  for (const s of SEGMENTS) {
    if (s.type === 'scene') out[s.i] = t;
    t += s.dur;
  }
  return out;
})();

export function locate(t: number): { seg: Segment; index: number; p: number } {
  let acc = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    const seg = SEGMENTS[i];
    if (t < acc + seg.dur || i === SEGMENTS.length - 1) {
      return { seg, index: i, p: clamp((t - acc) / seg.dur) };
    }
    acc += seg.dur;
  }
  throw new Error('unreachable');
}

export const OUTRO: Record<Lang, string> = { zh: '那么，轮到我们了。', ja: 'さて、次は私たちの番だ。' };
export const BOOT: Record<Lang, string> = { zh: 'loading genesis', ja: 'loading genesis' };
export const HINT: Record<Lang, string> = {
  zh: '滚轮 / 拖动 控制时间 · 空格 暂停',
  ja: 'ホイール / スワイプで時間を操作 · Space で一時停止',
};
