"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * The home page background: a koi pond on one full-viewport canvas.
 *
 * Purely decorative — the canvas is aria-hidden and ignores the pointer, so the
 * name, dock and pills above it stay clickable and keyboard-reachable. Pointer
 * input is read from `window` instead. Nothing touches `window` outside the
 * effect, and the canvas only starts drawing after hydration, so the HTML name
 * paints first with no layout shift.
 *
 * Behaviour:
 *   - fish-like swimming: a wave that grows toward the tail on a mostly rigid
 *     front, burst-and-glide speed, gentle wander, edge avoidance, separation
 *   - curiosity: koi near a recently moved (mouse/pen) pointer swim over and
 *     circle it
 *   - water: the pond surface is a height field (a 2D wave equation on a
 *     coarse grid) drawn as light and shade over the koi. A fast-moving
 *     pointer drags a wake through it, a click splashes, swimming koi stir it
 *   - click/tap startles every koi in range: a C-bend, then a fast flee that
 *     decays, and a few seconds of ignoring the cursor
 *   - right-click (or a touch long-press) scatters food; nearby koi crowd in
 *     and eat it
 *   - reduced motion: koi drift at ~15% speed, no water or reactions
 */

/* ---------- constants ---------- */

const N = 13; // joints per koi
const WIDTH = [0.55, 0.8, 0.95, 1, 0.98, 0.9, 0.8, 0.7, 0.58, 0.46, 0.36, 0.28, 0.22];
const TAU = Math.PI * 2;
/** Max bend between neighbouring segments (rad). 12 joints x 0.16 ≈ 110° from
    nose to tail at most — a tight C, never a loop. */
const JOINT_LIMIT = 0.16;
/** Max angle between the head's heading and the first body segment (rad). */
const HEAD_LIMIT = 0.45;
/** Max bend between neighbouring segments of the drawn body, wave and C-bend
    included (rad). 12 x 0.2 ≈ 137° nose to tail — curled, never looped. */
const DRAW_LIMIT = 0.2;

const C = {
  red: "#d9381e",
  white: "#f4f1ec",
  orange: "#ee6a1f",
  gold: "#f2b53d",
  black: "#1c1c1c",
  cream: "#f7efdf",
};

/**
 * Koi varieties, in order. Each patch is an ellipse painted inside the body:
 *   at   position along the spine, in joints (0 = head)
 *   off  sideways offset as a share of the local half-width (-1..1)
 *   len  length along the body, in joint spacings
 *   wid  width as a share of the local half-width
 */
const TYPES = [
  {
    // 1. kohaku: white with red
    body: C.white,
    patches: [
      { at: 1.2, off: 0.1, len: 1.7, wid: 1.15, c: C.red },
      { at: 4.6, off: -0.25, len: 2.3, wid: 0.95, c: C.red },
      { at: 8.1, off: 0.2, len: 1.5, wid: 0.85, c: C.red },
    ],
  },
  {
    // 2. orange with white
    body: C.orange,
    patches: [
      { at: 2.6, off: 0.3, len: 1.5, wid: 0.8, c: C.white },
      { at: 7.1, off: -0.2, len: 1.9, wid: 0.9, c: C.white },
    ],
  },
  {
    // 3. showa: black with red and white
    body: C.black,
    patches: [
      { at: 1.0, off: 0, len: 1.6, wid: 1.15, c: C.red },
      { at: 3.6, off: 0.35, len: 1.6, wid: 0.75, c: C.white },
      { at: 5.6, off: -0.3, len: 2.1, wid: 0.85, c: C.red },
      { at: 8.6, off: 0.25, len: 1.4, wid: 0.75, c: C.white },
    ],
  },
  {
    // 4. cream with gold
    body: C.cream,
    patches: [
      { at: 2.1, off: -0.2, len: 2.1, wid: 0.95, c: C.gold },
      { at: 6.6, off: 0.25, len: 2.3, wid: 0.9, c: C.gold },
    ],
  },
  {
    // 5. white with three red
    body: C.white,
    patches: [
      { at: 1.5, off: -0.15, len: 1.6, wid: 1.0, c: C.red },
      { at: 5.0, off: 0.3, len: 1.7, wid: 0.85, c: C.red },
      { at: 8.6, off: -0.2, len: 1.4, wid: 0.8, c: C.red },
    ],
  },
  {
    // 6. solid red with two white
    body: C.red,
    patches: [
      { at: 3.1, off: 0.3, len: 1.5, wid: 0.75, c: C.white },
      { at: 7.6, off: -0.3, len: 1.6, wid: 0.8, c: C.white },
    ],
  },
];

const THEMES = {
  light: {
    bgIn: "#f7f9f9",
    bgOut: "#eef2f3",
    shadow: "rgba(30, 50, 60, 0.12)",
    // Water shading: lit slopes in `hi`, shaded slopes in `shade`. Slopes
    // under `eps` stay clear; above it, alpha ramps up at `hiGain` / 0.55.
    eps: 0.004,
    hi: [255, 255, 255],
    hiGain: 1.1,
    hiMax: 0.42,
    shade: [48, 66, 80],
    shadeMax: 0.16,
    eye: "#151515",
  },
  dark: {
    bgIn: "#101619",
    bgOut: "#070a0b",
    shadow: "rgba(0, 0, 0, 0.4)",
    // Anything light reads loud on a dark pond: highlights are a dim
    // blue-grey, ramp up slowly, and faint swells stay clear. Black shading
    // needs a little more to show at all.
    eps: 0.009,
    hi: [130, 165, 180],
    hiGain: 0.5,
    hiMax: 0.13,
    shade: [0, 0, 0],
    shadeMax: 0.24,
    eye: "#0b0b0b",
  },
};

/** Water grid: CSS px per cell (6 if the device is struggling). */
const WATER_CELL = 4;
const WATER_CELL_SLOW = 6;
/** One wave step per 1/60 s tick, at most 3 ticks a frame, so the waves move
    at the same speed on 60, 120 or 144 Hz screens. */
const WATER_TICK = 1 / 60;
const WATER_MAX_TICKS = 3;
/** Interior damping, and the band along each edge (in cells) that ramps it
    down so waves are soaked up there instead of bouncing back. */
