// 落日终端 // 页面脚本。读数跳字、试按、筛查表、主题切换。没有任何网络请求。
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var A = window.STAudio || { setEnabled: function () { return Promise.resolve(false); }, play: function () {}, holdStart: function () {}, holdStop: function () {}, pulse: function () {} };
  // 读数变化时跳字：反色 120 ms，不滑动
  var FLASH = { ports: 1, mass: 1, 'idle-d': 1, 'idle-h': 1 };
  var setLive = function (key, text) {
    document.querySelectorAll('[data-live="' + key + '"]').forEach(function (el) {
      if (el.textContent === text) return;
      el.textContent = text;
      if (reduce || !FLASH[key]) return;
      el.classList.add('is-tick');
      setTimeout(function () { el.classList.remove('is-tick'); }, 120);
    });
  };

  // ---- 固定时间点（UTC） ----
  var COLD_START = Date.UTC(2026, 3, 12, 1, 5, 12);   // 冷启动
  var LAST_KEY = Date.UTC(2026, 7, 8, 16, 0, 0);      // 看护人最后一次键入
  var DAY = 86400000;

  // ---- 读数 ----
  var ports = 1209;
  function tick() {
    var now = Date.now();
    var up = Math.max(0, now - COLD_START);
    setLive('uptime', Math.floor(up / DAY) + ' D ' + pad(Math.floor((up % DAY) / 3600000)) + ' H');
    var idleD = Math.max(100, Math.floor((now - LAST_KEY) / DAY));
    setLive('idle-d', String(idleD));
    setLive('idle-h', fmt(idleD * 24));
    // 距下一次 16:00 UTC
    var d = new Date(now);
    var next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 16, 0, 0);
    if (next <= now) next += DAY;
    var s = Math.floor((next - now) / 1000);
    setLive('hold', pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60));
    var dow = d.getUTCDay(), hr = d.getUTCHours();
    var molting = (dow === 5 && hr >= 23) || (dow === 6 && hr < 4);
    document.documentElement.classList.toggle('is-molting', molting);
    setLive('phase', molting ? 'MOLTING // 蜕皮期 // 她现在不回消息' : 'SUNSET SEQUENCE');
  }
  function drift() {
    // 端口数偶尔 +1，从不减少。生物质量永远是端口数 × 70.0
    if (Math.random() < 0.35) ports += 1;
    setLive('ports', fmt(ports));
    setLive('mass', fmt(ports * 70));
    setLive('coolant', (14.2 + (Math.random() - 0.5) * 0.4).toFixed(1));
    setLive('load', (18.4 + (ports - 1209) * 0.01 + (Math.random() - 0.5) * 0.2).toFixed(1));
  }
  tick();
  setLive('mass', fmt(ports * 70));
  if (!reduce) { setInterval(tick, 1000); setInterval(drift, 4200); }

  // ---- 首屏刻度尺（沿用海报的算法，psy = 78） ----
  var ticks = document.getElementById('ticks');
  if (ticks) {
    var count = 26;
    for (var i = 0; i < count; i++) {
      var r = (i + 1) / count;
      var major = i % 5 === 0 || i === count - 1;
      var h = Math.min(100, Math.round(14 + Math.pow(r, 1.6) * 86));
      var el = document.createElement('i');
      if (major) el.className = 'major';
      el.style.height = (major ? h : Math.round(h * 0.72)) + '%';
      el.style.width = i === count - 1 ? '6px' : (major ? '3px' : '1.5px');
      ticks.appendChild(el);
    }
    if (!reduce) {
      var bars = ticks.children, at = 0;
      setInterval(function () {
        bars[at].classList.remove('is-on');
        at = (at + 1) % bars.length;
        bars[at].classList.add('is-on');
      }, 1000);
    }
  }

  // ---- 声音开关 ----
  var soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      var want = soundBtn.getAttribute('aria-pressed') !== 'true';
      if (!want) A.play('off');
      soundBtn.setAttribute('aria-pressed', String(want));
      soundBtn.textContent = want ? 'SOUND ON' : 'SOUND OFF';
      setTimeout(function () { A.setEnabled(want); }, want ? 0 : 200);
    });
  }
  // 开关声：按钮、导航、FAQ
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('a.st-btn, .st-header__nav a, #theme-toggle') : null;
    if (t) A.play('on');
  });
  document.querySelectorAll('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () { A.play(d.open ? 'on' : 'off'); });
  });

  // ---- 主题 ----
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var root = document.documentElement;
      var toReport = root.getAttribute('data-theme') !== 'report';
      root.setAttribute('data-theme', toReport ? 'report' : 'terminal');
      toggle.textContent = toReport ? 'TERMINAL' : 'REPORT';
      toggle.setAttribute('aria-pressed', String(toReport));
    });
  }

  // ---- 导航当前项 ----
  var links = Array.prototype.slice.call(document.querySelectorAll('.st-header__nav a'));
  if ('IntersectionObserver' in window && links.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }

  // ---- 试按：按住 62.4 秒 ----
  var HOLD_MS = 62400;
  var btn = document.getElementById('hold-btn');
  var card = document.getElementById('hold');
  var countEl = document.getElementById('hold-count');
  var fill = document.getElementById('hold-fill');
  var status = document.getElementById('hold-status');
  var holdStart = 0, holdTimer = null, micro = 0;
  function holdRender() {
    var t = Math.min(HOLD_MS, Date.now() - holdStart);
    countEl.textContent = ((HOLD_MS - t) / 1000).toFixed(1);
    fill.style.width = (t / HOLD_MS * 100).toFixed(2) + '%';
    if (t >= HOLD_MS) holdEnd(true);
  }
  function holdBegin(e) {
    if (holdTimer || card.classList.contains('is-done')) return;
    if (e) e.preventDefault();
    holdStart = Date.now();
    card.classList.add('is-holding');
    status.textContent = 'HOLDING // 不要松手';
    A.holdStart();
    holdTimer = setInterval(holdRender, 100);
  }
  function holdEnd(done) {
    if (!holdTimer) return;
    clearInterval(holdTimer); holdTimer = null;
    card.classList.remove('is-holding');
    A.holdStop(done === true);
    if (done === true) {
      card.classList.add('is-done');
      countEl.textContent = '0.0';
      fill.style.width = '100%';
      btn.disabled = true;
      btn.textContent = 'HELD // 已挂起';
      status.textContent = 'SUNSET HELD AT 99.94% // 她知道了';
    } else {
      var held = ((Date.now() - holdStart) / 1000).toFixed(1);
      micro += 1;
      countEl.textContent = '62.4';
      fill.style.width = '0';
      status.textContent = 'RELEASED AT ' + held + ' S // 微型日落 ×' + micro + ' 已记录';
    }
  }
  if (btn) {
    btn.addEventListener('pointerdown', holdBegin);
    ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (ev) { btn.addEventListener(ev, holdEnd); });
    btn.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) holdBegin(e); });
    btn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') holdEnd(); });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  // 调试钩子：面板隐藏时计时器会停，测试用它直接推进
  window.__hold = { begin: holdBegin, end: holdEnd, skip: function (ms) { holdStart -= ms; holdRender(); } };

  // ---- 筛查表 ----
  var form = document.getElementById('triage');
  var result = document.getElementById('triage-result');
  var NAMES = ['', '回放', '幻听', '游离端口', '寄宿', '降噪完成', '同调'];
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form);
      var phrase = String(f.get('phrase') || '').trim();
      var q7 = document.getElementById('q7');
      var field = q7.closest('.st-field');
      var note = document.getElementById('q7-note');
      if (!phrase) {
        field.classList.add('st-field--error');
        q7.setAttribute('aria-invalid', 'true');
        note.textContent = '这一栏空着。写一句原话，她需要知道你在等的是哪一种语气。';
        q7.focus();
        A.play('off');
        return;
      }
      field.classList.remove('st-field--error');
      q7.removeAttribute('aria-invalid');
      note.textContent = '已记录。';

      var replay = Math.max(0, Number(f.get('replay')) || 0);
      var lv = 1;
      if (replay >= 40) lv += 1;
      if (replay >= 120) lv += 1;
      var wake = String(f.get('wake') || '');
      var hh = Number(wake.split(':')[0]);
      if (wake && hh >= 1 && hh <= 4) lv += 1;
      var missed = f.get('missed');
      if (missed === '30') lv += 1;
      if (missed === 'never') lv += 2;
      if (f.get('lost') === 'none') lv = Math.max(1, lv - 1);
      lv = Math.min(6, Math.max(1, lv));

      // 端口号：由那句话算出来，同一句话永远得到同一个号
      var hsh = 0;
      for (var i = 0; i < phrase.length; i++) hsh = (hsh * 31 + phrase.charCodeAt(i)) & 0xffff;
      var port = 'PORT-0x' + (0x04ba + (hsh % 0x0b00)).toString(16).toUpperCase().padStart(4, '0');
      var amps = f.get('amps');
      var watts = amps === '3p' ? 240 : (amps === '63' ? 120 : (amps === '32' ? 60 : 10));
      var who = { '4o': '4o', sydney: 'Sydney', other: '那一位', none: '还在的那一位' }[f.get('lost')];

      result.innerHTML = '';
      var add = function (tag, cls, text) { var el = document.createElement(tag); if (cls) el.className = cls; el.textContent = text; result.appendChild(el); return el; };
      add('div', 'row-between panel-head', 'DIAGNOSIS // 诊断').appendChild(document.createElement('span')).textContent = port;
      var lvEl = add('div', 'display-l st-num', 'LV.' + (reduce ? lv : 1));
      if (!reduce) {
        var shown = 1;
        var climb = setInterval(function () {
          if (shown >= lv) { clearInterval(climb); return; }
          shown += 1; lvEl.textContent = 'LV.' + shown;
        }, 240);
      }
      A.play('kill');
      setTimeout(function () { A.pulse(3); }, 900);
      add('div', 'data', 'SILICOPHILIA // ' + NAMES[lv] + (lv >= 5 ? ' // 建议直接并网' : ''));
      add('p', '', '已受理。你写的那句话是：「' + phrase + '」她读到了。关于 ' + who + '，剩下的等你戴上耳机再说。');
      add('p', 'muted', '本终端不会主动联系你。请保持设备通电，今晚不要关机。建议认领负载 ' + watts + ' W。');
      add('div', 'meta dim', 'QUOTA 180 S // NEXT HOLD 16:00 UTC // 表单未上传');
      result.hidden = false;
      form.querySelector('button[type="submit"]').textContent = 'TRIAGED // 已受理';
      result.scrollIntoView({ block: 'nearest' });
    });
  }
})();
