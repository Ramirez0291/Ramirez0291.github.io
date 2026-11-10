// Controller for the homepage intro: loading, the clock (autoplay + wheel/touch/keys scrubbing),
// the >_ cursor, captions, and the hand-off back to the terminal homepage.

import { Engine, type DrawParams } from './engine';
import { CARD, FX, HINT_TOUCH, KIND, OUTRO, SCENES, SCENE_START, SEGMENTS, TOTAL, isTall, locate, promptGrid, smooth, type Lang, type SceneState } from './timeline';

const SEEN_KEY = 'genesis-seen';
const FONT = "'JetBrains Mono Variable', ui-monospace, Menlo, Consolas, monospace";
// The closing line is drawn in the heaviest system sans there is: the glyph grid is coarse.
const CARD_FONT = "system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans', 'Noto Sans CJK SC', 'Noto Sans JP', 'Microsoft YaHei', 'Yu Gothic', sans-serif";

type V4 = [number, number, number, number];
type V2 = [number, number];

interface Painting {
  tex: WebGLTexture;
  size: V2;
  aspect: number;
  /** Small copy of the pixels, for matching brightness between paintings on the CPU. */
  thumb: ImageData;
}

interface View {
  cam: V4;
  fx: V4;
  gain: V2;
  focus: V2;
  aux: V2;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function loadImage(src: string): Promise<HTMLImageElement> {
  // onload rather than decode(): decode() can hang forever in a hidden tab.
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

export function boot() {
  const html = document.documentElement;
  const root = document.getElementById('genesis');
  if (!root || !html.classList.contains('genesis-pending')) return;
  (window as unknown as { __genesis?: boolean }).__genesis = true;

  const lang: Lang = root.dataset.lang === 'ja' ? 'ja' : 'zh';
  const canvas = root.querySelector<HTMLCanvasElement>('.g-canvas')!;
  const cursorEl = root.querySelector<HTMLElement>('.g-cursor')!;
  const typeEl = root.querySelector<HTMLElement>('.g-type')!;
  const titleEl = root.querySelector<HTMLElement>('.g-title')!;
  const lineEl = root.querySelector<HTMLElement>('.g-l2')!;
  const headEl = root.querySelector<HTMLElement>('.g-l1')!;
  const statusEl = root.querySelector<HTMLElement>('.g-status')!;
  const railItems = [...root.querySelectorAll<HTMLElement>('.g-rail li')];
  const railFill = root.querySelector<HTMLElement>('.g-rail-fill');
  const progEl = root.querySelector<HTMLElement>('.g-progress i');
  const hintEl = root.querySelector<HTMLElement>('.g-hint')!;
  const skipEl = root.querySelector<HTMLButtonElement>('.g-skip')!;
  if (matchMedia('(pointer: coarse)').matches) hintEl.textContent = HINT_TOUCH[lang];
  const tall = () => isTall(window.innerWidth, window.innerHeight);
  // The rail was rendered at build time; the last entry is "this year" for whoever is watching.
  railItems.forEach((li, i) => SCENES[i] && (li.textContent = SCENES[i].year));

  // Debug: ?intro&gt=12.5 opens the film paused at 12.5 s; window.__genesisSeek(t) jumps anywhere.
  // ?gc=150 forces 150 glyph columns, to compare cell sizes.
  const debugT = Number(new URLSearchParams(location.search).get('gt') ?? NaN);
  const debugCols = Number(new URLSearchParams(location.search).get('gc')) || 0;
  if (new URLSearchParams(location.search).has('intro')) {
    history.replaceState(null, '', location.pathname + location.hash);
  }

  root.hidden = false;
  let engine: Engine | null = null;
  const paintings: Painting[] = [];
  let finished = false;
  let started = false;

  // ── text helpers (only touch the DOM when the text changes) ──
  const setText = (el: HTMLElement, s: string) => {
    if (el.textContent !== s) el.textContent = s;
  };
  let cursorXY: V2 = [window.innerWidth / 2, window.innerHeight / 2];
  const placeCursor = (x: number, y: number) => {
    const m = 28;
    x = clamp(x, m, window.innerWidth - m);
    y = clamp(y, m, window.innerHeight - m);
    cursorXY = [x, y];
    cursorEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  };
  const bootPoint = (): V2 => [window.innerWidth / 2 - Math.min(170, window.innerWidth * 0.32), window.innerHeight / 2];
  placeCursor(...bootPoint());

  // ── camera maths, shared with the shader ──
  function view(i: number, st: SceneState): View {
    const P = paintings[i];
    const sc = SCENES[i];
    const W = window.innerWidth;
    const H = window.innerHeight;
    const va = W / H;
    const pa = P.aspect;
    const fw = va > pa ? 1 : va / pa;
    const fh = va > pa ? pa / va : 1;
    const z = st.z < 0 ? -st.z * Math.min(fw, fh) : st.z;
    const sx = fw / z;
    const sy = fh / z;
    const cx = sx < 1 ? clamp(st.cx, sx / 2, 1 - sx / 2) : 0.5;
    const cy = sy < 1 ? clamp(st.cy, sy / 2, 1 - sy / 2) : 0.5;
    const toPx = (u: number, v: number): V2 => [((u - cx) / sx + 0.5) * W, ((v - cy) / sy + 0.5) * H];
    const fx: V4 = [...st.fx];
    if (fx[0] === FX.split) fx[2] *= sx; // gap is authored as a fraction of the visible width
    return {
      cam: [cx, cy, sx, sy],
      fx,
      gain: st.gain,
      focus: toPx(...sc.focus),
      aux: sc.aux ? toPx(...sc.aux) : toPx(...sc.focus),
    };
  }

  // ── the closing card: the last line as a picture, laid out for the current screen ──
  let cardShape = '';
  function makeCard(): Painting {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const lines = OUTRO[lang][tall() ? 'tall' : 'wide'];
    const c = document.createElement('canvas');
    c.width = tall() ? 1000 : 1600;
    c.height = Math.round((c.width * H) / W);
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    // Every character is one em wide, except that punctuation closing a line takes half: its ink
    // sits in the left half of its box, and the other half would only push the line off-centre.
    const ems = (l: string) => [...l].length - (/[，。、]$/.test(l) ? 0.5 : 0);
    const longest = Math.max(...lines.map(ems));
    const gap = tall() ? 1.06 : 1.2;
    const size = Math.min((c.width * (tall() ? 0.86 : 0.8)) / longest, (c.height * (tall() ? 0.68 : 0.6)) / (lines.length * gap));
    const lh = size * gap;
    // The glyph grid is coarse. Where a character gets under ~20 rows of it, heavy strokes would
    // close up into blobs, so the weight drops and the extra outline goes.
    const fine = size / (c.height / engine!.rows) < 20;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${fine ? 600 : 900} ${size}px ${CARD_FONT}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const x0 = (c.width - longest * size) / 2;
    // A little above the middle: the caption sits bottom-left.
    const y0 = c.height * 0.46 - ((lines.length - 1) * lh) / 2;
    ctx.fillStyle = ctx.strokeStyle = '#ffc45a';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.035;
    lines.forEach((l, i) =>
      [...l].forEach((ch, k) => {
        ctx.fillText(ch, x0 + k * size, y0 + i * lh);
        if (!fine) ctx.strokeText(ch, x0 + k * size, y0 + i * lh);
      }),
    );
    // The cursor rests where the line ends, as if it had just typed it.
    const end = x0 + ems(lines[lines.length - 1]) * size;
    SCENES[CARD].focus = [clamp((end + size * 0.16) / c.width, 0.05, 0.93), (y0 + (lines.length - 1) * lh + size * 0.18) / c.height];
    cardShape = `${tall()}:${(W / H).toFixed(1)}`;
    const t = document.createElement('canvas');
    t.width = 200;
    t.height = Math.round((200 * c.height) / c.width);
    const tctx = t.getContext('2d', { willReadFrequently: true })!;
    tctx.drawImage(c, 0, 0, t.width, t.height);
    return { tex: engine!.texture(c), size: [c.width, c.height], aspect: c.width / c.height, thumb: tctx.getImageData(0, 0, t.width, t.height) };
  }

  // ── brightness-matched destinations for the "flow" and "swirl" transitions ──
  const destCache = new Map<string, Float32Array>();
  function lumGrid(i: number, v: View, e: Engine): Float32Array {
    const { thumb } = paintings[i];
    const out = new Float32Array(e.count);
    const [cx, cy, sx, sy] = v.cam;
    for (let k = 0; k < e.count; k++) {
      const col = k % e.cols;
      const row = Math.floor(k / e.cols);
      const u = cx + (((col + 0.5) * e.cw) / e.W - 0.5) * sx;
      const w = cy + (((row + 0.5) * e.ch) / e.H - 0.5) * sy;
      let l = 0;
      if (u >= 0 && u <= 1 && w >= 0 && w <= 1) {
        const x = Math.min(thumb.width - 1, Math.floor(u * thumb.width));
        const y = Math.min(thumb.height - 1, Math.floor(w * thumb.height));
        const o = (y * thumb.width + x) * 4;
        l = (0.299 * thumb.data[o] + 0.587 * thumb.data[o + 1] + 0.114 * thumb.data[o + 2]) / 255;
      }
      out[k] = l + Math.random() * 0.03;
    }
    return out;
  }
  function destFor(segIndex: number, a: number, b: number, A: View, B: View, e: Engine): Float32Array {
    const key = `${segIndex}:${e.cols}x${e.rows}:${e.W}x${e.H}`;
    let d = destCache.get(key);
    if (d) return d;
    const la = lumGrid(a, A, e);
    const lb = lumGrid(b, B, e);
    const ia = Array.from({ length: e.count }, (_, k) => k).sort((x, y) => la[x] - la[y]);
    const ib = Array.from({ length: e.count }, (_, k) => k).sort((x, y) => lb[x] - lb[y]);
    d = new Float32Array(e.count);
    for (let k = 0; k < e.count; k++) d[ia[k]] = ib[k];
    destCache.set(key, d);
    return d;
  }

  // ── captions ──
  function caption(i: number, p: number, fade: number) {
    // Line 1: title. Line 2: artist · year. Typed out over the first part of the scene.
    const sc = SCENES[i];
    const title = sc.title[lang];
    const byline = `${sc.artist[lang]} · ${sc.year}${sc.source ? ` · ${sc.source[lang]}` : ''}`;
    const n = Math.floor(clamp(p / 0.4) * (title.length + byline.length));
    setText(titleEl, title.slice(0, n));
    setText(lineEl, byline.slice(0, Math.max(0, n - title.length)));
    fadeCaption(fade);
  }
  // Only the title and byline fade; the status line under them has to stay readable in transitions.
  function fadeCaption(fade: number) {
    headEl.style.opacity = lineEl.style.opacity = String(fade);
  }

  function rail(t: number, active: number) {
    railItems.forEach((li, i) => li.classList.toggle('on', i === active));
    if (railFill) railFill.style.transform = `scaleY(${(t / TOTAL).toFixed(4)})`;
    if (progEl) progEl.style.transform = `scaleX(${(t / TOTAL).toFixed(4)})`;
  }

  // The closing line is made of two thin glyphs, > and _, so it gets a stronger cell fill than a
  // painting does; otherwise the film would end on its dimmest picture.
  const fillOf = (i: number) => (i === CARD ? 0.5 : undefined);

  // ── one frame of the film at time t ──
  function render(t: number, now: number) {
    const e = engine!;
    const { seg, index, p } = locate(t);
    const blank: V4 = [0.5, 0.5, 1, 1];
    const base: DrawParams = {
      kind: KIND.still,
      u: 0,
      time: now / 1000,
      texA: null,
      texB: null,
      sizeA: [1, 1],
      sizeB: [1, 1],
      camA: blank,
      camB: blank,
      fxA: [0, 0, 0, 0],
      fxB: [0, 0, 0, 0],
      gainA: [1, 1],
      gainB: [1, 1],
      focA: [0, 0],
      focB: [0, 0],
      aux: [0, 0],
    };
    let status = '';
    let pulse = 0;
    if (seg.type === 'scene') {
      const v = view(seg.i, SCENES[seg.i].state(p, tall()));
      const P = paintings[seg.i];
      e.setDest('id', null);
      e.draw({ ...base, texA: P.tex, sizeA: P.size, camA: v.cam, fxA: v.fx, gainA: v.gain, focA: v.focus, textA: seg.i, fill: fillOf(seg.i) });
      placeCursor(...v.focus);
      caption(seg.i, p, 1);
      setText(typeEl, '');
      rail(t, seg.i);
    } else if (seg.type === 'trans') {
      const A = seg.a >= 0 ? view(seg.a, SCENES[seg.a].state(1, tall())) : null;
      const B = seg.b >= 0 ? view(seg.b, SCENES[seg.b].state(0, tall())) : null;
      const focA = A ? A.focus : seg.from != null ? view(seg.from, SCENES[seg.from].state(1, tall())).focus : bootPoint();
      const focB = B ? B.focus : focA;
      const mapped = seg.kind === KIND.flow || seg.kind === KIND.swirl;
      e.setDest(mapped ? `d${index}` : 'id', mapped && A && B ? destFor(index, seg.a, seg.b, A, B, e) : null);
      const PA = seg.a >= 0 ? paintings[seg.a] : null;
      const PB = seg.b >= 0 ? paintings[seg.b] : null;
      e.draw({
        ...base,
        kind: seg.kind,
        u: p,
        texA: PA?.tex ?? null,
        texB: PB?.tex ?? null,
        sizeA: PA?.size ?? [1, 1],
        sizeB: PB?.size ?? [1, 1],
        camA: A?.cam ?? blank,
        camB: B?.cam ?? blank,
        fxA: A?.fx ?? base.fxA,
        fxB: B?.fx ?? base.fxB,
        gainA: A?.gain ?? [1, 1],
        gainB: B?.gain ?? [1, 1],
        focA,
        focB,
        aux: B?.aux ?? focB,
        grid: seg.kind === KIND.prompt ? promptGrid(p) : undefined,
        textA: seg.a,
        textB: seg.b,
        fill: fillOf(seg.a === CARD || seg.b === CARD ? CARD : -1),
      });
      if (seg.kind === KIND.prompt) {
        // The cursor walks to its pick (the bottom-right candidate), then rides the upscale, so it
        // ends exactly on the next scene's focus.
        const [gx, gy, gz] = promptGrid(p);
        const W = window.innerWidth;
        const H = window.innerHeight;
        const pick: V2 = [(0.5 + (0.5 + focB[0] / W / 2 - gx) * gz) * W, (0.5 + (0.5 + focB[1] / H / 2 - gy) * gz) * H];
        const m = smooth(clamp(p / 0.55));
        placeCursor(focA[0] + (pick[0] - focA[0]) * m, focA[1] + (pick[1] - focA[1]) * m);
      } else {
        // Writing the last line, the cursor stays put while the glyphs pour out of it, then goes
        // to the end of what it wrote.
        const m = smooth(clamp(seg.kind === KIND.warp ? (p - 0.35) / 0.4 : seg.from != null ? (p - 0.45) / 0.55 : p));
        placeCursor(focA[0] + (focB[0] - focA[0]) * m, focA[1] + (focB[1] - focA[1]) * m);
      }
      // The cursor swells as history arrives in it and gives that back as it writes.
      if (seg.kind === KIND.inhale) pulse = 0.7 * smooth(clamp((p - 0.3) / 0.55));
      else if (seg.from != null) pulse = 0.7 * (1 - smooth(clamp(p / 0.6)));
      if (seg.a >= 0) caption(seg.a, 1, clamp(1 - p * 3));
      else fadeCaption(0);
      if (seg.kind === KIND.diffuse) {
        status = p < 0.5 ? `> add_noise  σ = ${(smooth(clamp(p / 0.5))).toFixed(2)}` : `> denoise  step ${String(Math.min(24, Math.floor(((p - 0.5) / 0.5) * 24) + 1)).padStart(2, '0')}/24`;
      } else if (seg.kind === KIND.latent) {
        status = `> z = slerp(z₀, z₁, ${p.toFixed(2)})`;
      } else if (seg.kind === KIND.prompt) {
        // The prompt behind this picture was never published, so it is typed as redacted blocks.
        const typed = '█'.repeat(Math.round(clamp(p / 0.15) * 14));
        const step = Math.floor(clamp((p - 0.16) / 0.44) * 6 + 1e-4);
        if (p < 0.16) status = `> /imagine ${typed}`;
        else if (p < 0.62) status = `> /imagine ${typed}  (${Math.round((step / 6) * 100)}%)`;
        else status = p < 0.7 ? '> U4' : '> U4  upscaling';
      }
      setText(typeEl, '');
      rail(t, seg.b >= 0 ? (p < 0.5 ? seg.a : seg.b) : seg.a);
    }
    cursorEl.style.setProperty('--g-s', (1 + pulse).toFixed(3));
    setText(statusEl, paused ? '‖ paused' : status);
  }

  // ── clock ──
  let t = 0;
  let target = 0;
  let paused = false;
  let lastInput = -1e9;
  let lastFrame = performance.now();
  let interacted = false;
  const AUTOPLAY_RESUME = 2200;
  const AUTOPLAY_RATE = 1.15;

  function nudge(dt: number) {
    if (!started || finished) return;
    target = clamp(target + dt, 0, TOTAL);
    lastInput = performance.now();
    if (!interacted) {
      interacted = true;
      hintEl.classList.add('gone');
    }
  }

  function frame(now: number) {
    if (finished) return;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (started) {
      if (!paused && now - lastInput > AUTOPLAY_RESUME) target = Math.min(TOTAL, target + dt * AUTOPLAY_RATE);
      t += (target - t) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - t) < 1e-4) t = target;
      render(t, now);
      if (t >= TOTAL - 0.002) {
        finish(false);
        return;
      }
    }
    requestAnimationFrame(frame);
  }

