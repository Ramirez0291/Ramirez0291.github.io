// Scenes and transitions of the homepage intro ("genesis").
// Everything here is a pure function of progress, so the wheel can scrub forwards and backwards.

export type Lang = 'zh' | 'en' | 'ja';
export type Vec2 = [number, number];
export type Fx = [id: number, a: number, b: number, c: number];

export const FX = { none: 0, split: 1, fire: 2, mosaic: 3, chroma: 4, glow: 5 } as const;
export const KIND = { still: 0, warp: 1, flow: 2, fire: 3, streak: 4, swirl: 5, diffuse: 6, latent: 7, end: 8, emerge: 9, prompt: 10, inhale: 11 } as const;

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
  /** Image URL; '' for the closing card, whose picture is drawn at runtime. */
  src: string;
  year: string;
  /** Painting UV of the >_ cursor. */
  focus: Vec2;
  /** Painting UV of a secondary point (the candle flame in Wright). */
  aux?: Vec2;
  dur: number;
  title: Record<Lang, string>;
  artist: Record<Lang, string>;
  /** What the painting is written in: its lights and midtones spell this out, letter by letter. */
  text?: string;
  /** Where the text is from, for the caption. */
  source?: Record<Lang, string>;
  /** `tall` selects the camera move for an upright phone (see isTall). */
  state(p: number, tall: boolean): SceneState;
}

/** An upright phone shows only a sliver of a wide painting cropped to "cover", so those scenes get
 *  their own keyframes there. They are written as multiples of "contain" (negative zoom), where the
 *  visible share of the painting's width is simply 1 / |zoom| whatever the screen: a close-up of
 *  the subject, or a letterboxed frame that the camera pushes into. */
export const isTall = (w: number, h: number) => w / h < 0.8;

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

/** Scene texts are set as an inscription: capitals only, no spaces, punctuation or accents
 *  (é -> E, æ -> AE; German umlauts are spelled out, ä -> AE). */