const WATER_DAMP = 0.965;
const WATER_SPONGE = 22;
/** Viscosity: each cell keeps this much of itself and takes the rest evenly
    from its four neighbours, smoothing crests into soft swells. */
const WATER_SELF = 0.78;
const WATER_NEIGHBOUR = 0.055;
/** Slope-to-shade gain (the dead zone and the rest are per theme). */
const WATER_K = 6;

/** Right-clicks (or long-presses) on these keep their normal behaviour. */
const NATIVE_TARGETS = "a, button, nav, input, textarea, [contenteditable], .glass, .glass-pill";
const PELLET_MAX = 45;
const PELLET_LIFE = 26; // s after landing
const PELLET_EAT = 0.14; // s to shrink away once eaten

/* ---------- ripples on/off, remembered in localStorage ----------
   The switch covers the visitor's own ripples: the cursor's wake, the click
   splash and food landing. The koi's wakes always show. Off by default. */

const RIPPLES_KEY = "ripples";
const RIPPLES_EVENT = "portfolio:ripples";
let ripplesMemo = null; // fallback when storage is blocked

function readRipples() {
  try {
    return localStorage.getItem(RIPPLES_KEY) === "on";
  } catch {
    return ripplesMemo ?? false;
  }
}

function setRipples(on) {
  ripplesMemo = on;
  try {
    localStorage.setItem(RIPPLES_KEY, on ? "on" : "off");
  } catch {
    /* still applies for this session */
  }
  window.dispatchEvent(new Event(RIPPLES_EVENT));
}

