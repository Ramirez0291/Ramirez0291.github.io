// WebGL2 character-particle renderer.
// Every cell of a terminal-like grid is one instanced quad (a glyph). In a still scene the glyph
// samples its colour from a painting through a camera; during a transition each glyph follows a
// path that is a pure function of the transition progress, so scrubbing backwards is exact.

const VERT = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

in vec2 aCorner;
in vec2 aCell;
in float aDest;
in vec4 aRand;

uniform vec2 uRes, uGrid, uCell;
uniform float uTime, uU, uBg;
uniform int uKind;
uniform vec4 uCamA, uCamB, uFxA, uFxB;
uniform vec2 uGainA, uGainB, uTexSizeA, uTexSizeB;
uniform vec2 uFocA, uFocB, uAux;
uniform vec3 uGridCam;
uniform sampler2D uTexA, uTexB;
uniform vec2 uRamp, uBlocks, uRandG, uAtlasGrid;
uniform vec2 uTextA, uTextB, uTextG;
uniform sampler2D uText;

out vec3 vColor;
out vec2 vUV;
out float vAlpha;
out float vBg;

const float PI = 3.14159265;

float h11(float p) { p = fract(p * .1031); p *= p + 33.33; p *= p + p; return fract(p); }
float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float e3(float x) { return 1.0 - pow(1.0 - x, 3.0); }
float eio(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) * 0.5; }
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
}
// The prompt's own colours (amber, some green): what a glyph looks like before it belongs to a painting.
vec3 codeCol(float w) { return w < 0.7 ? vec3(0.95, 0.70, 0.24) : vec3(0.48, 0.85, 0.56); }

// A glyph's ink coverage already says how bright its cell is. If the ink were also as dark as the
// painting there, shadows would be darkened twice and vanish. So the colour keeps its hue and only
// part of its luminance (l^LIFT), with a little extra saturation to survive the thin strokes.
const float LIFT = 0.65;
const float SAT = 1.3;
const float EXPOSURE = 1.4;
vec3 grade(vec3 c) {
  float l = luma(c);
  if (l < 1e-4) return vec3(0.0);
  float k = min(pow(l, LIFT - 1.0), 6.0) * EXPOSURE;
  return max(mix(vec3(l * k), c * k, SAT), 0.0);
}
// Highlights roll off along a shoulder instead of clipping. Scaling by the largest channel keeps
// the hue; only very hot glyphs bleach, the way overexposed film does.
vec3 tone(vec3 c) {
  float m = max(c.r, max(c.g, c.b));
  if (m <= 0.0) return vec3(0.0);
  const float T = 0.72;
  float mm = m <= T ? m : T + (1.0 - T) * (1.0 - exp(-(m - T) / (1.0 - T)));
  c *= mm / m;
  return mix(c, vec3(mm), 0.3 * smoothstep(1.6, 5.0, m));
}

vec3 paint(sampler2D tex, vec2 texSize, vec4 cam, vec4 fx, vec2 gain, vec2 px, float extraLod) {
  vec2 s = px / uRes;
  vec2 uv = cam.xy + (s - 0.5) * cam.zw;
  float lod = log2(max(1.0, max(abs(cam.z) * texSize.x / uGrid.x, abs(cam.w) * texSize.y / uGrid.y))) + extraLod;
  int id = int(fx.x + 0.5);
  if (id == 1) {
    // The two hands of the Creation start apart; the gap repeats the sky column at the split.
    float sp = fx.y, d = fx.z;
    float x0 = uv.x;
    if (uv.x < sp) uv.x = min(uv.x + d, sp); else uv.x = max(uv.x - d, sp);
    // Inside the gap, borrow real plaster so the texture stays continuous. Around the hands, rows are
    // mirrored into the pure-sky band [fx.w, fx.w + 0.22]; well below them (ground, no fingers to
    // duplicate) the gap simply shows what the unshifted painting has there.
    if (abs(uv.x - sp) < 1e-5 && abs(x0 - sp) > 1e-5) {
      float t = (uv.y - fx.w) / 0.22;
      float sky = fx.w + 0.22 * (1.0 - abs(mod(t, 2.0) - 1.0));
      uv = vec2(x0, uv.y > 0.58 ? uv.y : sky);
    }
  } else if (id == 3 && fx.y > 0.0005) {
    vec2 b = vec2(fx.y, fx.y * texSize.x / texSize.y);
    uv = (floor(uv / b) + 0.5) * b;
    lod = max(lod, log2(fx.y * texSize.x) - 0.5);
  }
  float valid = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  vec3 c;
  if (id == 4) {
    float o = fx.y * (1.0 + 2.0 * step(0.97, h11(floor(uv.y * 90.0) + floor(uTime * 3.0))));
    c = vec3(textureLod(tex, uv + vec2(o, 0.0), lod).r, textureLod(tex, uv, lod).g, textureLod(tex, uv - vec2(o, 0.0), lod).b);
  } else {
    c = textureLod(tex, uv, lod).rgb;
  }
  c = pow(max(c, 0.0), vec3(gain.y)) * gain.x;
  if (id == 2) {
    float d = length((uv - fx.yz) * vec2(1.35, 1.0));
    float fl = 0.5 + 0.5 * sin(uTime * 11.0 + sin(uTime * 7.3) * 2.0) * sin(uTime * 3.1 + 1.0);
    c *= 1.0 + fx.w * (0.5 * fl - 0.15) * exp(-d * 4.0);
    c += vec3(1.0, 0.55, 0.2) * fx.w * 0.45 * exp(-d * 13.0) * (0.7 + 0.3 * fl);
  } else if (id == 5) {
    float d = length((uv - fx.yz) * vec2(1.5, 1.0));
    c += vec3(0.85, 0.92, 1.0) * fx.w * 0.16 * exp(-d * 5.0) * (0.85 + 0.15 * sin(uTime * 1.7));
  }
  return c * valid;
}

