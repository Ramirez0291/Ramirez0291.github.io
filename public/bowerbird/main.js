/* Bowerbird — scroll-driven camera. Scroll moves a camera forward along -Z through a row of scenes;
   a gate (an H-Grid frame with a window) sits halfway between each pair. */
(function () {
  var B = window.Bowerbird, NS = 'http://www.w3.org/2000/svg';
  var P = 1000;            // perspective, px (matches --P)
  var D = 2400;            // distance between scenes along Z, px
  var SEG = 1.6;           // scroll length per scene, in viewport heights
  var DWELL = 0.28;        // share of each segment the camera holds still on a scene

  var SC = [
    { no: '00', name: 'Arrival',   theme: 'sonar', x: 0,   y: 0,   coord: "47°16'N 11°24'E · GREIFENHORST WORKS" },
    { no: '01', name: 'Doctrine',  theme: 'sonar', x: -14, y: 6,   coord: "47°16'N 11°24'E · FORGE ARCHIVE" },
    { no: '02', name: 'H-Grid',    theme: 'sonar', x: 10,  y: -8,  coord: "BACKPLANE · PITCH 56 MM" },
    { no: '03', name: 'Bunker RD-4', theme: 'dark', x: -12, y: 10, coord: "78°13'N 15°38'E · PERMAFROST" },
    { no: '04', name: 'Arbor M-12', theme: 'sonar', x: 14, y: -4,  coord: "22°33'N 88°17'E · BANYAN GROVE" },
    { no: '05', name: 'Camp-Kit C-6', theme: 'sonar', x: -10, y: -10, coord: "61°29'N 23°46'E · BOREAL FLOOR" },
    { no: '06', name: 'Bower-Unit BU-1', theme: 'dark', x: 12, y: 8, coord: "R 500 M · FORAGE PATTERN" },
    { no: '07', name: 'Field office', theme: 'sonar', x: 0, y: 0,  coord: "DOC BB-WEB-07 · END OF FILE" }
  ];
  var N = SC.length;
  var THEME_NAME = { sonar: 'Sonar Alloy', dark: 'Black Box Dark' };

  var world = document.getElementById('world');
  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  var gates = [];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- generated art ---------- */
  document.querySelectorAll('svg.terrain').forEach(function (s) {
    var g = document.createElementNS(NS, 'g'); s.appendChild(g);
    B.terrain(g, { w: 1600, h: 1000, seed: +s.dataset.seed, levels: 16, cell: 10 });
    var k = document.createElementNS(NS, 'g'); s.appendChild(k);
    B.scratches(k, { w: 1600, h: 1000, seed: +s.dataset.seed + 1, n: 50 });
  });
  (function footwall() {
    var s = document.getElementById('footwall'); s.setAttribute('viewBox', '0 0 1920 384');
    var g = document.createElementNS(NS, 'g'); s.appendChild(g);
    B.panels(g, { w: 1920, h: 384, seed: 11, unit: 48, gap: 4 });
  })();

  /* H-Grid backplane: 10 × 6 slots, modules from the system's HGrid card */
  var MODS = [
    [1, 0, 0, 3, 2, 'st', 'REED-2', '压电簧片百叶', '+180 W'],
    [2, 3, 0, 1, 2, 'm', 'UPLINK-M', '上行天线桅', '−35 W'],
    [3, 4, 0, 2, 1, 'g3', 'VENT-HX', '换热新风', '−12 W'],
    [4, 8, 0, 2, 2, 'm', 'STILL-B', '黑水蒸馏回用', '−90 W'],
    [5, 2, 3, 3, 2, 'm', 'PYRO-SLOT', '储柴点火槽', '−8 W'],
    [6, 6, 2, 2, 4, 'st', 'DOOR-1', '舱门', '—'],
    [7, 0, 4, 2, 2, 'g3', 'SCALE-A', '记忆合金鳞片', '0 W'],
    [8, 9, 5, 1, 1, 'm', 'PERIM-N', '周界节点', '−6 W']
  ];
  (function hgrid() {
    var grid = document.querySelector('#hg-slots .grid'), mods = document.querySelector('#hg-mods .mods');
    var used = {};
    MODS.forEach(function (m) { for (var a = 0; a < m[3]; a++) for (var b = 0; b < m[4]; b++) used[(m[1] + a) + ',' + (m[2] + b)] = 1; });
    for (var j = 0; j < 6; j++) for (var i = 0; i < 10; i++) {
      var d = document.createElement('div'); d.className = 'slot';
      d.style.gridColumn = (i + 1); d.style.gridRow = (j + 1);
      if (used[i + ',' + j]) d.style.borderStyle = 'dashed';
      grid.appendChild(d);
    }
    MODS.forEach(function (m, k) {
      var d = document.createElement('div'); d.className = 'mod ' + m[5];
      d.style.gridColumn = (m[1] + 1) + ' / span ' + m[3]; d.style.gridRow = (m[2] + 1) + ' / span ' + m[4];
      d.style.transitionDelay = (0.15 + k * 0.07) + 's';
      d.innerHTML = '<span class="bb-chip">' + m[0] + '</span>' + (m[3] * m[4] > 1 ? '<span class="nm">' + m[6] + '</span>' : '');
      mods.appendChild(d);
    });
    var t = document.getElementById('hg-table');
    t.innerHTML = MODS.map(function (m) { return '<tr><td>' + m[0] + ' · ' + m[6] + '</td><td>' + m[8] + '</td></tr>'; }).join('');
  })();
  // pin spacing inside a slot depends on slot width
  function slotPins() {
    var s = document.querySelector('#hg-slots .slot'); if (!s) return;
    document.querySelector('#hg-slots').style.setProperty('--sw', Math.max(8, s.clientWidth * 0.56 - 4) + 'px');
  }

  /* ---------- gates ---------- */
  for (var gi = 0; gi < N - 1; gi++) {
    var g = document.createElement('div'); g.className = 'gate off';
    g.innerHTML = '<div class="L"><svg></svg></div>';
    world.appendChild(g); gates.push(g);
  }
  function drawGates(W, H) {
    var c = 72, r = 18, X0 = -W * 1.6, Y0 = -H * 1.6, X1 = W * 2.6, Y1 = H * 2.6;
    function hole(o) { return 'M' + (-o) + ' ' + (-o) + 'H' + (W - c + o * 0.4) + 'L' + (W + o) + ' ' + (c - o * 0.4) + 'V' + (H + o) + 'H' + (c - o * 0.4) + 'L' + (-o) + ' ' + (H - c + o * 0.4) + 'Z'; }
    gates.forEach(function (g, i) {
      var next = SC[i + 1], svg = g.querySelector('svg'), pins = '', k;
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      for (k = 0; k * 28 < W + 200; k++) pins += '<circle class="g-pin" cx="' + (k * 28 - 40) + '" cy="' + (-r - 22) + '" r="2"/>';
      for (k = 0; k * 28 < H + 100; k++) pins += '<circle class="g-pin" cx="' + (W + r + 22) + '" cy="' + (k * 28 + c) + '" r="2"/>';
      var hatch = '';
      for (k = 0; k < Math.min(14, Math.floor((W - 200) / 22)); k++) hatch += '<path class="g-sig" d="M' + (k * 22) + ' ' + (H + r + 12) + 'h11l-14 14h-11z"/>';
      svg.innerHTML =
        '<path class="g-mass" fill-rule="evenodd" d="M' + X0 + ' ' + Y0 + 'H' + X1 + 'V' + Y1 + 'H' + X0 + 'Z' + hole(0) + '"/>' +
        '<path class="g-steel" fill-rule="evenodd" d="' + hole(r) + hole(0) + '"/>' +
        '<path class="g-ring" d="' + hole(r + 8) + '"/>' + pins + hatch +
        '<text class="g-sigt" x="0" y="' + (-r - 44) + '">GATE ' + SC[i].no + ' → ' + next.no + '</text>' +
        '<text class="g-txt" text-anchor="end" x="' + W + '" y="' + (-r - (W < 760 ? 24 : 44)) + '">H-GRID 600 · 48 V · ' + next.coord.split(' · ')[0] + '</text>' +
        '<text class="g-big" x="0" y="' + (H + r + 104) + '">' + next.name.toUpperCase() + '</text>' +
        '<text class="g-txt" text-anchor="end" x="' + W + '" y="' + (H + r + 30) + '">S/N BB-' + next.no + '-1763</text>';
    });
  }

  /* ---------- HUD ---------- */
  var nav = document.getElementById('nav'), segs = document.getElementById('segs');
  SC.forEach(function (s, i) {
    var a = document.createElement('a'); a.href = '#' + s.no; a.dataset.go = i;
    a.innerHTML = '<span class="n">' + s.no + '</span><span class="t bb-label">' + s.name + '</span>';
    nav.appendChild(a);
    if (i < N - 1) segs.appendChild(document.createElement('i'));
  });
  var navA = [].slice.call(nav.children), segI = [].slice.call(segs.children);
  var $ = function (id) { return document.getElementById(id); };
  var elNo = $('now-no'), elName = $('now-name'), elCoord = $('coord'), elState = $('state'), elDepth = $('depth'), elVel = $('vel'),
      elMk = $('mk'), elRd = $('rd'), elBot = $('hudbot'), elTheme = $('theme-name'), track = $('track');

  /* ---------- layout ---------- */
  var VW, VH, segPx, pos = [];
  function layout() {
    VW = Math.max(320, innerWidth); VH = Math.max(320, innerHeight); segPx = VH * SEG;
    track.style.height = ((N - 1) * segPx + VH) + 'px';
    pos = SC.map(function (s, i) { return { x: s.x / 100 * VW, y: s.y / 100 * VH, z: -i * D }; });
    scenes.forEach(function (el, i) { el.style.transform = 'translate3d(' + pos[i].x + 'px,' + pos[i].y + 'px,' + pos[i].z + 'px)'; });
    gates.forEach(function (el, i) {
      var a = pos[i], b = pos[i + 1];
      el.style.transform = 'translate3d(' + ((a.x + b.x) / 2) + 'px,' + ((a.y + b.y) / 2) + 'px,' + ((a.z + b.z) / 2) + 'px)';
    });
    drawGates(VW, VH); slotPins();
  }

  /* ---------- camera ---------- */
  function ease(s) { var t = Math.min(1, Math.max(0, (s - DWELL) / (1 - DWELL))); return t * t * t * (t * (t * 6 - 15) + 10); }
  function camAt(p) {
    var i = Math.min(N - 1, Math.floor(p)), s = p - i, e = i >= N - 1 ? 0 : ease(s), a = pos[i], b = pos[Math.min(N - 1, i + 1)];
    return { u: i + e, x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, z: -(a.z + (b.z - a.z) * e), moving: e > 0.002 && e < 0.998 };
  }

  var cur = 0, last = -1, lastTheme = '', lastNear = -1, velS = 0;
  function target() { return Math.min(N - 1, Math.max(0, scrollY / segPx || 0)); }

  function render(p) {
    var c = camAt(p);
    world.style.transform = 'translate3d(' + (-c.x) + 'px,' + (-c.y) + 'px,' + c.z + 'px)';

    scenes.forEach(function (el, i) {
      var d = i * D - c.z, o;                 // distance in front of the camera
      if (d < -420 || d > 1.7 * D) { el.classList.add('off'); return; }
      el.classList.remove('off');
      if (d < 0) o = Math.max(0, 1 + d / 380);          // flying through
      else if (d > 1.15 * D) o = Math.max(0, (1.7 * D - d) / (0.55 * D)); // emerging from the far end
      else o = 1;
      el.style.setProperty('--o', o.toFixed(3));
      el.classList.toggle('on', d > -60 && d < D * 0.3);
    });
    gates.forEach(function (el, i) {
      var d = (i + 0.5) * D - c.z;
      if (d < -420 || d > 0.62 * D) { el.classList.add('off'); return; }
      el.classList.remove('off');
      el.style.setProperty('--go', (d < 0 ? Math.max(0, 1 + d / 400) : Math.min(1, (0.62 * D - d) / (0.12 * D))).toFixed(3));
    });

    // HUD
    var near = Math.round(c.u);
    if (near !== lastNear) {
      lastNear = near;
      var s = SC[near];
      elNo.textContent = s.no; elName.textContent = s.name.toUpperCase(); elCoord.textContent = s.coord;
      navA.forEach(function (a, i) { a.setAttribute('aria-current', i === near ? 'true' : 'false'); });
      if (s.theme !== lastTheme) { lastTheme = s.theme; document.documentElement.dataset.theme = s.theme; elTheme.textContent = THEME_NAME[s.theme]; }
    }
    segI.forEach(function (el, i) { el.style.setProperty('--f', Math.min(1, Math.max(0, c.u - i)).toFixed(3)); });
    var f = c.u / (N - 1) * 100;
    elMk.style.top = f + '%'; elRd.style.top = 'calc(' + f + '% )';
    elDepth.textContent = String(Math.round(c.z / 10)).padStart(4, '0') + ' M';
    velS += (Math.abs(p - last) * 600 - velS) * 0.2; last = p;
    elVel.textContent = 'V ' + velS.toFixed(1);
    elBot.classList.toggle('moving', c.moving);
    elState.textContent = c.moving ? 'TRANSIT ' + SC[Math.floor(c.u)].no + ' → ' + SC[Math.min(N - 1, Math.floor(c.u) + 1)].no : 'HOLD · ' + SC[near].no;
  }

  function step() {
    var t = target();
    cur += (t - cur) * (reduce ? 1 : 0.085);
    if (Math.abs(t - cur) < 0.0004) cur = t;
    render(cur);
  }
  function loop() { step(); requestAnimationFrame(loop); }

  // navigation: jump to the resting point of a scene
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return;
    e.preventDefault();
    scrollTo({ top: +a.dataset.go * segPx, behavior: reduce ? 'auto' : 'smooth' });
  });
  addEventListener('keydown', function (e) {
    if (e.key !== 'PageDown' && e.key !== 'PageUp' && e.key !== ' ') return;
    e.preventDefault();
    var i = Math.round(target()) + ((e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) ? -1 : 1);
    scrollTo({ top: Math.max(0, Math.min(N - 1, i)) * segPx, behavior: 'smooth' });
  });
  addEventListener('resize', function () { layout(); render(cur); });

  layout();
  var h = location.hash.slice(1), hi = SC.findIndex(function (s) { return s.no === h; });
  if (hi > 0) { scrollTo(0, hi * segPx); cur = hi; }
  render(cur = target());
  requestAnimationFrame(loop);
  setTimeout(function () { document.documentElement.classList.add('ready'); }, 400);
  window.__bb = { step: step, render: render, set: function (p) { scrollTo(0, p * segPx); cur = p; render(p); }, N: N };
})();