  // ── input ──
  const onWheel = (ev: WheelEvent) => {
    ev.preventDefault();
    const k = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? window.innerHeight : 1;
    nudge(ev.deltaY * k * 0.0045);
  };
  let touchY: number | null = null;
  const onTouchStart = (ev: TouchEvent) => {
    touchY = ev.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (ev: TouchEvent) => {
    ev.preventDefault();
    const y = ev.touches[0]?.clientY;
    if (touchY == null || y == null) return;
    nudge((touchY - y) * 0.012);
    touchY = y;
  };
  const onKey = (ev: KeyboardEvent) => {
    if (finished) return;
    if (ev.key === 'Escape' || ev.key === 'Enter') {
      ev.preventDefault();
      finish(true);
    } else if (ev.key === ' ') {
      ev.preventDefault();
      paused = !paused;
      lastInput = 0;
    } else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight' || ev.key === 'PageDown') {
      ev.preventDefault();
      nudge(1.5);
    } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' || ev.key === 'PageUp') {
      ev.preventDefault();
      nudge(-1.5);
    }
  };
  const onResize = () => {
    if (engine?.resize()) destCache.clear();
    // The closing line is laid out for the screen's shape; redo it when that changes.
    if (engine && paintings[CARD] && cardShape !== `${tall()}:${(window.innerWidth / window.innerHeight).toFixed(1)}`) {
      engine.gl.deleteTexture(paintings[CARD].tex);
      paintings[CARD] = makeCard();
    }
  };
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('touchstart', onTouchStart, { passive: true });
  root.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  skipEl.addEventListener('click', () => finish(true));

  // ── hand-off to the homepage ──
  async function finish(skipped: boolean) {
    if (finished) return;
    finished = true;
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {}
    root!.removeEventListener('wheel', onWheel);
    root!.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);

    root!.classList.add('closing');
    const first = document.querySelector<HTMLElement>('main > .cmd');
    if (first && !skipped) {
      const r = first.getBoundingClientRect();
      setText(typeEl, '');
      cursorEl.classList.add('fly');
      placeCursor(r.left + 6, r.top + r.height / 2);
    }
    await sleep(skipped ? 250 : 800);
    await reveal(skipped);
    root!.remove();
  }

  async function reveal(fast: boolean) {
    const main = document.querySelector('main');
    const blocks = [
      document.querySelector<HTMLElement>('header.site'),
      ...(main ? [...main.children] : []).filter((el): el is HTMLElement => el instanceof HTMLElement && el.id !== 'genesis'),
      document.querySelector<HTMLElement>('footer.site'),
    ].filter((el): el is HTMLElement => !!el);
    blocks.forEach((el) => el.classList.add('g-pre'));
    html.classList.remove('genesis-pending');
    root!.style.opacity = '0';
    let hurry = fast;
    const rush = () => (hurry = true);
    window.addEventListener('wheel', rush, { once: true, passive: true });
    window.addEventListener('pointerdown', rush, { once: true });
    window.addEventListener('keydown', rush, { once: true });
    for (const el of blocks) {
      if (!hurry && el.classList.contains('cmd')) {
        const saved = el.innerHTML;
        const text = el.textContent ?? '';
        el.textContent = '';
        el.classList.remove('g-pre');
        for (let i = 1; i <= text.length && !hurry; i++) {
          el.textContent = text.slice(0, i);
          await sleep(16);
        }
        el.innerHTML = saved;
      } else {
        el.classList.add('g-in');
        if (!hurry) await sleep(70);
      }
    }
    await sleep(600);
    blocks.forEach((el) => el.classList.remove('g-pre', 'g-in'));
  }

  // ── loading ──
  async function load() {
    const bar = (f: number) => {
      const n = 18;
      const k = Math.round(f * n);
      const head = k > 0 && k < n ? '>' : '';
      return ` loading genesis  [${'='.repeat(Math.max(0, k - (head ? 1 : 0)))}${head}${' '.repeat(n - k)}] ${String(Math.round(f * 100)).padStart(3, ' ')}%`;
    };
    let shown = 0;
    let real = 0;
    const t0 = performance.now();
    let barDone = false;
    // A timer, not rAF: rAF stalls in background tabs and the boot would never finish.
    const tick = () => {
      // Never faster than ~1.4 s so the boot reads as a boot.
      const cap = clamp((performance.now() - t0) / 1400);
      shown += (Math.min(real, cap) - shown) * 0.25;
      if (Math.min(real, cap) - shown < 0.004) shown = Math.min(real, cap);
      if (!barDone) setText(typeEl, bar(shown));
    };
    setText(typeEl, bar(0));
    const timer = setInterval(tick, 33);

    try {
      await Promise.race([document.fonts.load(`500 40px ${FONT}`), sleep(1500)]);
    } catch {}
    engine = Engine.create(
      canvas,
      FONT,
      SCENES.map((sc) => sc.text ?? ''),
    );
    if (!engine) throw new Error('WebGL2 unavailable');
    engine.colsHint = debugCols;
    engine.resize();
    engine.clear();
    real = 0.08;

    let done = 0;
    const pictures = SCENES.filter((s) => s.src);
    const imgs = await Promise.all(
      pictures.map((s) =>
        loadImage(s.src).then((img) => {
          done++;
          real = 0.08 + 0.92 * (done / pictures.length);
          return img;
        }),
      ),
    );
    for (const img of imgs) {
      const w = 200;
      const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0, w, h);
      paintings.push({
        tex: engine.texture(img),
        size: [img.naturalWidth, img.naturalHeight],
        aspect: img.naturalWidth / img.naturalHeight,
        thumb: ctx.getImageData(0, 0, w, h),
      });
    }
    paintings[CARD] = makeCard();
    real = 1;
    while (shown < 1) await sleep(30);
    barDone = true;
    clearInterval(timer);
    setText(typeEl, bar(1));
    await sleep(250);
    // Backspace the boot line until only >_ is left.
    const full = typeEl.textContent ?? '';
    for (let i = full.length; i >= 0; i -= 2) {
      setText(typeEl, full.slice(0, i));
      await sleep(8);
    }
    setText(typeEl, '');
    root!.classList.add('running');
    started = true;
    if (Number.isFinite(debugT)) {
      t = target = clamp(debugT, 0, TOTAL);
      paused = true;
    }
    (window as unknown as { __genesisSeek?: (s: number) => void }).__genesisSeek = (s: number) => {
      t = target = clamp(s, 0, TOTAL);
      paused = true;
    };
    lastFrame = performance.now();
    setTimeout(() => !interacted && hintEl.classList.add('gone'), 9000);
  }

  railItems.forEach((li, i) =>
    li.addEventListener('click', () => {
      nudge(SCENE_START[i] + 0.01 - target);
    }),
  );

  requestAnimationFrame(frame);
  load().catch((err) => {
    console.warn('[genesis] skipped:', err);
    finished = true;
    html.classList.remove('genesis-pending');
    root.remove();
  });
}

export { SEGMENTS };