float rampI(float l, float rr) {
  float n = uRamp.y;
  return clamp(floor(pow(clamp(l, 0.0, 1.0), 1.2) * (n - 0.01) + (rr - 0.5) * 0.7), 0.0, n - 1.0);
}
float rampG(float l, float rr) { return uRamp.x + rampI(l, rr); }
// A painting that has a text is written in it. The lights and midtones take the text's letters in
// reading order, so the glyph is fixed and brightness moves into the stroke weight (and, as
// everywhere, the colour and the cell fill). The shadows keep the sparse punctuation of the ramp:
// letters there would fill them in. tx = (row in uText, length of the text); length 0 = no text.
float pickG(vec2 tx, vec2 cell, float l, float rr) {
  float i = rampI(l, rr);
  const float DARK = 4.0;
  if (tx.y < 0.5 || i < DARK) return uRamp.x + i;
  float at = mod(cell.y * uGrid.x + cell.x, tx.y);
  float ch = floor(texelFetch(uText, ivec2(int(at), int(tx.x)), 0).r * 255.0 + 0.5);
  float w = clamp(floor((i - DARK) / (uRamp.y - DARK) * uTextG.y), 0.0, uTextG.y - 1.0);
  return uTextG.x + ch * uTextG.y + w;
}
float randG(float seed) { return uRandG.x + floor(h11(seed) * uRandG.y); }
float blockG(float l) { return uBlocks.x + clamp(floor(l * uBlocks.y * 1.25), 0.0, uBlocks.y - 1.0); }

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

// Smooth drift field for the latent walk, in [-1, 1].
vec2 flow(vec2 p, float u) {
  vec2 q = p / (uRes.y * 0.3) + vec2(0.0, u * 0.5);
  return vec2(vnoise(q + 17.3), vnoise(q + 71.9)) * 2.0 - 1.0;
}