const inscribe = (s: string, german = false) =>
  (german ? s.replace(/[äöü]/gi, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue' })[c.toLowerCase()] ?? c) : s)
    .replace(/ß/g, 'ss')
    .replace(/æ/gi, 'ae')
    .replace(/œ/gi, 'oe')
    .normalize('NFD')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
/** Formulas and commands keep their own characters; only the spaces go. */
const verbatim = (s: string) => s.replace(/\s+/g, '');

export const SCENES: Scene[] = [
  {
    key: 'adam',
    src: '/intro/adam.webp',
    year: '1512',
    focus: [0.3825, 0.444],
    dur: 6.5,
    title: { zh: '《创造亚当》', ja: '《アダムの創造》', en: 'The Creation of Adam' },
    artist: { zh: '米开朗基罗', ja: 'ミケランジェロ', en: 'Michelangelo' },
    // Vulgate, Genesis: the opening of 1:26, all of 1:27, the opening of 2:7. Only wording that two
    // online editions agree on is used (Bible Gateway's Vulgate and vulgate.org, checked 2026-11-10).
    text: inscribe(
      'Faciamus hominem ad imaginem et similitudinem nostram. ' +
        'Et creavit Deus hominem ad imaginem suam: ad imaginem Dei creavit illum, masculum et feminam creavit eos. ' +
        'Formavit igitur Dominus Deus hominem de limo terrae.',
    ),
    source: { zh: '字：《创世记》1:26–27、2:7', ja: '文字：創世記 1:26–27, 2:7', en: 'Text: Genesis 1:26–27, 2:7' },
    state: (p, tall) => {
      // Wide: end slightly left of centre so narrow windows still frame both hands.
      // Tall: never leave the two hands; the whole fresco would be a strip of plaster.
      const c = tall
        ? keys([[0, 0.3825, 0.444, -28], [0.82, 0.389, 0.45, -12.5], [1, 0.389, 0.45, -12]], p)
        : keys([[0, 0.3825, 0.444, 7], [0.82, 0.4, 0.5, 1.02], [1, 0.4, 0.5, 1]], p);
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
    title: { zh: '《杜尔普医生的解剖学课》', ja: '《テュルプ博士の解剖学講義》', en: 'The Anatomy Lesson of Dr. Nicolaes Tulp' },
    artist: { zh: '伦勃朗', ja: 'レンブラント', en: 'Rembrandt' },
    // Descartes, Discours de la méthode (1637), part V: the body as a machine. Checked against
    // French Wikisource and Project Gutenberg #13846 (both the Cousin edition), 2026-11-10.
    text: inscribe(
      "ce corps comme une machine, qui, ayant été faite des mains de Dieu, est incomparablement mieux ordonnée et a en soi des mouvements plus admirables qu'aucune de celles qui peuvent être inventées par les hommes.",
    ),
    source: { zh: '字：笛卡尔《谈谈方法》第五部分', ja: '文字：デカルト『方法序説』第五部', en: 'Text: Descartes, Discourse on the Method, Part V' },
    state: (p, tall) => ({
      // Tall: travel from the watching faces to the surgeon's hand.
      ...keys(tall ? [[0, 0.38, 0.5, -2.2], [1, 0.55, 0.56, -2.9]] : [[0, 0.5, 0.5, 1], [1, 0.53, 0.6, 1.9]], p),
      fx: NOFX,
      gain: [1.35, 0.8],
    }),
  },
  {
    key: 'vermeer',
    src: '/intro/vermeer.webp',
    year: '1668',
    focus: [0.392, 0.447],
    dur: 4.5,
    title: { zh: '《天文学家》', ja: '《天文学者》', en: 'The Astronomer' },
    artist: { zh: '维米尔', ja: 'フェルメール', en: 'Vermeer' },
    // Pascal, Pensées (published 1670), fragments 206 and 347 in Brunschvicg's numbering.
    // Checked against French Wikisource (éd. Brunschvicg), 2026-11-10.
    text: inscribe(
      "Le silence éternel de ces espaces infinis m'effraie. " +
        "L'homme n'est qu'un roseau, le plus faible de la nature ; mais c'est un roseau pensant.",
    ),
    source: { zh: '字：帕斯卡《思想录》206、347', ja: '文字：パスカル『パンセ』206・347', en: 'Text: Pascal, Pensées 206, 347' },
    state: (p, tall) => ({
      // Tall: pull back only as far as the globe and the astronomer.
      ...keys(tall ? [[0, 0.392, 0.447, -5], [1, 0.47, 0.5, -1.95]] : [[0, 0.392, 0.447, 2.6], [1, 0.5, 0.45, 1]], p),
      fx: NOFX,
      gain: [1.4, 0.8],
    }),
  },
  {
    key: 'wright',
    src: '/intro/wright.webp',
    year: '1768',
    focus: [0.517, 0.268],
    aux: [0.497, 0.68],
    dur: 4.5,
    title: { zh: '《空气泵里的鸟实验》', ja: '《空気ポンプの中の鳥の実験》', en: 'An Experiment on a Bird in the Air Pump' },
    artist: { zh: '约瑟夫·赖特', ja: 'ジョセフ・ライト', en: 'Joseph Wright of Derby' },
    // Kant, Beantwortung der Frage: Was ist Aufklärung? (1784), in the spelling of the first
    // printing (Berlinische Monatsschrift) as transcribed on German Wikisource; the wording was
    // also checked against Project Gutenberg #30821 (which modernises "Muth"), 2026-11-10.
    text: inscribe(
      'Aufklärung ist der Ausgang des Menschen aus seiner selbst verschuldeten Unmündigkeit. ' +
        'Sapere aude! Habe Muth dich deines eigenen Verstandes zu bedienen! ist also der Wahlspruch der Aufklärung.',
      true,
    ),
    source: { zh: '字：康德《什么是启蒙？》', ja: '文字：カント『啓蒙とは何か』', en: 'Text: Kant, "What Is Enlightenment?"' },
    state: (p, tall) => ({
      // Tall: bird, lecturer and candle share one vertical axis; start letterboxed and push in on it.
      ...keys(tall ? [[0, 0.5, 0.5, -1.9], [1, 0.49, 0.5, -2.9]] : [[0, 0.5, 0.56, 1], [1, 0.5, 0.42, 1.45]], p),
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
    title: { zh: '《雨、蒸汽和速度——西部大铁路》', ja: '《雨、蒸気、速度―グレート・ウェスタン鉄道》', en: 'Rain, Steam and Speed – The Great Western Railway' },
    artist: { zh: '透纳', ja: 'ターナー', en: 'Turner' },
    // Dickens, Dombey and Son (1846-48), chapter 20, the railway journey.
    // Checked against Project Gutenberg #821, 2026-11-10.
    text: inscribe(
      'Away, with a shriek, and a roar, and a rattle, from the town, burrowing among the dwellings of men and making the streets hum, flashing out into the meadows for a moment, mining in through the damp earth, booming on in darkness and heavy air, bursting out again into the sunny day so bright and wide;',
    ),
    source: { zh: '字：狄更斯《董贝父子》第 20 章', ja: '文字：ディケンズ『ドンビー父子』第20章', en: 'Text: Dickens, Dombey and Son, ch. 20' },
    state: (p, tall) => ({
      ...keys(tall ? [[0, 0.56, 0.5, -1.8], [1, 0.655, 0.6, -6.5, 'in']] : [[0, 0.5, 0.5, 1], [1, 0.655, 0.6, 3.4, 'in']], p),
      fx: NOFX,
      gain: [1.15, 1.0],
    }),
  },
  {
    key: 'boccioni',
    src: '/intro/boccioni.webp',
    year: '1910',
    focus: [0.74, 0.34],
    dur: 4,
    title: { zh: '《城市的兴起》', ja: '《立ち上がる都市》', en: 'The City Rises' },
    artist: { zh: '波丘尼', ja: 'ボッチョーニ', en: 'Boccioni' },
    // Marinetti, Fondazione e Manifesto del Futurismo (1909), from point 4. Checked against the
    // text quoted on Italian Wikipedia (after I Manifesti del futurismo, 1914), 2026-11-10.
    text: inscribe(
      'Noi affermiamo che la magnificenza del mondo si è arricchita di una bellezza nuova: la bellezza della velocità. ' +
        'Un automobile ruggente, che sembra correre sulla mitraglia, è più bello della Vittoria di Samotracia.',
    ),
    source: { zh: '字：马里内蒂《未来主义宣言》', ja: '文字：マリネッティ「未来派宣言」', en: 'Text: Marinetti, The Futurist Manifesto' },
    state: (p, tall) => ({
      // Tall: from the horse's head and blue collar out to the whole animal.
      ...keys(tall ? [[0, 0.64, 0.4, -3.4], [1, 0.56, 0.5, -2.0]] : [[0, 0.5, 0.48, 1.6], [1, 0.5, 0.5, 1]], p),
      fx: NOFX,
      gain: [1.0, 1.0],
    }),
  },
  {
    key: 'dali',
    src: '/intro/dali.webp',
    year: '1976',
    focus: [0.346, 0.797],
    dur: 6,
    title: { zh: '《林肯在达利视觉中》', ja: '《ダリビジョンのリンカーン》', en: 'Lincoln in Dalivision' },
    artist: { zh: '达利', ja: 'ダリ', en: 'Dalí' },
    // Lincoln, Gettysburg Address (1863), Bliss copy: its first sentence and its last clause.
    // Checked against Abraham Lincoln Online and English Wikisource, 2026-11-10.
    text: inscribe(
      'Four score and seven years ago our fathers brought forth, on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. ' +
        'that government of the people, by the people, for the people, shall not perish from the earth.',
    ),
    source: { zh: '字：林肯《葛底斯堡演说》', ja: '文字：リンカーン「ゲティスバーグ演説」', en: 'Text: Lincoln, the Gettysburg Address' },
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
    title: { zh: '《埃德蒙·德·贝拉米肖像》', ja: '《エドモン・ド・ベラミーの肖像》', en: 'Edmond de Belamy' },
    artist: { zh: 'Obvious', ja: 'Obvious', en: 'Obvious' },
    // The GAN objective, which the collective signed the canvas with in place of a name
    // (transcribed from the painting; subscripts are written inline).
    text: verbatim('min G max D Ex[log(D(x))] + Ez[log(1-D(G(z)))]'),
    source: { zh: '字：画上署名用的 GAN 目标函数', ja: '文字：署名代わりの GAN 目的関数', en: 'Text: the GAN objective signed on the canvas' },
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
    title: { zh: '《太空歌剧院》', ja: '《宇宙オペラ座》', en: 'Théâtre D’opéra Spatial' },
    artist: { zh: 'Jason M. Allen × Midjourney', ja: 'Jason M. Allen × Midjourney', en: 'Jason M. Allen × Midjourney' },
    // The command is known; the prompt was never published, so it stays redacted.
    // Runs of uneven length, so the redactions do not line up into a brick pattern.
    text: verbatim([13, 29, 19, 7, 23].map((n) => '/imagine' + '░'.repeat(n)).join('')),
    source: { zh: '字：未公开的 prompt', ja: '文字：非公開のプロンプト', en: 'Text: an unpublished prompt' },
    state: (p, tall) => ({
      // Tall: letterboxed so the portal keeps its three figures, then a slow push in.
      ...keys(tall ? [[0, 0.53, 0.5, -2.0], [1, 0.515, 0.52, -2.3]] : [[0, 0.5, 0.5, 1], [1, 0.535, 0.52, 1.5]], p),
      fx: [FX.glow, 0.54, 0.43, 1],
      gain: [1.15, 0.9],
    }),
  },
  {
    // The tenth work does not exist yet. Its label is blank, its year is this one, and its
    // "painting" is the closing line, written in prompts. The picture is drawn at runtime
    // (makeCard in main.ts), which also moves `focus` to the end of the line.
    key: 'us',
    src: '',
    year: String(new Date().getFullYear()),
    focus: [0.5, 0.5],
    dur: 4.4,
    title: { zh: '《　　　　》', ja: '《　　　　》', en: '“　　　　”' },
    artist: { zh: '我们', ja: '私たち', en: 'Us' },
    text: verbatim('>_'),
    source: { zh: '字：>_', ja: '文字：>_', en: 'Text: >_' },
    state: (p) => ({ ...keys([[0, 0.5, 0.5, 1.05, 'out'], [1, 0.5, 0.5, 1]], p), fx: NOFX, gain: [1, 1] }),
  },
];

/** The closing card is the last scene. */
export const CARD = SCENES.length - 1;

export type Segment =
  | { type: 'scene'; i: number; dur: number }
  /** `from`: when there is no scene A, the scene whose final cursor position the glyphs start at. */
  | { type: 'trans'; a: number; b: number; kind: number; dur: number; from?: number };

const TRANSITIONS: [kind: number, dur: number][] = [
  [KIND.warp, 2.6], // adam -> tulp: rush forward, scatter, regroup
  [KIND.flow, 2.6], // tulp -> vermeer
  [KIND.fire, 3.0], // vermeer -> wright: the digits catch fire
  [KIND.streak, 2.4], // wright -> turner: characters race past
  [KIND.swirl, 2.8], // turner -> boccioni: the train drags the fog into a vortex
  [KIND.diffuse, 4.0], // boccioni -> dali: oil melts into noise, then denoises
  [KIND.latent, 2.8], // dali -> belamy: a walk through a GAN's latent space, one face bending into another
  [KIND.prompt, 4.4], // belamy -> opera: a prompt, four candidates, one upscaled
];

export const SEGMENTS: Segment[] = (() => {
  const s: Segment[] = [{ type: 'trans', a: -1, b: 0, kind: KIND.emerge, dur: 2.2 }];
  SCENES.forEach((scene, i) => {
    s.push({ type: 'scene', i, dur: scene.dur });
    if (i < CARD - 1) {
      const [kind, dur] = TRANSITIONS[i];
      s.push({ type: 'trans', a: i, b: i + 1, kind, dur });
    } else if (i === CARD - 1) {
      // The ending mirrors the opening. Everything that came out of the prompt is drawn back into
      // it; a beat of black with only the cursor; then the cursor writes the last line.
      s.push({ type: 'trans', a: i, b: -1, kind: KIND.inhale, dur: 2.1 });
      s.push({ type: 'trans', a: -1, b: CARD, kind: KIND.emerge, dur: 2.4, from: i });
    }
  });
  s.push({ type: 'trans', a: CARD, b: -1, kind: KIND.end, dur: 1.3 });
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

/** Camera over the 2x2 candidate grid of the "prompt" transition: [centre x, centre y, zoom].
 *  The zoom is anchored on the grid's bottom-right corner, so the chosen tile grows out of it. */
export function promptGrid(p: number): [number, number, number] {
  const z = 2 ** smooth(clamp((p - 0.7) / 0.3));
  const c = 0.5 + 0.5 * (1 - 1 / z);
  return [c, c, z];
}

/** The closing line, broken for a wide screen and for an upright phone. */
export const OUTRO: Record<Lang, { wide: string[]; tall: string[] }> = {
  zh: { wide: ['那么，', '轮到我们了。'], tall: ['那么，', '轮到', '我们', '了。'] },
  ja: { wide: ['さて、', '次は私たちの番だ。'], tall: ['さて、', '次は', '私たち', 'の番だ。'] },
  en: { wide: ['So,', "it's our turn."], tall: ['So,', "it's", 'our', 'turn.'] },
};
export const BOOT: Record<Lang, string> = { zh: 'loading genesis', ja: 'loading genesis', en: 'loading genesis' };
export const HINT: Record<Lang, string> = {
  zh: '滚轮 / 拖动 控制时间 · 空格 暂停',
  ja: 'ホイール / スワイプで時間を操作 · Space で一時停止',
  en: 'Wheel / drag to move through time · Space to pause',
};
/** Shown instead of HINT where there is no wheel or keyboard. */
export const HINT_TOUCH: Record<Lang, string> = {
  zh: '上下滑动 控制时间',
  ja: '上下スワイプで時間を操作',
  en: 'Swipe up / down to move through time',
};
