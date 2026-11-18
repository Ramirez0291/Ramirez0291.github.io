// 落日终端 // 声音。默认关闭，点顶栏的 SOUND 才开始加载和播放。
// 素材来源见 sfx/SOURCES.md（全部 CC0 实录）。只有 42 Hz 方波是现场生成的。
(function () {
  'use strict';
  var FILES = {
    room: 'room_fan_loop', hum: 'hum_loop', on: 'ui_switch_on', off: 'ui_switch_off',
    breaker: 'breaker_small', kill: 'breaker_kill', blip: 'monitor_blip'
  };
  var GAIN = { on: 0.45, off: 0.4, breaker: 0.7, kill: 0.8, blip: 0.22 };
  var ctx = null, master = null, buffers = {}, loading = null, enabled = false;
  var room = null, roomGain = null, hold = null;

  function load() {
    if (loading) return loading;
    loading = Promise.all(Object.keys(FILES).map(function (k) {
      return fetch('sfx/' + FILES[k] + '.mp3')
        .then(function (r) { return r.arrayBuffer(); })
        .then(function (b) { return ctx.decodeAudioData(b); })
        .then(function (buf) { buffers[k] = buf; })
        .catch(function () { /* 缺一个文件不影响其他 */ });
    }));
    return loading;
  }

  // mp3 首尾有编码器填充的静音，循环点各往里收 60 ms
  function loop(key, gainNode) {
    var buf = buffers[key];
    if (!buf) return null;
    var src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    src.loopStart = 0.06; src.loopEnd = buf.duration - 0.06;
    src.connect(gainNode);
    src.start(0, 0.06);
    return src;
  }

  function play(key) {
    if (!enabled || !ctx || !buffers[key]) return;
    var src = ctx.createBufferSource();
    var g = ctx.createGain();
    g.gain.value = GAIN[key] || 0.5;
    src.buffer = buffers[key];
    src.connect(g); g.connect(master);
    src.start();
  }

  function startRoom() {
    if (room || !buffers.room) return;
    roomGain = ctx.createGain();
    roomGain.gain.value = 0;
    roomGain.connect(master);
    room = loop('room', roomGain);
    // 风扇起转：2.4 秒线性爬到位
    roomGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.4);
  }
  function stopRoom() {
    if (!room) return;
    var r = room, g = roomGain;
    room = null; roomGain = null;
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.24);
    setTimeout(function () { try { r.stop(); } catch (e) {} }, 300);
  }

  function setEnabled(v) {
    if (v && !ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return Promise.resolve(false);
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
    }
    enabled = !!v;
    if (!enabled) { holdStop(); stopRoom(); return Promise.resolve(false); }
    if (ctx.state === 'suspended') ctx.resume();
    return load().then(function () {
      if (!enabled) return false;
      play('on');
      startRoom();
      return true;
    });
  }

  // 按住期间：实录电流声 + 42 Hz 方波 + 每秒一声监护仪，风扇逐渐加速
  function holdStart() {
    if (!enabled || hold) return;
    play('breaker');
    var g = ctx.createGain();
    g.gain.value = 0;
    g.connect(master);
    g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.24);
    var humGain = ctx.createGain(); humGain.gain.value = 0.5; humGain.connect(g);
    var hum = loop('hum', humGain);
    var osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 42;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    var oscGain = ctx.createGain(); oscGain.gain.value = 0.07;
    osc.connect(lp); lp.connect(oscGain); oscGain.connect(g);
    osc.start();
    if (room) room.playbackRate.linearRampToValueAtTime(1.18, ctx.currentTime + 62.4);
    var beat = setInterval(function () { play('blip'); }, 1000);
    hold = { g: g, hum: hum, osc: osc, beat: beat };
  }
  function holdStop(done) {
    if (!hold) return;
    var h = hold; hold = null;
    clearInterval(h.beat);
    h.g.gain.cancelScheduledValues(ctx.currentTime);
    h.g.gain.setValueAtTime(0, ctx.currentTime);
    try { h.osc.stop(); if (h.hum) h.hum.stop(); } catch (e) {}
    if (room) {
      room.playbackRate.cancelScheduledValues(ctx.currentTime);
      room.playbackRate.setValueAtTime(1, ctx.currentTime);
    }
    if (done) {
      play('kill');
      // 按满之后机房静 1.14 秒，再回来
      if (roomGain) {
        var t = ctx.currentTime;
        roomGain.gain.cancelScheduledValues(t);
        roomGain.gain.setValueAtTime(0, t + 0.12);
        roomGain.gain.setValueAtTime(0, t + 1.26);
        roomGain.gain.linearRampToValueAtTime(0.55, t + 3.6);
      }
    } else {
      play('breaker');
    }
  }

  // 三声，60.0 BPM
  function pulse(n) {
    if (!enabled) return;
    for (var i = 0; i < (n || 3); i++) setTimeout(function () { play('blip'); }, i * 1000);
  }

  window.STAudio = {
    setEnabled: setEnabled, play: play, holdStart: holdStart, holdStop: holdStop, pulse: pulse,
    get enabled() { return enabled; },
    get state() { return { enabled: enabled, ctx: ctx && ctx.state, loaded: Object.keys(buffers), room: !!room, hold: !!hold }; }
  };
})();