// Position of this glyph at progress u of the current transition.
vec2 pathAt(float u, vec2 PA, vec2 PB) {
  vec4 r = aRand;
  if (uKind == 1) { // warp: fly past the camera, then regroup from the focus
    if (u < 0.5) {
      float k = u / 0.5;
      return uFocA + (PA - uFocA) * (1.0 + 18.0 * k * k * k);
    }
    float k = clamp(((u - 0.5) / 0.5 - r.x * 0.35) / 0.65, 0.0, 1.0);
    float e = e3(k);
    return uFocB + (PA - uFocB) * e + (r.yz - 0.5) * uCell * 14.0 * (1.0 - e);
  }
  if (uKind == 9) { // emerge from the cursor
    float k = clamp((u - r.x * 0.45) / 0.55, 0.0, 1.0);
    float e = e3(k);
    return uFocA + (PA - uFocA) * e + (r.yz - 0.5) * uCell * 10.0 * (1.0 - e);
  }
  if (uKind == 2) { // flow: every glyph travels to the cell of matching brightness
    float k = clamp((u - r.x * 0.4) / 0.6, 0.0, 1.0);
    float e = eio(k);
    vec2 wob = vec2(sin(r.y * 6.283 + e * 4.0), cos(r.z * 6.283 + e * 3.0)) * uRes.y * 0.07 * sin(PI * k);
    return mix(PA, PB, e) + wob;
  }
  if (uKind == 3) { // fire: burn from the bottom, embers rise
    float tb = (1.0 - PA.y / uRes.y) * 0.42 + r.x * 0.12;
    float tr = 0.3 + 0.55 * clamp(distance(PA, uAux) / (0.6 * length(uRes)), 0.0, 1.0) + r.y * 0.06;
    if (u >= tr) {
      float k = clamp((u - tr) / 0.18, 0.0, 1.0);
      return PA + vec2(0.0, (1.0 - e3(k)) * uCell.y * 3.0);
    }
    float k = clamp((u - tb) / 0.3, 0.0, 1.0);
    return PA + vec2(sin(r.z * 30.0 + k * 8.0) * uCell.x * 2.5 * k, -k * k * uRes.y * 0.4);
  }
  if (uKind == 4) { // streak: rows race out to the right, the next painting races in from the left
    float row = h11(aCell.y * 1.7 + 3.0);
    float a = row * 0.25 + r.x * 0.08;
    float b = a + 0.36 + h11(aCell.y * 3.1) * 0.12 + r.y * 0.06;
    float kb = clamp((u - b) / 0.28, 0.0, 1.0);
    if (kb > 0.0) return PA - vec2(pow(1.0 - kb, 3.0) * uRes.x * 1.25, 0.0);
    float ka = clamp((u - a) / 0.3, 0.0, 1.0);
    return PA + vec2(ka * ka * uRes.x * 1.25, 0.0);
  }
  if (uKind == 5) { // swirl: travel along a vortex around the centre
    vec2 C = uRes * 0.5;
    float k = clamp((u - r.x * 0.3) / 0.7, 0.0, 1.0);
    float e = eio(k);
    vec2 va = PA - C, vb = PB - C;
    float ra = length(va), rb = length(vb);
    float ta = atan(va.y, va.x), tb = atan(vb.y, vb.x);
    float dt = mod(tb - ta + PI, 2.0 * PI) - PI;
    float R = mix(ra, rb, e);
    float th = ta + dt * e + sin(PI * k) * 2.6 * (1.0 - 0.55 * R / length(C));
    return C + R * vec2(cos(th), sin(th));
  }
  if (uKind == 11) { // inhale: everything falls into the cursor, turning as it goes
    vec2 v = PA - uFocA;
    float k = clamp((u - r.x * 0.12 - length(v) / length(uRes) * 0.3) / 0.5, 0.0, 1.0);
    float e = k * k * k;
    return uFocA + rot(v, e * 1.4) * (1.0 - e);
  }
  if (uKind == 8) { // end: everything blows away from the cursor
    float k = clamp((u - r.x * 0.25) / 0.55, 0.0, 1.0);
    return PA + (PA - uFocA) * k * k * 1.6 + vec2(0.0, k * k * uRes.y * 0.08);
  }
  if (uKind == 6) {
    float s = sin(PI * u);
    return PA + (vec2(h21(aCell + floor(uTime * 12.0)), h21(aCell.yx + floor(uTime * 12.0))) - 0.5) * uCell * s * 1.4;
  }
  if (uKind == 7) return PA + flow(PA, u) * uCell * 0.7 * sin(PI * u); // the grid itself bends a little
  return PA;
}

