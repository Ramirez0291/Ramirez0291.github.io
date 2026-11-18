/* Bowerbird — generators. terrain(g, {w,h,seed,cell,levels,index}) draws contour lines; panels(g, {w,h,seed,unit,gap}) draws a modular alloy panel wall; scratches(g, {w,h,seed,n}) draws fine 45° scratch marks. */
(function () {
  function rng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function field(seed, w, h) {
    var r = rng(seed), bl = [], m = Math.max(w, h);
    for (var i = 0; i < 8; i++) bl.push({ x: r() * w, y: r() * h, s: (0.14 + r() * 0.26) * m, a: (r() < 0.25 ? -1 : 1) * (0.5 + r()) });
    return function (x, y) {
      var v = 0;
      for (var i = 0; i < bl.length; i++) { var b = bl[i], dx = x - b.x, dy = y - b.y; v += b.a * Math.exp(-(dx * dx + dy * dy) / (b.s * b.s)); }
      return v + 0.07 * Math.sin(x / 37 + y / 53) + 0.04 * Math.sin(x / 19 - y / 23);
    };
  }
  function terrain(target, o) {
    o = o || {};
    var w = o.w || 960, h = o.h || 540, c = o.cell || 8, n = o.levels || 14, idx = o.index || 5;
    var f = field(o.seed || 8, w, h), cols = Math.ceil(w / c) + 1, rows = Math.ceil(h / c) + 1, g = [], mn = 1e9, mx = -1e9, i, j;
    for (j = 0; j < rows; j++) { g[j] = []; for (i = 0; i < cols; i++) { var v = f(i * c, j * c); g[j][i] = v; if (v < mn) mn = v; if (v > mx) mx = v; } }
    for (var k = 1; k <= n; k++) {
      var L = mn + (mx - mn) * k / (n + 1), d = '';
      for (j = 0; j < rows - 1; j++) for (i = 0; i < cols - 1; i++) {
        var a = g[j][i], b = g[j][i + 1], cc = g[j + 1][i + 1], dd = g[j + 1][i], p = [];
        if ((a < L) !== (b < L)) p.push((i + (L - a) / (b - a)) * c, j * c);
        if ((b < L) !== (cc < L)) p.push((i + 1) * c, (j + (L - b) / (cc - b)) * c);
        if ((dd < L) !== (cc < L)) p.push((i + (L - dd) / (cc - dd)) * c, (j + 1) * c);
        if ((a < L) !== (dd < L)) p.push(i * c, (j + (L - a) / (dd - a)) * c);
        for (var q = 0; q + 3 < p.length; q += 4) d += 'M' + p[q].toFixed(1) + ' ' + p[q + 1].toFixed(1) + 'L' + p[q + 2].toFixed(1) + ' ' + p[q + 3].toFixed(1);
      }
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', k % idx === 0 ? 'bb-contour-index' : 'bb-contour');
      target.appendChild(path);
    }
    return { min: mn, max: mx, at: f };
  }
  function panels(target, o) {
    o = o || {};
    var w = o.w || 960, h = o.h || 288, u = o.unit || 48, gap = o.gap || 4, r = rng(o.seed || 4);
    var cols = Math.floor(w / u), rows = Math.floor(h / u), used = [], sizes = [[3, 2], [2, 2], [2, 1], [1, 2], [1, 1]], NS = 'http://www.w3.org/2000/svg';
    function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); target.appendChild(e); }
    for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
      if (used[j * cols + i]) continue;
      var s = null, st = Math.floor(r() * sizes.length);
      for (var k = 0; k < sizes.length && !s; k++) {
        var c = sizes[(st + k) % sizes.length], ok = i + c[0] <= cols && j + c[1] <= rows;
        for (var y = 0; ok && y < c[1]; y++) for (var x = 0; x < c[0]; x++) if (used[(j + y) * cols + i + x]) ok = false;
        if (ok) s = c;
      }
      for (var yy = 0; yy < s[1]; yy++) for (var xx = 0; xx < s[0]; xx++) used[(j + yy) * cols + i + xx] = 1;
      var q = r(), cls = q < 0.48 ? 'bb-panel' : q < 0.7 ? 'bb-panel-mass' : q < 0.88 ? 'bb-panel-open' : 'bb-panel-perf';
      if (s[0] * s[1] === 1 && r() < 0.3) cls = 'bb-panel-signal';
      var px = i * u + gap / 2, py = j * u + gap / 2, pw = s[0] * u - gap, ph = s[1] * u - gap;
      if (cls === 'bb-panel-signal') { px += 2; py += 2; pw -= 4; ph -= 4; }
      el('rect', { x: px, y: py, width: pw, height: ph, 'class': cls });
      if (cls === 'bb-panel' || cls === 'bb-panel-mass') [[6, 6], [pw - 6, 6], [6, ph - 6], [pw - 6, ph - 6]].forEach(function (b) { el('circle', { cx: px + b[0], cy: py + b[1], r: 1.6, 'class': 'bb-bolt' }); });
    }
  }
  function scratches(target, o) {
    o = o || {};
    var w = o.w || 960, h = o.h || 540, n = o.n || 60, r = rng(o.seed || 9), d = '';
    for (var i = 0; i < n; i++) {
      var x = r() * w, y = r() * h, len = 12 + r() * r() * 220, a = (r() < 0.8 ? 45 : -45) + (r() - 0.5) * 7, t = a * Math.PI / 180;
      d += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l' + (Math.cos(t) * len).toFixed(1) + ' ' + (Math.sin(t) * len).toFixed(1);
    }
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); p.setAttribute('class', 'bb-scratch'); target.appendChild(p);
  }
  window.Bowerbird = { rng: rng, terrain: terrain, panels: panels, scratches: scratches };
})();
