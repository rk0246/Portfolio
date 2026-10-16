/**
 * Frame-time benchmark for the home page koi pond.
 *
 *   node scripts/perf-home.mjs [baseUrl] [out.json]
 *
 * Run against a production server (next build && next start), never dev.
 * Drives the installed Chrome through playwright-core. For each viewport
 * (1440x900 desktop, 390x844 touch phone) and CPU throttle (1x, 4x) it records
 * rAF frame intervals and long tasks over three 10 s phases:
 *   idle   no input
 *   sweep  a continuous mouse sweep across the screen
 *   clicks 5 left-clicks (startle) and 3 right-clicks (food) on open water
 */
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3];
const PHASE_MS = 10_000;

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  {
    name: "phone",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
];
const THROTTLES = [1, 4];

// Injected before any page script: logs every rAF interval and long task,
// and (by wrapping requestAnimationFrame) how long the page's own rAF
// callbacks run each frame — main-thread work, separate from GPU/raster time.
const LOGGER = () => {
  window.__perf = { frames: [], work: [], longtasks: [] };
  const raf = window.requestAnimationFrame.bind(window);
  let work = 0;
  window.requestAnimationFrame = (cb) =>
    raf((t) => {
      const s = performance.now();
      cb(t);
      work += performance.now() - s;
    });
  let last = 0;
  const tick = (t) => {
    if (last) {
      window.__perf.frames.push(t - last);
      window.__perf.work.push(work);
    }
    work = 0;
    last = t;
    raf(tick);
  };
  raf(tick);
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__perf.longtasks.push(e.duration);
  }).observe({ type: "longtask", buffered: false });
  window.__perfReset = () => {
    window.__perf.frames = [];
    window.__perf.work = [];
    window.__perf.longtasks = [];
  };
};

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
const round = (v) => Math.round(v * 10) / 10;

function summarise({ frames, work, longtasks }) {
  const s = [...frames].sort((a, b) => a - b);
  const w = [...work].sort((a, b) => a - b);
  return {
    frames: s.length,
    p50: round(pct(s, 0.5)),
    p95: round(pct(s, 0.95)),
    max: round(s[s.length - 1]),
    over33: s.filter((v) => v > 33.4).length,
    workP50: round(pct(w, 0.5)),
    workP95: round(pct(w, 0.95)),
    longtasks: longtasks.length,
    longtaskMs: Math.round(longtasks.reduce((a, b) => a + b, 0)),
  };
}

async function phase(page, run) {
  await page.evaluate(() => window.__perfReset());
  await run();
  return summarise(await page.evaluate(() => window.__perf));
}

const results = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });

// PERF_ONLY=desktop-1x (etc.) runs just that one configuration.
const ONLY = process.env.PERF_ONLY;

for (const vp of VIEWPORTS) {
  for (const rate of THROTTLES) {
    if (ONLY && ONLY !== `${vp.name}-${rate}x`) continue;
    const context = await browser.newContext(vp);
    await context.addInitScript(LOGGER);
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(3000); // let the pond mount and settle
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });

    const { width: W, height: H } = vp.viewport;
    const row = { viewport: vp.name, throttle: `${rate}x` };

    row.idle = await phase(page, () => page.waitForTimeout(PHASE_MS));

    row.sweep = await phase(page, async () => {
      const t0 = Date.now();
      while (Date.now() - t0 < PHASE_MS) {
        const u = (Date.now() - t0) / 1000;
        // A Lissajous sweep over the whole screen, fast enough to make wakes.
        const x = W * (0.5 + 0.45 * Math.sin(u * 2.1));
        const y = H * (0.5 + 0.4 * Math.sin(u * 1.3 + 1));
        await page.mouse.move(x, y);
      }
    });

    row.clicks = await phase(page, async () => {
      // Open water away from the name and the dock.
      const spots = [
        [0.15, 0.25], [0.85, 0.3], [0.2, 0.72], [0.8, 0.7], [0.5, 0.15],
        [0.3, 0.45], [0.7, 0.55], [0.12, 0.6],
      ];
      const gap = PHASE_MS / spots.length;
      for (let i = 0; i < spots.length; i++) {
        const [fx, fy] = spots[i];
        await page.mouse.click(W * fx, H * fy, { button: i < 5 ? "left" : "right" });
        await page.waitForTimeout(gap);
      }
    });

    results.push(row);
    console.log(JSON.stringify(row));
    await context.close();
  }
}

await browser.close();
if (OUT) writeFileSync(OUT, JSON.stringify(results, null, 2));