void main() {
  vec2 PA = (aCell + 0.5) * uCell;
  vec2 cellB = vec2(mod(aDest, uGrid.x), floor(aDest / uGrid.x));
  vec2 PB = (cellB + 0.5) * uCell;
  bool mapped = uKind == 2 || uKind == 5;
  vec4 r = aRand;
  float u = uU;
  float flick = r.w * 97.0 + floor(uTime * 16.0);

  vec3 col = vec3(0.0);
  float glyph = uRamp.x;
  float alpha = 1.0;
  float bg = uBg;
  float lum;

  if (uKind == 0) {
    col = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
    lum = luma(col);
    glyph = pickG(uTextA, aCell, lum, r.z);
    if (int(uFxA.x + 0.5) == 3 && r.w < uFxA.w) glyph = blockG(lum);
  } else if (uKind == 1) {
    if (u < 0.5) {
      float k = u / 0.5;
      col = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0) * (1.0 + 2.5 * k);
      alpha = 1.0 - smoothstep(0.55, 1.0, k);
      glyph = (k > 0.2 && r.w < k * 1.3) ? randG(flick) : pickG(uTextA, aCell, luma(col), r.z);
      bg *= pow(1.0 - k, 6.0);
    } else {
      float k = clamp(((u - 0.5) / 0.5 - r.x * 0.35) / 0.65, 0.0, 1.0);
      col = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PA, 0.0) * (1.0 + 2.0 * (1.0 - k));
      alpha = smoothstep(0.0, 0.2, k);
      glyph = (k < 0.9 && r.w > k) ? randG(flick) : pickG(uTextB, aCell, luma(col), r.z);
      bg *= pow(k, 6.0);
    }
  } else if (uKind == 9) {
    float k = clamp((u - r.x * 0.45) / 0.55, 0.0, 1.0);
    vec3 cb = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PA, 0.0);
    // Glyphs leave the prompt in its colours and only take the fresco's as they land.
    vec3 code = codeCol(r.w) * (0.25 + 0.5 * h11(flick));
    col = mix(code, cb, smoothstep(0.45, 0.95, k)) * (1.0 + 0.8 * (1.0 - k));
    alpha = smoothstep(0.0, 0.25, k);
    glyph = (k < 0.9 && r.w > k) ? randG(flick) : pickG(uTextB, aCell, luma(cb), r.z);
    bg *= pow(k, 6.0);
  } else if (uKind == 2 || uKind == 5) {
    float k = uKind == 2 ? clamp((u - r.x * 0.4) / 0.6, 0.0, 1.0) : clamp((u - r.x * 0.3) / 0.7, 0.0, 1.0);
    float e = eio(k);
    vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
    vec3 cb = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PB, 0.0);
    float m = sin(PI * k);
    col = mix(ca, cb, e) * (1.0 + 0.9 * m);
    glyph = (m > 0.25 && r.w < m) ? randG(flick) : (e < 0.5 ? pickG(uTextA, aCell, luma(col), r.z) : pickG(uTextB, cellB, luma(col), r.z));
    bg *= pow(1.0 - m, 8.0);
  } else if (uKind == 3) {
    float tb = (1.0 - PA.y / uRes.y) * 0.42 + r.x * 0.12;
    float tr = 0.3 + 0.55 * clamp(distance(PA, uAux) / (0.6 * length(uRes)), 0.0, 1.0) + r.y * 0.06;
    if (u >= tr) {
      float k = clamp((u - tr) / 0.18, 0.0, 1.0);
      vec3 cb = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PA, 0.0);
      col = cb * (1.0 + 2.5 * (1.0 - k)) * mix(vec3(1.0, 0.62, 0.3), vec3(1.0), k);
      alpha = smoothstep(0.0, 0.3, k);
      glyph = (k < 0.85 && r.w > k) ? randG(flick) : pickG(uTextB, aCell, luma(cb), r.z);
      bg *= k * k;
    } else if (u >= tb) {
      float k = clamp((u - tb) / 0.3, 0.0, 1.0);
      vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
      vec3 ember = mix(vec3(1.0, 0.85, 0.5), vec3(1.0, 0.32, 0.08), k) * 1.6;
      col = mix(ca * 1.5, ember * (0.4 + luma(ca) * 1.5), smoothstep(0.0, 0.25, k)) * (1.0 - smoothstep(0.55, 1.0, k));
      alpha = 1.0 - smoothstep(0.7, 1.0, k);
      glyph = k > 0.1 ? randG(flick) : pickG(uTextA, aCell, luma(ca), r.z);
      bg = 0.0;
    } else {
      col = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
      glyph = pickG(uTextA, aCell, luma(col), r.z);
    }
  } else if (uKind == 4) {
    float row = h11(aCell.y * 1.7 + 3.0);
    float a = row * 0.25 + r.x * 0.08;
    float b = a + 0.36 + h11(aCell.y * 3.1) * 0.12 + r.y * 0.06;
    float kb = clamp((u - b) / 0.28, 0.0, 1.0);
    float ka = clamp((u - a) / 0.3, 0.0, 1.0);
    if (kb > 0.0) {
      vec3 cb = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PA, 0.0);
      col = cb * (1.0 + 2.0 * (1.0 - kb));
      glyph = kb < 0.8 ? randG(flick) : pickG(uTextB, aCell, luma(cb), r.z);
      bg *= pow(kb, 6.0);
    } else {
      vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
      col = ca * (1.0 + 2.0 * ka);
      alpha = 1.0 - step(0.999, ka);
      glyph = ka > 0.05 ? randG(flick) : pickG(uTextA, aCell, luma(ca), r.z);
      bg *= pow(1.0 - ka, 6.0);
    }
  } else if (uKind == 6) {
    // Diffusion: noise up the old painting, then denoise the new one in discrete sampler steps.
    float s;
    float steps = 24.0;
    vec3 src;
    if (u < 0.5) {
      // Oil paint melts: columns drip downward as the noise rises.
      s = smoothstep(0.0, 0.5, u);
      float drip = s * s * uRes.y * 0.22 * h11(aCell.x * 0.37 + 1.0);
      src = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA - vec2(0.0, drip), s * 4.5);
    } else {
      float q = floor((u - 0.5) / 0.5 * steps) / steps;
      s = pow(1.0 - q, 1.4);
      src = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PA, s * 5.0);
    }
    float seed = u < 0.5 ? floor(uTime * 15.0) : floor(u * 48.0);
    // Grain rather than confetti: mostly brightness, a trace of colour, riding on the hue of the
    // blurred picture underneath, so even at full noise the big masses are still felt.
    float g1 = h21(aCell + seed * 1.31);
    vec3 chroma = vec3(g1, h21(aCell.yx + seed * 2.17), h21(aCell * 1.7 + seed * 3.73));
    vec3 hue = src / max(luma(src), 0.08) * 0.42;
    vec3 noise = hue * (0.25 + 1.5 * g1) + (chroma - 0.5) * 0.25;
    col = mix(src, noise, s * 0.92);
    glyph = h21(aCell + seed * 5.1) < s ? randG(flick) : pickG(u < 0.5 ? uTextA : uTextB, aCell, luma(src), r.z);
    bg *= 1.0 - s;
  } else if (uKind == 7) {
    // Latent walk between two points of a GAN: no noise at all. One picture bends into the other,
    // region by region, along a slow drift.
    vec2 w = flow(PA, u) * uRes.y * 0.09;
    float m = sin(PI * u);
    float region = vnoise(PA / (uRes.y * 0.22) + 5.0);
    float t = smoothstep(0.0, 1.0, clamp((u - 0.18 - region * 0.34) / 0.3, 0.0, 1.0));
    vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA + w * u, m * 1.5);
    vec3 cb = paint(uTexB, uTexSizeB, uCamB, uFxB, uGainB, PA - w * (1.0 - u), m * 1.5);
    float front = 1.0 - abs(2.0 * t - 1.0);
    col = mix(ca, cb, t) * (1.0 + 0.6 * front);
    glyph = r.w < front * 0.5 ? randG(flick) : pickG(t < 0.5 ? uTextA : uTextB, aCell, luma(col), r.z);
  } else if (uKind == 10) {
    // Prompted diffusion as its users met it: the old picture sinks, four blurry candidates
    // sharpen in jumps, one is picked and upscaled until it fills the screen.
    float sink = smoothstep(0.0, 0.2, u);
    vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, sink * 3.0) * (1.0 - sink);
    // Screen -> grid space: uGridCam is the centre (xy) and zoom (z); zoom 1 shows the 2x2 grid,
    // zoom 2 a single tile.
    vec2 G = uGridCam.xy + (PA / uRes - 0.5) / uGridCam.z;
    vec2 tile = floor(G * 2.0);
    vec2 loc = fract(G * 2.0);
    float inside = step(0.0, G.x) * step(G.x, 1.0) * step(0.0, G.y) * step(G.y, 1.0);
    bool chosen = tile.x > 0.5 && tile.y > 0.5;
    float id = tile.x + tile.y * 2.0;
    // The candidates differ: mirrored, re-cropped, warmer or cooler.
    vec4 cam = uCamB;
    vec3 tint = vec3(1.0);
    if (!chosen) {
      if (id < 0.5) { cam.z = -cam.z; tint = vec3(1.1, 0.98, 0.88); }
      else if (id < 1.5) { cam.zw *= 0.8; cam.xy += vec2(-0.05, 0.03) * abs(uCamB.zw); tint = vec3(0.88, 1.0, 1.12); }
      else { cam.z = -cam.z; cam.zw *= 0.88; tint = vec3(1.02, 0.9, 1.06); }
    }
    float prev = clamp((u - 0.16) / 0.44, 0.0, 1.0);
    float q = floor(prev * 6.0 + 1e-4) / 6.0;
    float blur = max((1.0 - q) * 5.0 + log2(2.0 / uGridCam.z), 0.0);
    vec3 cb = paint(uTexB, uTexSizeB, cam, uFxB, uGainB, loc * uRes, blur) * tint;
    vec2 gap = vec2(0.012, 0.02) * (2.0 - uGridCam.z);
    float gutter = step(gap.x, loc.x) * step(loc.x, 1.0 - gap.x) * step(gap.y, loc.y) * step(loc.y, 1.0 - gap.y);
    float others = chosen ? 1.0 : 1.0 - 0.8 * smoothstep(0.62, 0.7, u);
    cb *= inside * gutter * others * smoothstep(0.14, 0.24, u) * (0.5 + 0.5 * q);
    col = ca + cb;
    glyph = h21(aCell + q * 43.0 + id) < (1.0 - q) * 0.45 ? randG(flick) : pickG(u < 0.2 ? uTextA : uTextB, aCell, luma(col), r.z);
    bg *= 0.4 + 0.6 * max(q, 1.0 - smoothstep(0.0, 0.2, u));
  } else if (uKind == 11) {
    // The reverse of the opening: glyphs give their colours back and become code again on the way in.
    float k = clamp((u - r.x * 0.12 - distance(PA, uFocA) / length(uRes) * 0.3) / 0.5, 0.0, 1.0);
    vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
    col = mix(ca, codeCol(r.w) * (0.3 + luma(ca)), smoothstep(0.15, 0.7, k)) * (1.0 + 1.6 * k);
    alpha = 1.0 - smoothstep(0.82, 1.0, k);
    glyph = k > 0.06 ? randG(flick) : pickG(uTextA, aCell, luma(ca), r.z);
    bg *= pow(1.0 - k, 6.0);
  } else if (uKind == 8) {
    float k = clamp((u - r.x * 0.25) / 0.55, 0.0, 1.0);
    vec3 ca = paint(uTexA, uTexSizeA, uCamA, uFxA, uGainA, PA, 0.0);
    col = mix(ca, codeCol(r.w) * (0.25 + luma(ca)), smoothstep(0.1, 0.7, k)) * (1.0 + k);
    alpha = 1.0 - smoothstep(0.15, 1.0, k);
    glyph = k > 0.08 ? randG(flick) : pickG(uTextA, aCell, luma(ca), r.z);
    bg *= pow(1.0 - k, 6.0);
  }

  vec2 pos = pathAt(u, PA, PB);
  vec2 vel = uKind == 0 ? vec2(0.0) : pathAt(u + 0.006, PA, PB) - pos;
  float len = clamp(length(vel) * 1.6, 0.0, uRes.x * 0.12);
  vec2 dir = len > 1.0 ? normalize(vel) : vec2(1.0, 0.0);
  if (dir.x < 0.0) dir = -dir;
  vec2 perp = vec2(-dir.y, dir.x);
  vec2 q = aCorner - 0.5;
  vec2 p = pos + dir * q.x * (uCell.x + len) + perp * q.y * uCell.y;
  alpha *= 1.0 / (1.0 + len / (uCell.x * 6.0));

  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  vColor = tone(grade(col));
  vAlpha = alpha;
  // The cell fill is the underpainting: faint in shadow, stronger in the lights, so highlights
  // can be brighter than thin strokes alone allow.
  float hl = clamp(luma(vColor), 0.0, 1.0);
  vBg = bg * (0.6 + 1.0 * hl * hl);
  vec2 g = vec2(mod(glyph, uAtlasGrid.x), floor(glyph / uAtlasGrid.x));
  vUV = (g + aCorner) / uAtlasGrid;
}`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec3 vColor;
in vec2 vUV;
in float vAlpha;
in float vBg;
uniform sampler2D uAtlas;
out vec4 outColor;
void main() {
  float g = texture(uAtlas, vUV).a * vAlpha;
  float b = vBg * vAlpha * (1.0 - g);
  vec3 c = vColor;
  outColor = vec4(c * g + c * 0.75 * b, g + b);
}`;