/** `storage` covers other tabs; the custom event covers this one. */
function subscribeRipples(onChange) {
  window.addEventListener(RIPPLES_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(RIPPLES_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/* ---------- the hint's fun fact, shown once a visitor has played ---------- */

/** Fired on every food drop (right-click, or a touch long-press). */
const KOI_EVENT = "portfolio:koi";
const FACT_KEY = "koiFact";
const FACT_EVENT = "portfolio:koiFact";
let factMemo = false; // fallback when storage is blocked

function readFact() {
  try {
    return factMemo || localStorage.getItem(FACT_KEY) === "1";
  } catch {
    return factMemo;
  }
}

function markFactSeen() {
  factMemo = true;
  try {
    localStorage.setItem(FACT_KEY, "1");
  } catch {
    /* still shows for this visit */
  }
  window.dispatchEvent(new Event(FACT_EVENT));
}

function subscribeFact(onChange) {
  window.addEventListener(FACT_EVENT, onChange);
  return () => window.removeEventListener(FACT_EVENT, onChange);
}

/* ---------- small helpers ---------- */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const wrap = (a) => {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
};

function makeKoi(i, x, y, S) {
  const size = 0.9 + Math.random() * 0.4;
  const sc = S * size;
  const heading = Math.random() * TAU;
  const spacing = 17 * sc;
  const spine = new Float32Array(N * 2);
  for (let j = 0; j < N; j++) {
    spine[j * 2] = x - Math.cos(heading) * spacing * j;
    spine[j * 2 + 1] = y - Math.sin(heading) * spacing * j;
  }
  return {
    type: TYPES[i % TYPES.length],
    size,
    spine, // follow-the-leader chain, no wave
    pts: new Float32Array(N * 2), // drawn points (chain + wave + bend)
    nrm: new Float32Array(N * 2), // unit normals at each joint
    outline: new Float32Array((N * 2 + 1) * 2),
    off: new Float32Array(N), // sideways offsets from wave + bend
    heading,
    speed: 30 * sc,
    phase: Math.random() * TAU,
    seed: Math.random() * TAU,
    period: 2.4 + Math.random() * 1.8,
    // waypoint it is swimming toward, and a safety timeout (s) for reaching it
    tx: x,
    ty: y,
    targetLeft: 0,
    // startle
    fleeX: 0,
    fleeY: 0,
    fleeDelay: -1, // ms until the koi reacts; <0 = none pending
    fleeLeft: 0, // ms of flee remaining
    fleeDur: 1,
    bend: 0,
  };
}

/* ---------- component ---------- */

export default function KoiPond() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverMQ = window.matchMedia("(hover: hover)");

    let reduced = reduceMQ.matches;
    let ripples = readRipples(); // the visitor's own ripples; the koi's always run
    const waterOn = () => !reduced;
    let theme = THEMES.light;
    let bg = null;

    let W = 0;
    let H = 0;
    let S = 1;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let koi = [];

    // pointer
    let px = -9999;
    let py = -9999;
    let lastMove = -1e9;
    let lastMoveT = 0;
    let pointerSpeed = 0; // smoothed, px/s
    let skittishUntil = 0;
    let press = null; // a touch that may become a tap (startle) or a long-press (food)

    // Food pellets. `age` is seconds since landing (negative while in the
    // air); `eaten` is seconds since a koi took it (-1 = not yet).
    const pellets = [];

    let raf = 0;
    let last = 0;
    let running = false;
    let visible = true;
    const frameTimes = [];
    let slowSteps = 0; // 0: none, 1: coarser water, 2: also 1x pixels

    // Water height field: two buffers (previous, current) of gw x gh cells,
    // with a one-cell border that never moves. Plus the image the shading is
    // written into, through a Uint32Array view, and an offscreen canvas to
    // scale it up from.
    let cell = WATER_CELL;
    let gw = 0;
    let gh = 0;
    let prevH = new Float32Array(0);
    let curH = new Float32Array(0);
    let tmpH = new Float32Array(0); // scratch for the viscosity pass
    let dampMap = new Float32Array(0); // per-cell damping, lower near edges
    let dither = new Float32Array(0); // fixed 0..1 per cell, so it never flickers
    let waterImg = null;
    let waterPx = new Uint32Array(0);
    const waterCanvas = document.createElement("canvas");
    const waterCtx = waterCanvas.getContext("2d");
    let waterAcc = 0;
    // Pixel-packing: ImageData is RGBA bytes, so a Uint32 is A<<24|B<<16|G<<8|R
    // on little-endian machines (all browsers in practice).
    const littleEndian = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
    const pack = littleEndian
      ? (r, g, b, a) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0
      : (r, g, b, a) => ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;

    /* ----- setup ----- */

    function paintBg() {
      bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) / 2);
      bg.addColorStop(0, theme.bgIn);
      bg.addColorStop(1, theme.bgOut);
    }

    function readTheme() {
      theme = document.documentElement.dataset.theme === "dark" ? THEMES.dark : THEMES.light;
      if (W) paintBg();
    }

    // Where koi have been lately: an 8x5 grid over the viewport, decaying
    // with a 30 s time constant. Targets avoid hot cells, so the koi keep
    // visiting parts of the pond nobody has been to.
    const HEAT_COLS = 8;
    const HEAT_ROWS = 5;
    const heat = new Float32Array(HEAT_COLS * HEAT_ROWS);
    let heatCW = 1;
    let heatCH = 1;
    const heatAt = (x, y) =>
      heat[
        clamp(Math.floor(y / heatCH), 0, HEAT_ROWS - 1) * HEAT_COLS +
          clamp(Math.floor(x / heatCW), 0, HEAT_COLS - 1)
      ];

    /**
     * Choose a point for a koi to swim to (or, with `self` null, a spawn
     * point): the best of 12 random candidates, scored for room from the
     * other koi and their targets, for cold parts of the pond, and for a
     * sensible hop length, with a little randomness so it never looks planned.
     */
    function pick(self, fromX, fromY) {
      const inset = 60 * S;
      let meanHeat = 0;
      for (let i = 0; i < heat.length; i++) meanHeat += heat[i];
      meanHeat = Math.max(meanHeat / heat.length, 1e-3);
      let bestX = W / 2;
      let bestY = H / 2;
      let best = -Infinity;
      for (let n = 0; n < 12; n++) {
        const x = inset + Math.random() * Math.max(1, W - inset * 2);
        const y = inset + Math.random() * Math.max(1, H - inset * 2);
        let d = Infinity;
        for (const o of koi) {
          if (o === self) continue;
          d = Math.min(d, Math.hypot(x - o.spine[0], y - o.spine[1]), Math.hypot(x - o.tx, y - o.ty));
        }
        let score = Math.min(d, 420) / 420 - (1.3 * heatAt(x, y)) / meanHeat;
        if (self) {
          const hop = Math.hypot(x - fromX, y - fromY) / S;
          score -= 0.9 * Math.max(0, (hop - 450) / 450) + (hop < 160 ? 1 : 0);
        }
        score += Math.random() * 0.45;
        if (score > best) {
          best = score;
          bestX = x;
          bestY = y;
        }
      }
      return [bestX, bestY];
    }

    function retarget(k) {
      const [x, y] = pick(k, k.spine[0], k.spine[1]);
      k.tx = x;
      k.ty = y;
      k.targetLeft = 28 + Math.random() * 14;
    }

    function initKoi() {
      const count = W < 768 ? 4 : 6;
      heat.fill(0);
      koi = [];
      // One at a time, so each spawn point accounts for the ones before it.
      for (let i = 0; i < count; i++) {
        const [x, y] = pick(null, 0, 0);
        const k = makeKoi(i, x, y, S);
        koi.push(k);
      }
      for (const k of koi) retarget(k);
    }

    /** Heat bookkeeping, once per frame. */
    function stepHeat(dt) {
      const decay = Math.exp(-dt / 30);
      for (let i = 0; i < heat.length; i++) heat[i] *= decay;
      for (const k of koi) {
        const c =
          clamp(Math.floor(k.spine[1] / heatCH), 0, HEAT_ROWS - 1) * HEAT_COLS +
          clamp(Math.floor(k.spine[0] / heatCW), 0, HEAT_COLS - 1);
        heat[c] += dt;
      }
    }

    function resize(force = false) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const big = Math.abs(w - W) > 200 || Math.abs(h - H) > 200;
      const countChanged = w < 768 !== W < 768;
      W = w;
      H = h;
      S = clamp(W / 1440, 0.65, 1.25);
      heatCW = W / HEAT_COLS;
      heatCH = H / HEAT_ROWS;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintBg();
      initWater();
      if (force || big || countChanged || koi.length === 0) initKoi();
    }

    function initWater() {
      gw = Math.ceil(W / cell) + 2;
      gh = Math.ceil(H / cell) + 2;
      prevH = new Float32Array(gw * gh);
      curH = new Float32Array(gw * gh);
      tmpH = new Float32Array(gw * gh);
      dampMap = new Float32Array(gw * gh);
      dither = new Float32Array(gw * gh).map(Math.random);
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const d = Math.min(x, y, gw - 1 - x, gh - 1 - y); // cells to nearest edge
          dampMap[y * gw + x] =
            d < WATER_SPONGE ? WATER_DAMP - 0.2 * (1 - d / WATER_SPONGE) ** 2 : WATER_DAMP;
        }
      }
      waterCanvas.width = gw;
      waterCanvas.height = gh;
      waterImg = waterCtx.createImageData(gw, gh);
      waterPx = new Uint32Array(waterImg.data.buffer);
      waterAcc = 0;
    }

    /** Push the surface at (x, y) CSS px: a smooth cosine bump of `amp`
        (negative = down) over `radius` cells, clamped to ±2.5. */
    function poke(x, y, amp, radius) {
      if (!waterOn() || !gw) return;
      const cx = x / cell + 1;
      const cy = y / cell + 1;
      const r = Math.ceil(radius);
      const x0 = Math.max(1, Math.floor(cx - r));
      const x1 = Math.min(gw - 2, Math.ceil(cx + r));
      const y0 = Math.max(1, Math.floor(cy - r));
      const y1 = Math.min(gh - 2, Math.ceil(cy + r));
      for (let gy = y0; gy <= y1; gy++) {
        for (let gx = x0; gx <= x1; gx++) {
          const d = Math.hypot(gx - cx, gy - cy);
          if (d > radius) continue;
          const i = gy * gw + gx;
          const v = curH[i] + amp * (0.5 + 0.5 * Math.cos((Math.PI * d) / radius));
          curH[i] = v > 2.5 ? 2.5 : v < -2.5 ? -2.5 : v;
        }
      }
    }

    /** One step of the discrete wave equation (written over `prevH`), a
        viscosity pass into `tmpH`, then rotate the three buffers. Border
        cells are never written, so they stay at rest. */
    function stepWater() {
      for (let y = 1; y < gh - 1; y++) {
        const row = y * gw;
        for (let x = 1; x < gw - 1; x++) {
          const i = row + x;
          prevH[i] =
            ((curH[i - 1] + curH[i + 1] + curH[i - gw] + curH[i + gw]) * 0.5 - prevH[i]) *
            dampMap[i];
        }
      }
      for (let y = 1; y < gh - 1; y++) {
        const row = y * gw;
        for (let x = 1; x < gw - 1; x++) {
          const i = row + x;
          tmpH[i] =
            prevH[i] * WATER_SELF +
            (prevH[i - 1] + prevH[i + 1] + prevH[i - gw] + prevH[i + gw]) * WATER_NEIGHBOUR;
        }
      }
      const next = tmpH;
      tmpH = prevH;
      prevH = curH;
      curH = next;
    }

    /** Shade each cell by its slope toward a top-left light, then scale the
        little image up over the whole pond. */
    function paintWater() {
      const { eps, hiGain, hiMax, shadeMax } = theme;
      const [hr, hg, hb] = theme.hi;
      const [sr, sg, sb] = theme.shade;
      for (let y = 1; y < gh - 1; y++) {
        const row = y * gw;
        for (let x = 1; x < gw - 1; x++) {
          const i = row + x;
          const v = -(curH[i + 1] - curH[i - 1] + (curH[i + gw] - curH[i - gw])) * WATER_K;
          // Alpha ramps up from the dead zone rather than jumping, so faint
          // swells fade in smoothly instead of showing a hard edge. The
          // dither rounds alpha up or down per cell instead of always down,
          // so those faint fades don't step into visible bands.
          if (v > eps) {
            const s1 = (v - eps) * hiGain;
            const a = s1 < hiMax ? s1 : hiMax;
            waterPx[i] = pack(hr, hg, hb, (a * 255 + dither[i]) | 0);
          } else if (v < -eps) {
            const s2 = (-v - eps) * 0.55;
            const a = s2 < shadeMax ? s2 : shadeMax;
            waterPx[i] = pack(sr, sg, sb, (a * 255 + dither[i]) | 0);
          } else {
            waterPx[i] = 0;
          }
        }
      }
      waterCtx.putImageData(waterImg, 0, 0);
      // "medium" (bilinear), not "high": "high" is a bicubic resample of the
      // whole viewport every frame, which alone held a 2x screen at ~30 fps.
      // On this already-smooth image the two differ by at most 3/255.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      ctx.drawImage(waterCanvas, -cell, -cell, gw * cell, gh * cell);
    }

    /* ----- food ----- */

    /** Scatter 6–9 pellets around (x, y); they land over 220 ms and drift out. */
    function dropFood(x, y) {
      window.dispatchEvent(new Event(KOI_EVENT));
      const n = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU;
        const d = Math.random() ** 0.6 * 42 * S;
        const v = 20 + Math.random() * 30;
        pellets.push({
          x: x + Math.cos(a) * d,
          y: y + Math.sin(a) * d,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          r: (3.4 + Math.random() * 1.4) * S,
          age: -0.001 - Math.random() * 0.22,
          eaten: -1,
          seed: Math.random() * TAU,
        });
      }
      if (pellets.length > PELLET_MAX) pellets.splice(0, pellets.length - PELLET_MAX);
    }

    function stepPellets(dt) {
      const drag = Math.exp(-dt * 2.2);
      for (let i = pellets.length - 1; i >= 0; i--) {
        const p = pellets[i];
        const was = p.age;
        p.age += dt;
        if (p.age < 0) continue; // still in the air
        if (was < 0 && ripples) poke(p.x, p.y, -0.22, 3.2);
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.eaten >= 0) p.eaten += dt;
        if (p.eaten > PELLET_EAT || p.age > PELLET_LIFE) pellets.splice(i, 1);
      }
    }

    /** The closest landed, uneaten pellet within 650*S of (x, y), or null. */
    function nearestFood(x, y) {
      let best = null;
      let bestD = 650 * S;
      for (const p of pellets) {
        if (p.age < 0 || p.eaten >= 0) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      return best;
    }

    function drawPellets() {
      for (const p of pellets) {
        if (p.age < 0) continue;
        // Pop in over 170 ms with a little overshoot, shrink away once
        // eaten, fade over the last 2 s.
        const t = Math.min(1, p.age / 0.17);
        let s = 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;
        if (p.eaten >= 0) s *= 1 - p.eaten / PELLET_EAT;
        if (s <= 0) continue;
        const r = p.r * s;
        const bob = Math.sin(p.age * 2.4 + p.seed);
        ctx.globalAlpha = clamp((PELLET_LIFE - p.age) / 2, 0, 1);
        ctx.fillStyle = "rgba(32, 48, 56, 0.18)";
        ctx.beginPath();
        ctx.arc(p.x + 3 * S, p.y + 4 * S, r * 1.1, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#a86f36";
        ctx.beginPath();
        ctx.arc(p.x, p.y + bob, r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d6a466";
        ctx.beginPath();
        ctx.arc(p.x - 0.3 * r, p.y + bob - 0.3 * r, 0.42 * r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ----- simulation ----- */

    function step(k, dt, time, now) {
      const sc = S * k.size;
      const spacing = 17 * sc;
      const hx = k.spine[0];
      const hy = k.spine[1];
      const motion = reduced ? 0.15 : 1;

      // Start a pending startle once its reaction delay has passed.
      if (k.fleeDelay >= 0) {
        k.fleeDelay -= dt * 1000;
        if (k.fleeDelay < 0) {
          k.fleeLeft = k.fleeDur;
          const side =
            Math.cos(k.heading) * (k.fleeY - hy) - Math.sin(k.heading) * (k.fleeX - hx);
          // C-bend away from the side the disturbance came from.
          k.bend = side > 0 ? -1 : 1;
        }
      }
      k.bend *= Math.exp(-dt * 4.2);

      let vx = 0;
      let vy = 0;
      let turnRate = 1.5;
      let target;
      let ease = 1.5;

      // Soft walls: a push away from each edge that ramps up (squared) over
      // the last 70*S px.
      const wall = 70 * S;
      const pushL = hx < wall ? ((wall - hx) / wall) ** 2 : 0;
      const pushR = W - hx < wall ? ((wall - (W - hx)) / wall) ** 2 : 0;
      const pushT = hy < wall ? ((wall - hy) / wall) ** 2 : 0;
      const pushB = H - hy < wall ? ((wall - (H - hy)) / wall) ** 2 : 0;
      const wallX = pushL - pushR;
      const wallY = pushT - pushB;

      if (k.fleeLeft > 0) {
        // Flee straight away from the startle point, fast, decaying.
        k.fleeLeft -= dt * 1000;
        const u = clamp(k.fleeLeft / k.fleeDur, 0, 1);
        const ax = hx - k.fleeX;
        const ay = hy - k.fleeY;
        const d = Math.hypot(ax, ay) || 1;
        vx += (ax / d) * 3 + wallX * 2.5;
        vy += (ay / d) * 3 + wallY * 2.5;
        target = (45 + 520 * Math.pow(u, 1.6)) * sc;
        turnRate = 7.5 * u + 1.4;
        ease = 9;
      } else {
        const food = nearestFood(hx, hy);
        if (food) {
          // Go for the food, slowing as it gets close, then eat it.
          const fdx = food.x - hx;
          const fdy = food.y - hy;
          const fd = Math.hypot(fdx, fdy) || 1;
          vx += (fdx / fd) * 3 + wallX * 1.2;
          vy += (fdy / fd) * 3 + wallY * 1.2;
          target = (fd < 60 * S ? 30 : fd < 160 * S ? 55 : 85) * sc;
          turnRate = 2.8;
          if (fd < 15 * S) {
            food.eaten = 0;
            poke(food.x, food.y, -0.35, 4);
          }
        } else {
          // Head for this koi's waypoint, weaving rather than beelining.
          k.targetLeft -= dt;
          if (Math.hypot(k.tx - hx, k.ty - hy) < 40 * S || k.targetLeft <= 0) retarget(k);
          const tdx = k.tx - hx;
          const tdy = k.ty - hy;
          const td = Math.hypot(tdx, tdy) || 1;
          const weave = k.heading + Math.sin(time * 0.5 + k.seed) * 0.8;
          vx += (tdx / td) * 1.1 + Math.cos(weave) * 0.8 + wallX * 2.4;
          vy += (tdy / td) * 1.1 + Math.sin(weave) * 0.8 + wallY * 2.4;
        }

        // Separation: a squared falloff out to 260*S — only 55*S around
        // food, so the koi crowd in.
        const sep = (food ? 55 : 260) * S;
        for (const o of koi) {
          if (o === k) continue;
          const dx = hx - o.spine[0];
          const dy = hy - o.spine[1];
          const d = Math.hypot(dx, dy);
          if (d > 0 && d < sep) {
            const f = 1.5 * (1 - d / sep) ** 2;
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
        }

        // Curiosity toward a recently moved pointer (not while eating).
        if (!food && !reduced && now - lastMove < 2500 && now > skittishUntil) {
          const dx = px - hx;
          const dy = py - hy;
          const d = Math.hypot(dx, dy);
          if (d < 420 && d > 0) {
            const close = 110 * S;
            const f = d < close ? -0.9 : 1.8;
            vx += (dx / d) * f;
            vy += (dy / d) * f;
            // A sideways pull so they circle instead of stacking.
            if (d < close * 1.6) {
              vx += (-dy / d) * 0.8;
              vy += (dx / d) * 0.8;
            }
          }
        }

        // Burst and glide.
        if (!food) target = (26 + 40 * Math.max(0, Math.sin((time / k.period) * TAU + k.seed))) * sc;
      }

      // Turn toward the desired direction at a limited rate.
      const want = Math.atan2(vy, vx);
      const diff = wrap(want - k.heading);
      const maxTurn = turnRate * dt;
      k.heading = wrap(k.heading + clamp(diff, -maxTurn, maxTurn));
      // The head can't point further off the body's line than a real fish's
      // neck allows — it has to swim the body round, not spin in place.
      const bodyDir = Math.atan2(k.spine[1] - k.spine[3], k.spine[0] - k.spine[2]);
      k.heading = wrap(bodyDir + clamp(wrap(k.heading - bodyDir), -HEAD_LIMIT, HEAD_LIMIT));
      k.speed += (target * motion - k.speed) * Math.min(1, dt * ease);

      // Move the head, then let the chain follow — with a joint limit, so each
      // segment can only angle so far from the one ahead of it. Without it a
      // hard turn folds the body back on itself into a loop.
      k.spine[0] += Math.cos(k.heading) * k.speed * dt;
      k.spine[1] += Math.sin(k.heading) * k.speed * dt;
      let prevAngle = k.heading + Math.PI; // tailward direction of the head
      for (let j = 1; j < N; j++) {
        const ax = k.spine[(j - 1) * 2];
        const ay = k.spine[(j - 1) * 2 + 1];
        const raw = Math.atan2(k.spine[j * 2 + 1] - ay, k.spine[j * 2] - ax);
        const angle = prevAngle + clamp(wrap(raw - prevAngle), -JOINT_LIMIT, JOINT_LIMIT);
        k.spine[j * 2] = ax + Math.cos(angle) * spacing;
        k.spine[j * 2 + 1] = ay + Math.sin(angle) * spacing;
        prevAngle = angle;
      }

      // Swim wave: rigid front, swinging tail.
      const amp = sc * (7 + 16 * Math.min(1, k.speed / (200 * sc)));
      k.phase += dt * (4 + k.speed / (18 * sc)) * (reduced ? 0.4 : 1);

      // Sideways offsets the swim wave and the startle C-bend ask for.
      for (let j = 0; j < N; j++) {
        const t = j / (N - 1);
        k.off[j] =
          Math.sin(k.phase - j * 0.3) * amp * Math.pow(t, 2.2) +
          Math.sin(k.phase - j * 0.3 + 3.14) * amp * 0.14 * Math.pow(1 - t, 2) +
          k.bend * Math.pow(t, 1.5) * 26 * sc;
      }

      // Rebuild the drawn body from the head, turning those offsets into bend
      // angles at each joint instead of pushing points sideways. Segments keep
      // their length (no stretched or crossed-over tail), and every joint's
      // bend is capped, so wave + C-bend + a tight turn still can't loop.
      const hnx = Math.sin(k.heading);
      const hny = -Math.cos(k.heading);
      k.pts[0] = k.spine[0] + hnx * k.off[0];
      k.pts[1] = k.spine[1] + hny * k.off[0];
      let drawPrev = k.heading + Math.PI;
      for (let j = 1; j < N; j++) {
        const spineA = Math.atan2(
          k.spine[j * 2 + 1] - k.spine[(j - 1) * 2 + 1],
          k.spine[j * 2] - k.spine[(j - 1) * 2],
        );
        const waveA = Math.atan2(k.off[j] - k.off[j - 1], spacing);
        const ang =
          drawPrev + clamp(wrap(spineA - waveA - drawPrev), -DRAW_LIMIT, DRAW_LIMIT);
        k.pts[j * 2] = k.pts[(j - 1) * 2] + Math.cos(ang) * spacing;
        k.pts[j * 2 + 1] = k.pts[(j - 1) * 2 + 1] + Math.sin(ang) * spacing;
        drawPrev = ang;
      }

      // Normals from the drawn body, so the outline width follows its shape.
      for (let j = 0; j < N; j++) {
        const a = Math.max(0, j - 1);
        const b = Math.min(N - 1, j + 1);
        const dx = k.pts[a * 2] - k.pts[b * 2];
        const dy = k.pts[a * 2 + 1] - k.pts[b * 2 + 1];
        const d = Math.hypot(dx, dy) || 1;
        k.nrm[j * 2] = -dy / d;
        k.nrm[j * 2 + 1] = dx / d;
      }
    }

    /* ----- drawing ----- */

    // Trace the smoothed closed body outline into the current path.
    function traceBody(k, ox = 0, oy = 0) {
      const sp = 17 * S * k.size;
      const o = k.outline;
      let n = 0;
      // Nose, ahead of the first joint.
      const hdx = k.pts[0] - k.pts[2];
      const hdy = k.pts[1] - k.pts[3];
      const hd = Math.hypot(hdx, hdy) || 1;
      o[n++] = k.pts[0] + (hdx / hd) * sp * 0.65;
      o[n++] = k.pts[1] + (hdy / hd) * sp * 0.65;
      for (let j = 0; j < N; j++) {
        const w = WIDTH[j] * sp;
        o[n++] = k.pts[j * 2] + k.nrm[j * 2] * w;
        o[n++] = k.pts[j * 2 + 1] + k.nrm[j * 2 + 1] * w;
      }
      for (let j = N - 1; j >= 0; j--) {
        const w = WIDTH[j] * sp;
        o[n++] = k.pts[j * 2] - k.nrm[j * 2] * w;
        o[n++] = k.pts[j * 2 + 1] - k.nrm[j * 2 + 1] * w;
      }
      const count = n / 2;
      // Quadratic curves through the midpoints of the closed polygon.
      ctx.beginPath();
      const lx = (o[(count - 1) * 2] + o[0]) / 2 + ox;
      const ly = (o[(count - 1) * 2 + 1] + o[1]) / 2 + oy;
      ctx.moveTo(lx, ly);
      for (let i = 0; i < count; i++) {
        const nI = (i + 1) % count;
        ctx.quadraticCurveTo(
          o[i * 2] + ox,
          o[i * 2 + 1] + oy,
          (o[i * 2] + o[nI * 2]) / 2 + ox,
          (o[i * 2 + 1] + o[nI * 2 + 1]) / 2 + oy,
        );
      }
      ctx.closePath();
    }

    function drawTail(k) {
      const sp = 17 * S * k.size;
      const bx = k.pts[(N - 1) * 2];
      const by = k.pts[(N - 1) * 2 + 1];
      let dx = bx - k.pts[(N - 2) * 2];
      let dy = by - k.pts[(N - 2) * 2 + 1];
      const d = Math.hypot(dx, dy) || 1;
      dx /= d;
      dy /= d;
      const nx = -dy;
      const ny = dx;
      const sway = Math.sin(k.phase - N * 0.3) * 0.35;
      const L = sp * 2.3;
      const Wd = sp * 1.15;
      const tx = bx + dx * L;
      const ty = by + dy * L;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(
        bx + dx * L * 0.5 + nx * Wd * (1 + sway),
        by + dy * L * 0.5 + ny * Wd * (1 + sway),
        tx + nx * Wd * (0.9 + sway),
        ty + ny * Wd * (0.9 + sway),
      );
      ctx.quadraticCurveTo(
        tx - dx * L * 0.25,
        ty - dy * L * 0.25,
        tx - nx * Wd * (0.9 - sway),
        ty - ny * Wd * (0.9 - sway),
      );
      ctx.quadraticCurveTo(
        bx + dx * L * 0.5 - nx * Wd * (1 - sway),
        by + dy * L * 0.5 - ny * Wd * (1 - sway),
        bx,
        by,
      );
      ctx.closePath();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = k.type.body;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawFins(k) {
      const sp = 17 * S * k.size;
      const j = 2;
      const x = k.pts[j * 2];
      const y = k.pts[j * 2 + 1];
      const nx = k.nrm[j * 2];
      const ny = k.nrm[j * 2 + 1];
      // Unit vector pointing back along the body.
      let bx = k.pts[(j + 1) * 2] - x;
      let by = k.pts[(j + 1) * 2 + 1] - y;
      const bd = Math.hypot(bx, by) || 1;
      bx /= bd;
      by /= bd;
      const flap = Math.sin(k.phase * 0.9) * 0.2;
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = k.type.body;
      for (let s = -1; s <= 1; s += 2) {
        const out = 0.85 + flap;
        const angle = Math.atan2(by * 0.6 + ny * s * out, bx * 0.6 + nx * s * out);
        const reach = WIDTH[j] * sp;
        ctx.beginPath();
        ctx.ellipse(
          x + nx * s * reach * 0.9 + Math.cos(angle) * sp * 0.5,
          y + ny * s * reach * 0.9 + Math.sin(angle) * sp * 0.5,
          sp * 0.95,
          sp * 0.42,
          angle,
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawKoi(k) {
      const sp = 17 * S * k.size;

      // Soft shadow on the pond floor: two offset silhouettes.
      ctx.fillStyle = theme.shadow;
      traceBody(k, 7 * S, 11 * S);
      ctx.fill();
      ctx.globalAlpha = 0.5;
      traceBody(k, 10 * S, 15 * S);
      ctx.fill();
      ctx.globalAlpha = 1;

      drawTail(k);
      drawFins(k);

      // Body, then patches and sheen clipped to it.
      traceBody(k);
      ctx.fillStyle = k.type.body;
      ctx.fill();
      ctx.save();
      ctx.clip();
      for (const p of k.type.patches) {
        const j = Math.min(N - 1, Math.floor(p.at));
        const f = p.at - j;
        const j2 = Math.min(N - 1, j + 1);
        const x = k.pts[j * 2] + (k.pts[j2 * 2] - k.pts[j * 2]) * f;
        const y = k.pts[j * 2 + 1] + (k.pts[j2 * 2 + 1] - k.pts[j * 2 + 1]) * f;
        const nx = k.nrm[j * 2];
        const ny = k.nrm[j * 2 + 1];
        const half = WIDTH[j] * sp;
        ctx.beginPath();
        ctx.ellipse(
          x + nx * p.off * half,
          y + ny * p.off * half,
          (p.len * sp) / 2,
          p.wid * half,
          Math.atan2(-nx, ny),
          0,
          TAU,
        );
        ctx.fillStyle = p.c;
        ctx.fill();
      }
      // Sheen across the back.
      const j = 4;
      const cx = k.pts[j * 2];
      const cy = k.pts[j * 2 + 1];
      const half = WIDTH[j] * sp;
      const g = ctx.createLinearGradient(
        cx + k.nrm[j * 2] * half,
        cy + k.nrm[j * 2 + 1] * half,
        cx - k.nrm[j * 2] * half,
        cy - k.nrm[j * 2 + 1] * half,
      );
      g.addColorStop(0, "rgba(255,255,255,0.22)");
      g.addColorStop(0.45, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - sp * 12, cy - sp * 12, sp * 24, sp * 24);
      ctx.restore();

      // Eyes, a third of the way from the first joint to the second.
      const ex = k.pts[0] + (k.pts[2] - k.pts[0]) * 0.35;
      const ey = k.pts[1] + (k.pts[3] - k.pts[1]) * 0.35;
      const ew = ((WIDTH[0] + WIDTH[1]) / 2) * sp * 0.55;
      ctx.fillStyle = theme.eye;
      for (let s = -1; s <= 1; s += 2) {
        ctx.beginPath();
        ctx.arc(ex + k.nrm[0] * ew * s, ey + k.nrm[1] * ew * s, 1.7 * S * k.size, 0, TAU);
        ctx.fill();
      }
    }

    /* ----- loop ----- */

    function frame(ts) {
      raf = 0;
      if (!running) return;
      const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
      last = ts;
      const now = performance.now();
      const time = now / 1000;

      stepPellets(dt);
      for (const k of koi) step(k, dt, time, now);
      stepHeat(dt);

      if (waterOn()) {
        // Swimming koi stir the surface: a trough at the tail, a little at the head.
        for (const k of koi) {
          const sc = S * k.size;
          if (k.speed <= 0.15 * 66 * sc) continue; // 66*sc = top cruising speed
          const q = Math.min(1, k.speed / (150 * sc));
          poke(k.pts[(N - 1) * 2], k.pts[(N - 1) * 2 + 1], -0.03 * q * q, 3.5);
          poke(k.pts[0], k.pts[1], -0.015 * q, 3.2);
        }
        // Fixed timestep, so wave speed doesn't depend on the refresh rate.
        waterAcc += dt;
        let ticks = 0;
        while (waterAcc >= WATER_TICK && ticks < WATER_MAX_TICKS) {
          stepWater();
          waterAcc -= WATER_TICK;
          ticks++;
        }
        if (ticks === WATER_MAX_TICKS) waterAcc = 0;
      }

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      drawPellets();
      for (const k of koi) drawKoi(k);
      if (waterOn()) paintWater();

      // Too slow? First coarsen the water grid, then drop to 1x pixels.
      if (slowSteps < 2) {
        frameTimes.push(performance.now() - now);
        if (frameTimes.length >= 30) {
          const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          frameTimes.length = 0;
          if (avg > 24) {
            if (slowSteps === 0) {
              cell = WATER_CELL_SLOW;
              initWater();
              slowSteps = 1;
            } else {
              if (dpr > 1) {
                dpr = 1;
                resize();
              }
              slowSteps = 2;
            }
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || document.hidden || !visible) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    /* ----- input ----- */

    function onMove(e) {
      // A touch that wanders more than 10px isn't a long-press: it's a tap.
      if (press && e.pointerId === press.id) {
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) endPress(true);
      }
      if (reduced || e.pointerType === "touch" || !hoverMQ.matches) return;
      const x = e.clientX;
      const y = e.clientY;
      const t = performance.now();
      const fromX = px;
      const fromY = py;
      const dist = Math.hypot(x - fromX, y - fromY);
      const dtMs = t - lastMoveT;
      px = x;
      py = y;
      lastMove = t;
      lastMoveT = t;
      // First event, or back after a pause: no speed to speak of yet.
      if (fromX < -9000 || dtMs > 250 || dtMs <= 0) {
        pointerSpeed = 0;
        return;
      }
      pointerSpeed = pointerSpeed * 0.6 + (dist / (dtMs / 1000)) * 0.4;

      // A hand dragged through the water: slow movement leaves almost
      // nothing, fast movement a real wake. Interpolate along the path, but
      // never more than 260px per event so a jumping pointer can't draw a
      // streak across the pond.
      const k = Math.min(1, pointerSpeed / 1100);
      if (!ripples || k <= 0.02 || dist === 0) return;
      const span = Math.min(dist, 260);
      const ux = (x - fromX) / dist;
      const uy = (y - fromY) / dist;
      const amp = -0.04 * Math.pow(k, 1.2);
      const radius = 4 + 2 * k;
      for (let d = 0; d <= span; d += 3.6) {
        poke(x - ux * (span - d), y - uy * (span - d), amp, radius);
      }
    }

    function onDown(e) {
      if (reduced) return;
      const x = e.clientX;
      const y = e.clientY;
      // Touch on open water: wait to see if it's a tap (startle on release)
      // or a 500 ms hold (food).
      if (e.pointerType === "touch") {
        endPress(false);
        if (e.target.closest?.(NATIVE_TARGETS)) return startle(x, y);
        press = {
          id: e.pointerId,
          x,
          y,
          timer: setTimeout(() => {
            press = null;
            dropFood(x, y);
          }, 500),
        };
        return;
      }
      // Right (or ctrl-) click is for feeding, below.
      if (e.button !== 0 || e.ctrlKey) return;
      startle(x, y);
    }

    function onUp(e) {
      if (press && e.pointerId === press.id) endPress(true);
    }

    /** Finish a pending touch, startling at its start point if it was a tap. */
    function endPress(asTap) {
      if (!press) return;
      clearTimeout(press.timer);
      if (asTap) startle(press.x, press.y);
      press = null;
    }

    function onContextMenu(e) {
      if (reduced || e.target.closest?.(NATIVE_TARGETS)) return;
      e.preventDefault();
      // A touch long-press also fires this; the press timer handles that one.
      if (press || e.pointerType === "touch") return;
      dropFood(e.clientX, e.clientY);
    }

    function startle(x, y) {
      // Splash: a sharp dip with a broader lift around it.
      if (ripples) {
        poke(x, y, -0.9, 7);
        poke(x, y, 0.25, 11);
      }
      skittishUntil = performance.now() + 3800;
      for (const k of koi) {
        const d = Math.hypot(k.spine[0] - x, k.spine[1] - y);
        if (d >= 950) continue;
        k.fleeX = x;
        k.fleeY = y;
        k.fleeDelay = d * 0.22 + Math.random() * 60;
        k.fleeDur = 520 + (1 - Math.min(1, d / 950)) * 620;
      }
    }

    const onVisibility = () => (document.hidden ? stop() : start());
    // Reduced motion flattens the water, so it comes back calm.
    const onWaterChange = () => {
      reduced = reduceMQ.matches;
      ripples = readRipples();
      if (!waterOn()) {
        prevH.fill(0);
        curH.fill(0);
        tmpH.fill(0);
      }
    };

    /* ----- wire up ----- */

    readTheme();
    resize(true);

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const mo = new MutationObserver(readTheme);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMQ.addEventListener("change", onWaterChange);
    const unsubscribeRipples = subscribeRipples(onWaterChange);

    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("visibilitychange", onVisibility);
      endPress(false);
      reduceMQ.removeEventListener("change", onWaterChange);
      unsubscribeRipples();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}

/**
 * Top-right of the home page (above the dock on phones): how to feed the koi,
 * and the ripples switch. Both are hidden under reduced motion, where feeding
 * and water are off.
 *
 * Once the visitor first feeds the koi, the hint fades over to a
 * fun fact, and stays that way on later visits.
 */
export function PondControls() {
  const on = useSyncExternalStore(subscribeRipples, readRipples, () => false);
  const fact = useSyncExternalStore(subscribeFact, readFact, () => false);
  const [fading, setFading] = useState(false);
  const pillRef = useRef(null);
  const fromWidth = useRef(0);

  // First feed: wait 1.2 s, fade the hint out (300 ms), swap in
  // the fact, fade back in. Reduced motion swaps instantly.
  useEffect(() => {
    if (fact) return;
    const timers = [];
    const onKoi = () => {
      window.removeEventListener(KOI_EVENT, onKoi);
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timers.push(
        setTimeout(() => {
          if (instant) return markFactSeen();
          setFading(true);
          timers.push(
            setTimeout(() => {
              fromWidth.current = pillRef.current?.offsetWidth ?? 0;
              markFactSeen();
              setFading(false);
            }, 300),
          );
        }, 1200),
      );
    };
    window.addEventListener(KOI_EVENT, onKoi);
    return () => {
      window.removeEventListener(KOI_EVENT, onKoi);
      timers.forEach(clearTimeout);
    };
  }, [fact]);

  // After the swap, animate the pill from its old width to its new one, then
  // hand the width back to the content.
  useLayoutEffect(() => {
    const el = pillRef.current;
    const from = fromWidth.current;
    if (!el || !from) return;
    fromWidth.current = 0;
    const to = el.offsetWidth;
    el.style.width = `${from}px`;
    void el.offsetWidth; // commit the start width before transitioning
    el.style.width = `${to}px`;
    const t = setTimeout(() => (el.style.width = ""), 320);
    return () => clearTimeout(t);
  }, [fact]);

  return (
    <div
      className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 type-data
        motion-reduce:hidden md:top-5 md:right-6 md:bottom-auto md:flex-row md:items-center"
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="glass-pill overflow-hidden px-3 py-1.5 whitespace-nowrap select-none
          transition-[width] duration-300 ease-[var(--ease-tile)]"
      >
        <span
          className={`block transition-opacity duration-300 motion-reduce:transition-none ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {fact ? (
            "Fun fact: these are based on my koi at home"
          ) : (
            <>
              <span className="[@media(hover:none)]:hidden">Right-click to feed</span>
              <span className="[@media(hover:hover)]:hidden">Hold to feed</span>
            </>
          )}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setRipples(!on)}
        className="glass-pill flex cursor-pointer items-center gap-2 py-1.5 pr-1.5 pl-3
          transition-colors hover:text-text
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
      >
        Ripples
        {/* Track and thumb: red and slid right when on. */}
        <span
          aria-hidden="true"
          className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 ${
            on ? "bg-red" : "bg-text/20"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm
              transition-transform duration-200 ease-[var(--ease-tile)] ${on ? "translate-x-3" : ""}`}
          />
        </span>
      </button>
    </div>
  );
}
