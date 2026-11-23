// Client side of /lab/ai-native/: keeps the answers, scores them, draws the matrix and the report.
// The questionnaire markup is rendered by the page; this script only reads and decorates it.
import {
  AGGRESSIVE, EXAMPLE, LEVELS, OVERREACH, PENALTY_RATE, QUADS, REFS, STAB_TAGS, STORAGE_KEY, TRAP_GROUPS, WARN_BAND,
  X_ITEMS, Y_ITEMS, Z_QS, type Content,
} from '../data/ai-native';

type State = {
  scores: Record<string, number>;
  evid: Record<string, boolean>;
  traps: Record<string, boolean>;
  z: Record<string, boolean>;
  example: boolean;
};
type Tone = 'ok' | 'warn' | 'danger' | 'info';

const root = document.querySelector<HTMLElement>('[data-ain]');
if (root) init(root);

function init(root: HTMLElement) {
  const { c, showTag } = JSON.parse(document.getElementById('ain-data')!.textContent!) as { c: Content; showTag: boolean };
  const ALL = [...Y_ITEMS, ...X_ITEMS];
  const TRAPS = TRAP_GROUPS.flatMap((g) => g.items);
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
  const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const code = (id: string) => id.toUpperCase();
  const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
  const empty = (): State => ({ scores: Object.fromEntries(ALL.map((i) => [i.id, 0])), evid: {}, traps: {}, z: {}, example: false });

  let S: State;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    S = raw ? JSON.parse(raw) : null;
  } catch {
    S = null as unknown as State;
  }
  if (!S || !S.scores) S = clone(EXAMPLE) as State;
  S.evid ??= {}; S.traps ??= {}; S.z ??= {};
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch {} };

  // ---------- scoring ----------
  function compute() {
    const it: Record<string, { raw: number; lv: number; clv: number; capped: boolean; hits: number; score: number; cscore: number; w: number }> = {};
    for (const i of ALL) {
      const raw = S.scores[i.id] ?? 0;
      let lv = raw, capped = false;
      // Production depth only counts as far as the guardrails reach.
      if (i.id === 'y4' && (S.scores.y5 ?? 0) < 2 && lv > 2) { lv = 2; capped = true; }
      const hits = TRAPS.filter((t) => t.link === i.id && S.traps[t.id] === true).length;
      const down = (S.evid[i.id] ? 0 : 1) + (hits ? 1 : 0);
      const clv = Math.max(0, lv - down);
      it[i.id] = { raw, lv, clv, capped, hits, w: i.w, score: i.w * LEVELS[lv], cscore: i.w * LEVELS[clv] };
    }
    const sum = (arr: readonly { id: string }[], k: 'score' | 'cscore') => arr.reduce((a, i) => a + it[i.id][k], 0);
    const Y = sum(Y_ITEMS, 'score'), X = sum(X_ITEMS, 'score');
    const Yc = sum(Y_ITEMS, 'cscore'), Xc = sum(X_ITEMS, 'cscore');
    // Only the aggressive items are measured against the foundation, so shoring up
    // governance, knowledge or measurement (Y1, Y2, Y5, Y6) can never lower the score.
    // A measures how far AI has actually been pushed, so it uses the raw self-rating: the Y4 cap and the
    // evidence/anti-pattern downgrades must not let a company with weak guardrails escape the overreach check.
    const aggrMax = AGGRESSIVE.reduce((a, id) => a + it[id].w, 0);
    const A = (100 * AGGRESSIVE.reduce((a, id) => a + it[id].w * LEVELS[it[id].raw], 0)) / aggrMax;
    const total = (x: number, y: number) => {
      const pen = Math.max(0, PENALTY_RATE * (A - x - OVERREACH));
      return { pen, score: Math.max(0, 0.5 * x + 0.5 * y - pen) };
    };
    const T = total(X, Y), Tc = total(Xc, Yc);
    const pos = (X >= 60 ? (Y >= 60 ? 'tr' : 'br') : (Y >= 60 ? 'tl' : 'bl')) as Exclude<keyof typeof QUADS, 'mirage'>;
    const over = A - X;
    const quad: keyof typeof QUADS = over > OVERREACH ? 'mirage' : pos;
    const L = (k: string) => S.scores[k] ?? 0;
    const k = c.consistency;
    const cons: [Tone, string, string][] = [];
    if (it.y4.capped) cons.push(['warn', k.capTitle, k.cap]);
    if (L('y3') >= 3 && L('x2') <= 1) cons.push(['warn', k.y3x2Title, k.y3x2]);
    if (L('y2') >= 3 && L('x1') <= 1) cons.push(['warn', k.y2x1Title, k.y2x1]);
    if (L('y4') >= 3 && L('x3') <= 1) cons.push(['warn', k.y4x3Title, k.y4x3]);
    if (L('y4') >= 3 && L('y1') <= 1) cons.push(['danger', k.y4y1Title, k.y4y1]);
    const yes = Z_QS.filter((q) => S.z[q.id] === true).length;
    const ans = Z_QS.filter((q) => S.z[q.id] !== undefined).length;
    const sk: 'ok' | 'warn' | 'danger' = yes >= 5 ? 'ok' : yes >= 3 ? 'warn' : 'danger';
    const stab = { k: sk, name: c.stabNames[sk], tag: STAB_TAGS[sk], r: { ok: 12, warn: 24, danger: 38 }[sk], yes, ans };
    return { it, X, Y, Xc, Yc, A, T, Tc, pos, quad, gap: over, cons, stab };
  }
  type Result = ReturnType<typeof compute>;

  // ---------- inputs ----------
  function syncInputs() {
    for (const i of ALL) {
      const el = $<HTMLInputElement>(`s-${i.id}-${S.scores[i.id] ?? 0}`);
      if (el) el.checked = true;
      $<HTMLInputElement>(`e-${i.id}`).checked = !!S.evid[i.id];
    }
    const yn = (prefix: string, v: boolean | undefined) => {
      $<HTMLInputElement>(`${prefix}-y`).checked = v === true;
      $<HTMLInputElement>(`${prefix}-n`).checked = v === false;
    };
    for (const t of TRAPS) yn(`t-${t.id}`, S.traps[t.id]);
    for (const q of Z_QS) yn(`z-${q.id}`, S.z[q.id]);
  }

  root.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    const n = el.name || '', id = el.id || '';
    if (n.startsWith('s-')) S.scores[n.slice(2)] = +el.value;
    else if (id.startsWith('e-')) S.evid[id.slice(2)] = el.checked;
    else if (n.startsWith('t-')) S.traps[n.slice(2)] = el.value === 'y';
    else if (n.startsWith('z-')) S.z[n.slice(2)] = el.value === 'y';
    else return;
    S.example = false;
    save();
    update();
  });

  // ---------- matrix ----------
  const PX = (v: number) => 44 + v * 3.4, PY = (v: number) => 356 - v * 3.4;
  function matrixSVG(r: Result) {
    const g = c.gauge, qn = c.quads;
    const ticks = [0, 20, 40, 60, 80, 100].map((v) =>
      `<text x="${PX(v)}" y="374" text-anchor="middle" class="tick">${v}</text><text x="36" y="${PY(v) + 3}" text-anchor="end" class="tick">${v}</text>`).join('');
    const op = (k: string) => (k === r.pos ? 1 : 0.45);
    const quad = (k: string, x: number, y: number, w: number, h: number) =>
      `<rect x="${PX(x)}" y="${PY(y)}" width="${3.4 * w}" height="${3.4 * h}" class="q q-${k}" opacity="${op(k)}"/>`;
    const mirage = r.quad === 'mirage';
    // Keep the overreach label inside the frame whichever corner the point sits in.
    const lx = PX(r.X) + (r.X > 60 ? -14 : 14), ly = PY(r.Y) + (r.Y > 85 ? 22 : -14);
    return `
      ${quad('tl', 0, 100, 60, 40)}${quad('tr', 60, 100, 40, 40)}${quad('bl', 0, 60, 60, 60)}${quad('br', 60, 60, 40, 60)}
      <line x1="${PX(60)}" y1="${PY(0)}" x2="${PX(60)}" y2="${PY(100)}" class="mid"/>
      <line x1="${PX(0)}" y1="${PY(60)}" x2="${PX(100)}" y2="${PY(60)}" class="mid"/>
      <rect x="${PX(0)}" y="${PY(100)}" width="340" height="340" class="frame"/>
      <g class="qname">
        <text x="${PX(2)}" y="${PY(96)}">${esc(qn.tl.name)}</text>
        <text x="${PX(98)}" y="${PY(96)}" text-anchor="end">${esc(qn.tr.name)}</text>
        <text x="${PX(2)}" y="${PY(3)}">${esc(qn.bl.name)}</text>
        <text x="${PX(98)}" y="${PY(3)}" text-anchor="end">${esc(qn.br.name)}</text>
      </g>
      ${ticks}
      <text x="${PX(50)}" y="393" text-anchor="middle" class="axis">${esc(g.axisX)}</text>
      <text x="12" y="${PY(50)}" text-anchor="middle" class="axis" transform="rotate(-90 12 ${PY(50)})">${esc(g.axisY)}</text>
      ${REFS.map((p) => `<circle cx="${PX(p.x)}" cy="${PY(p.y)}" r="4" class="ref"/><text x="${PX(p.x) - 7}" y="${PY(p.y) + 4}" text-anchor="end" class="ref-label">${esc(p.name + g.refSuffix)}</text>`).join('')}
      <line x1="${PX(r.X)}" y1="${PY(r.Y)}" x2="${PX(r.Xc)}" y2="${PY(r.Yc)}" class="drift"/>
      <circle class="pt checked" cx="${PX(r.Xc)}" cy="${PY(r.Yc)}" r="6"/>
      <circle class="pt halo" cx="${PX(r.X)}" cy="${PY(r.Y)}" r="${r.stab.r}"/>
      <circle class="pt self${mirage ? ' over' : ''}" cx="${PX(r.X)}" cy="${PY(r.Y)}" r="8"/>
      ${mirage ? `<text x="${lx}" y="${ly}" text-anchor="${r.X > 60 ? 'end' : 'start'}" class="over-label">${esc(qn.mirage.name)}</text>` : ''}`;
  }

  // ---------- render ----------
  const flag = (tone: Tone, text: string) => `<span class="flag ${tone}">${esc(text)}</span>`;
  function gapState(g: number): Tone { return g > OVERREACH ? 'danger' : g > WARN_BAND ? 'warn' : 'ok'; }

  function update() {
    syncInputs();
    const r = compute();
    for (const i of ALL) {
      const d = r.it[i.id];
      $(`pts-${i.id}`).textContent = String(r1(d.score));
      root.querySelectorAll<HTMLElement>(`#card-${i.id} .anchor`).forEach((a) => {
        const n = +a.dataset.a!;
        a.classList.toggle('on', (n === 0 && d.raw === 0) || (n === 1 && d.raw >= 1 && d.raw <= 3) || (n === 2 && d.raw === 4));
      });
      const f: string[] = [];
      if (d.capped) f.push(flag('warn', c.item.flagCapped));
      if (d.hits) f.push(flag('danger', fill(c.item.flagHits, { n: d.hits })));
      if (!S.evid[i.id]) f.push(flag('info', c.item.flagNoEvidence));
      $(`f-${i.id}`).innerHTML = f.join(' ');
    }
    for (const t of TRAPS) $(`trap-${t.id}`).classList.toggle('hit', S.traps[t.id] === true);
    for (const q of Z_QS) $(`zq-${q.id}`).classList.toggle('hit', S.z[q.id] === false);
    const ansT = TRAPS.filter((t) => S.traps[t.id] !== undefined).length;
    const hitT = TRAPS.filter((t) => S.traps[t.id] === true).length;
    $('cnt-y').textContent = String(r1(r.Y));
    $('cnt-x').textContent = String(r1(r.X));
    $('cnt-t').textContent = fill(c.trap.tabCount, { hit: hitT, ans: ansT });
    $('cnt-z').textContent = `${r.stab.yes}/6`;

    const gs = gapState(r.gap);
    $('g-score').innerHTML = `${r1(r.T.score)}<small>/100</small>`;
    $('g-x').textContent = String(r1(r.X));
    $('g-y').textContent = String(r1(r.Y));
    const gEl = $('g-gap');
    gEl.textContent = (r.gap > 0 ? '+' : '') + r1(r.gap);
    gEl.dataset.tone = gs;
    // Aggressiveness meter: A against the foundation X, with the red line at X + OVERREACH.
    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    $('m-x').style.width = `${clamp(r.X)}%`;
    $('m-a').style.width = `${clamp(r.A)}%`;
    $('m-a').dataset.tone = gs;
    $('m-line').style.left = `${clamp(r.X + OVERREACH)}%`;
    $('m-xv').textContent = String(r1(r.X));
    $('m-av').textContent = String(r1(r.A));
    const Q = c.quads[r.quad], QT = QUADS[r.quad];
    $('g-quad').innerHTML = `${esc(Q.name)} ${showTag ? flag(QT.tone, QT.tag) : ''}`;
    $('matrix').innerHTML = matrixSVG(r);

    const al = c.alerts;
    const list: [Tone, string, string][] = [];
    if (r.T.pen > 0) list.push(['danger', al.penTitle, al.pen]);
    else if (gs === 'warn') list.push(['warn', al.warnTitle, al.warn]);
    else list.push(['ok', al.okTitle, al.ok]);
    if (r1(r.T.score - r.Tc.score) >= 8) list.push(['warn', al.dropTitle, al.drop]);
    list.push([r.stab.k, fill(al.stabTitle, { name: r.stab.name }),
      fill(al.stab, { yes: r.stab.yes, unfinished: r.stab.ans < 6 ? al.unfinished : '' })]);
    r.cons.forEach((x) => list.push(x));
    $('g-alerts').innerHTML = list.slice(0, 5)
      .map(([t, b, s]) => `<div class="alert ${t}"><b>${esc(b)}</b> ${esc(s)}</div>`).join('');
    renderReport(r);
  }

  function renderReport(r: Result) {
    const R = c.report, Q = c.quads[r.quad], QT = QUADS[r.quad];
    const name = (id: string) => c.items[id as keyof Content['items']].name;
    const gaps = ALL.map((i) => ({ i, loss: i.w * (1 - LEVELS[r.it[i.id].lv]) }))
      .filter((x) => x.loss > 0).sort((a, b) => b.loss - a.loss).slice(0, 3);
    const hits = TRAPS.filter((t) => S.traps[t.id] === true);
    const missingZ = Z_QS.filter((q) => S.z[q.id] !== true);
    const bar = (i: { id: string; w: number }) => {
      const d = r.it[i.id];
      return `<div class="bar"><span>${code(i.id)} ${esc(name(i.id))}</span><div class="track"><div class="fill" style="width:${LEVELS[d.lv] * 100}%"></div><div class="cons" style="width:${LEVELS[d.clv] * 100}%"></div></div><span class="v">${r1(d.score)}/${i.w}</span></div>`;
    };
    const card = (label: string, body: string) => `<section class="card"><span class="label">[${label}]</span>${body}</section>`;
    $('report').innerHTML = [
      card('quadrant', `<div class="eyebrow">${esc(R.quadEyebrow)}</div>
        <h3>${esc(Q.name)} ${showTag ? flag(QT.tone, QT.tag) : ''}</h3><p>${esc(Q.desc)}</p>
        ${r.quad === 'mirage' ? `<p class="override">${esc(fill(R.overrideNote, { zone: c.quads[r.pos].name, o: r1(r.gap) }))}</p>` : ''}
        <ol>${Q.rx.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`),
      card('stability', `<div class="eyebrow">${esc(R.stabEyebrow)}</div>
        <h3>${esc(r.stab.name)} ${showTag ? flag(r.stab.k, r.stab.tag) : ''} <span class="mono dim">${r.stab.yes}/6</span></h3>
        <p>${esc(c.stabText[r.stab.k])}</p>
        ${missingZ.length ? `<ul>${missingZ.map((q) => { const z = c.zqs[q.id]; return `<li><b>${esc(z.t)}</b>${S.z[q.id] === undefined ? esc(R.unanswered) : ''}: ${esc(z.why)}</li>`; }).join('')}</ul>` : ''}`),
      card('gaps', `<h3>${esc(R.gapsTitle)}</h3>
        ${gaps.length ? `<ol>${gaps.map((g) => {
          const next = c.items[g.i.id as keyof Content['items']].a[Math.min(2, Math.floor((r.it[g.i.id].lv + 2) / 2))];
          return `<li><b>${code(g.i.id)} ${esc(name(g.i.id))}</b>: ${esc(fill(R.gapLine, { loss: r1(g.loss), next }))}</li>`;
        }).join('')}</ol>` : `<p>${esc(R.allFull)}</p>`}`),
      `<div class="two">${card('y', `<h3>${esc(R.yDetail)}</h3><div class="bars">${Y_ITEMS.map(bar).join('')}</div>`)}${card('x', `<h3>${esc(R.xDetail)}</h3><div class="bars">${X_ITEMS.map(bar).join('')}</div>`)}</div>
       <p class="bar-legend"><span><i class="k-self"></i>${esc(R.barLegendSelf)}</span><span><i class="k-cons"></i>${esc(R.barLegendChecked)}</span></p>`,
      r.cons.length ? card('consistency', `<h3>${esc(R.consTitle)}</h3><ul>${r.cons.map(([t, b, s]) => `<li>${flag(t, b)} ${esc(s)}</li>`).join('')}</ul>`) : '',
      card('fix', `<h3>${esc(fill(R.trapsTitle, { n: hits.length }))}</h3>
        ${hits.length ? `<ul>${hits.map((t) => { const x = c.traps[t.id]; return `<li><b>${esc(x.t)}</b> <span class="link-chip">→ ${code(t.link)}</span><br><span class="dim">${esc(x.fix)}</span></li>`; }).join('')}</ul>` : `<p>${esc(R.noTraps)}</p>`}`),
    ].join('');
  }

  function summaryText() {
    const r = compute(), Q = c.quads[r.quad], m = c.summary;
    const lines = [m.title, fill(m.scoreLine, { t: r1(r.T.score), x: r1(r.X), y: r1(r.Y), gap: r1(r.gap) }),
      fill(m.quad, { name: `${Q.name}${showTag ? ' ' + QUADS[r.quad].tag : ''}` })];
    if (r.T.pen > 0) lines.push(m.pen);
    lines.push(fill(m.stab, { name: r.stab.name, yes: r.stab.yes }), '', m.items);
    ALL.forEach((i) => lines.push(`  ${code(i.id)} ${c.items[i.id].name}: ${r1(r.it[i.id].score)}/${i.w}${S.evid[i.id] ? '' : m.noEvidence}`));
    const hits = TRAPS.filter((t) => S.traps[t.id] === true);
    if (hits.length) { lines.push('', m.traps); hits.forEach((t) => lines.push(`  · ${c.traps[t.id].t} → ${c.traps[t.id].fix}`)); }
    lines.push('', m.rx); Q.rx.forEach((x, k) => lines.push(`  ${k + 1}. ${x}`));
    lines.push('', location.href.split('#')[0]);
    return lines.join('\n');
  }

  function toast(msg: string) {
    const t = document.createElement('div');
    t.className = 'ain-toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  $('btn-copy').addEventListener('click', () => {
    const txt = summaryText();
    const fallback = () => {
      let ta = document.getElementById('copy-fallback') as HTMLTextAreaElement | null;
      if (!ta) { ta = document.createElement('textarea'); ta.id = 'copy-fallback'; root.querySelector('.gauge')!.appendChild(ta); }
      ta.value = txt; ta.focus(); ta.select(); toast(c.toast.manual);
    };
    try { navigator.clipboard.writeText(txt).then(() => toast(c.toast.copied), fallback); } catch { fallback(); }
  });
  $('btn-example').addEventListener('click', () => { S = clone(EXAMPLE) as State; save(); update(); toast(c.toast.example); });
  $('btn-reset').addEventListener('click', () => { S = empty(); save(); update(); toast(c.toast.reset); });

  // ---------- tabs ----------
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const select = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')!).hidden = !on;
    });
    // On phones the strip scrolls sideways; keep the selected tab in it.
    const strip = tab.parentElement!;
    if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = tab.offsetLeft - strip.offsetLeft - 16;
    if (focus) tab.focus();
    try { localStorage.setItem(STORAGE_KEY + '-tab', tab.dataset.tab!); } catch {}
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  root.querySelectorAll<HTMLButtonElement>('[data-goto]').forEach((b) =>
    b.addEventListener('click', () => {
      const t = tabs.find((x) => x.dataset.tab === b.dataset.goto);
      if (t) { select(t); root.querySelector('.tabs')!.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }));
  try {
    const saved = localStorage.getItem(STORAGE_KEY + '-tab');
    const t = tabs.find((x) => x.dataset.tab === saved);
    if (t) select(t);
  } catch {}

  root.classList.add('ready');
  update();
}