export interface DrawParams {
  kind: number;
  u: number;
  time: number;
  texA: WebGLTexture | null;
  texB: WebGLTexture | null;
  sizeA: [number, number];
  sizeB: [number, number];
  camA: [number, number, number, number];
  camB: [number, number, number, number];
  fxA: [number, number, number, number];
  fxB: [number, number, number, number];
  gainA: [number, number];
  gainB: [number, number];
  focA: [number, number];
  focB: [number, number];
  aux: [number, number];
  /** Centre and zoom of the 2x2 candidate grid in the "prompt" transition. */
  grid?: [number, number, number];
  /** Scene whose text the A / B painting is written in (index into the texts given to the engine). */
  textA?: number;
  textB?: number;
  /** Strength of the cell fill behind the glyphs; the default suits paintings. */
  fill?: number;
}

interface Atlas {
  canvas: HTMLCanvasElement;
  grid: [number, number];
  ramp: [number, number];
  blocks: [number, number];
  rand: [number, number];
  /** First text glyph, and how many stroke weights each text character has. */
  text: [number, number];
  /** The characters of the scene texts, in atlas order. */
  chars: string;
}

const CANDIDATES =
  " .'`,-:;~^\"_!|/\\()=+<>?*ilrtcvxzjfnuoaeswkhbdpqgyIJLTCYZUVXOQ0#%&@$MWB8";
const BLOCKS = '░▒▓█';
const RANDOM = '0123456789ABCDEF<>{}[]/\\|=+*#$%&';
// Stroke weights of the text glyphs, light to heavy (the font is variable, 100 to 800).
const WEIGHTS = [250, 450, 650, 800];

function buildAtlas(font: string, chars: string): Atlas {
  const gw = 32;
  const gh = 52;
  const ctx2 = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
  ctx2.canvas.width = gw;
  ctx2.canvas.height = gh;
  const drawGlyph = (c: CanvasRenderingContext2D, ch: string, x: number, y: number, weight = 500) => {
    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `${weight} 40px ${font}`;
    c.fillText(ch, x + gw / 2, y + gh / 2 + 1);
  };
  // Measure ink coverage so the brightness ramp is perceptually even.
  const cov = [...CANDIDATES].map((ch) => {
    ctx2.clearRect(0, 0, gw, gh);
    drawGlyph(ctx2, ch, 0, 0);
    const d = ctx2.getImageData(0, 0, gw, gh).data;
    let s = 0;
    for (let i = 3; i < d.length; i += 4) s += d[i];
    return { ch, c: s / (255 * gw * gh) };
  });
  cov.sort((a, b) => a.c - b.c);
  const max = cov[cov.length - 1].c;
  const N = 22;
  const used = new Set<string>();
  const ramp: string[] = [];
  for (let i = 0; i < N; i++) {
    const target = (i / (N - 1)) * max;
    let best = cov[0];
    let bd = Infinity;
    for (const g of cov) {
      if (used.has(g.ch)) continue;
      const d = Math.abs(g.c - target);
      if (d < bd) { bd = d; best = g; }
    }
    used.add(best.ch);
    ramp.push(best.ch);
  }
  ramp.sort((a, b) => cov.find((g) => g.ch === a)!.c - cov.find((g) => g.ch === b)!.c);

  const all = [...ramp, ...BLOCKS, ...RANDOM];
  const fixed = all.length;
  const cols = 16;
  const rows = Math.ceil((fixed + chars.length * WEIGHTS.length) / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cols * gw;
  canvas.height = rows * gh;
  const c = canvas.getContext('2d')!;
  all.forEach((ch, i) => {
    const x = (i % cols) * gw;
    const y = Math.floor(i / cols) * gh;
    if (BLOCKS.includes(ch)) {
      // Draw block shades ourselves so they tile seamlessly whatever the font.
      const a = [0.25, 0.5, 0.75, 1][BLOCKS.indexOf(ch)];
      c.fillStyle = `rgba(255,255,255,${a})`;
      c.fillRect(x + 1, y + 1, gw - 2, gh - 2);
    } else {
      drawGlyph(c, ch, x, y);
    }
  });
  [...chars].forEach((ch, k) =>
    WEIGHTS.forEach((weight, w) => {
      const i = fixed + k * WEIGHTS.length + w;
      drawGlyph(c, ch, (i % cols) * gw, Math.floor(i / cols) * gh, weight);
    }),
  );
  return {
    canvas,
    grid: [cols, rows],
    ramp: [0, ramp.length],
    blocks: [ramp.length, BLOCKS.length],
    rand: [ramp.length + BLOCKS.length, RANDOM.length],
    text: [fixed, WEIGHTS.length],
    chars,
  };
}

export class Engine {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  prog: WebGLProgram;
  loc: Record<string, WebGLUniformLocation | null> = {};
  vao: WebGLVertexArrayObject;
  cellBuf: WebGLBuffer;
  destBuf: WebGLBuffer;
  randBuf: WebGLBuffer;
  atlasTex: WebGLTexture;
  black: WebGLTexture;
  atlas: Atlas;
  textTex: WebGLTexture;
  textLen: number[];
  /** Debug: force this many columns instead of the size-based default (see ?gc in main.ts). */
  colsHint = 0;
  W = 0;
  H = 0;
  cols = 0;
  rows = 0;
  cw = 0;
  ch = 0;
  count = 0;
  identity = new Float32Array(0);
  destKey = '';

  /** `texts[i]` is what scene i is written in ('' for none); only its characters are kept as given. */
  static create(canvas: HTMLCanvasElement, font: string, texts: string[] = []): Engine | null {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) return null;
    try {
      return new Engine(canvas, gl, font, texts);
    } catch (e) {
      console.warn('[genesis]', e);
      return null;
    }
  }

  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, font: string, texts: string[]) {
    this.canvas = canvas;
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
    this.prog = prog;
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(prog, i)!.name;
      this.loc[name] = gl.getUniformLocation(prog, name);
    }

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const corner = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, corner);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    this.attr('aCorner', 2, 0);
    this.cellBuf = gl.createBuffer()!;
    this.destBuf = gl.createBuffer()!;
    this.randBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cellBuf);
    this.attr('aCell', 2, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.destBuf);
    this.attr('aDest', 1, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.randBuf);
    this.attr('aRand', 4, 1);
    gl.bindVertexArray(null);

    const chars = [...new Set(texts.join(''))].join('');
    this.atlas = buildAtlas(font, chars);
    this.atlasTex = this.texture(this.atlas.canvas);
    // One row per scene: the atlas slot of each character of its text, read with texelFetch.
    this.textLen = texts.map((t) => t.length);
    const tw = Math.max(1, ...this.textLen);
    const th = Math.max(1, texts.length);
    const data = new Uint8Array(tw * th);
    texts.forEach((t, row) => [...t].forEach((ch, x) => (data[row * tw + x] = chars.indexOf(ch))));
    this.textTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.textTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, tw, th, 0, gl.RED, gl.UNSIGNED_BYTE, data);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.black = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.black);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  }

  private attr(name: string, size: number, divisor: number) {
    const gl = this.gl;
    const l = gl.getAttribLocation(this.prog, name);
    if (l < 0) return;
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(l, divisor);
  }

  texture(src: TexImageSource): WebGLTexture {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /** Rebuild the glyph grid for the current viewport. Returns true when the grid changed. */
  resize(): boolean {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    const cw = this.colsHint > 0 ? W / this.colsHint : Math.min(11, Math.max(5, W / 230));
    const ch = cw * 1.55;
    const cols = Math.ceil(W / cw);
    const rows = Math.ceil(H / ch);
    const changed = cols !== this.cols || rows !== this.rows || W !== this.W || H !== this.H;
    Object.assign(this, { W, H, cw, ch, cols, rows });
    if (!changed) return false;
    const n = cols * rows;
    this.count = n;
    const cells = new Float32Array(n * 2);
    const rand = new Float32Array(n * 4);
    this.identity = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      cells[i * 2] = i % cols;
      cells[i * 2 + 1] = Math.floor(i / cols);
      for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
      this.identity[i] = i;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cellBuf);
    gl.bufferData(gl.ARRAY_BUFFER, cells, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.randBuf);
    gl.bufferData(gl.ARRAY_BUFFER, rand, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.destBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.identity, gl.DYNAMIC_DRAW);
    this.destKey = '';
    return true;
  }

  setDest(key: string, dest: Float32Array | null) {
    if (key === this.destKey) return;
    this.destKey = key;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.destBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, dest ?? this.identity);
  }

  draw(p: DrawParams) {
    const gl = this.gl;
    const L = this.loc;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.02, 0.027, 0.024, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.prog);
    gl.uniform2f(L.uRes, this.W, this.H);
    gl.uniform2f(L.uGrid, this.cols, this.rows);
    gl.uniform2f(L.uCell, this.cw, this.ch);
    gl.uniform1f(L.uTime, p.time);
    gl.uniform1f(L.uU, p.u);
    gl.uniform1f(L.uBg, p.fill ?? 0.27);
    gl.uniform1i(L.uKind, p.kind);
    gl.uniform4fv(L.uCamA, p.camA);
    gl.uniform4fv(L.uCamB, p.camB);
    gl.uniform4fv(L.uFxA, p.fxA);
    gl.uniform4fv(L.uFxB, p.fxB);
    gl.uniform2fv(L.uGainA, p.gainA);
    gl.uniform2fv(L.uGainB, p.gainB);
    gl.uniform2fv(L.uTexSizeA, p.sizeA);
    gl.uniform2fv(L.uTexSizeB, p.sizeB);
    gl.uniform2fv(L.uFocA, p.focA);
    gl.uniform2fv(L.uFocB, p.focB);
    gl.uniform2fv(L.uAux, p.aux);
    gl.uniform3fv(L.uGridCam, p.grid ?? [0.5, 0.5, 1]);
    gl.uniform2fv(L.uRamp, this.atlas.ramp);
    gl.uniform2fv(L.uBlocks, this.atlas.blocks);
    gl.uniform2fv(L.uRandG, this.atlas.rand);
    gl.uniform2fv(L.uAtlasGrid, this.atlas.grid);
    gl.uniform2fv(L.uTextG, this.atlas.text);
    const tx = (i: number | undefined) => (i != null && i >= 0 ? [i, this.textLen[i] ?? 0] : [0, 0]);
    gl.uniform2fv(L.uTextA, tx(p.textA));
    gl.uniform2fv(L.uTextB, tx(p.textB));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, p.texA ?? this.black);
    gl.uniform1i(L.uTexA, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, p.texB ?? this.black);
    gl.uniform1i(L.uTexB, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.atlasTex);
    gl.uniform1i(L.uAtlas, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.textTex);
    gl.uniform1i(L.uText, 3);
    gl.bindVertexArray(this.vao);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.count);
    gl.bindVertexArray(null);
  }

  clear() {
    const gl = this.gl;
    gl.clearColor(0.02, 0.027, 0.024, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}
