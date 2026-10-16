/**
 * Full-page screenshots of every page, light and dark, at 1440x900, for
 * checking that a refactor changed nothing visible.
 *
 *   node scripts/perf-shots.mjs <outDir> [baseUrl]
 *   node scripts/perf-shots.mjs --compare <dirA> <dirB>
 *
 * Compare mode prints the share of pixels that differ for each pair (the home
 * page always differs a little: the koi swim).
 */
import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PAGES = ["/", "/about", "/photography", "/youtube", "/projects", "/resume", "/contact"];

if (process.argv[2] === "--compare") {
  const [a, b] = process.argv.slice(3);
  for (const file of readdirSync(a).filter((f) => f.endsWith(".png"))) {
    const [x, y] = await Promise.all(
      [join(a, file), join(b, file)].map((p) => sharp(p).raw().toBuffer({ resolveWithObject: true })),
    );
    if (x.info.width !== y.info.width || x.info.height !== y.info.height) {
      console.log(`${file}: size differs ${x.info.width}x${x.info.height} vs ${y.info.width}x${y.info.height}`);
      continue;
    }
    let diff = 0;
    for (let i = 0; i < x.data.length; i += x.info.channels) {
      if (
        Math.abs(x.data[i] - y.data[i]) > 8 ||
        Math.abs(x.data[i + 1] - y.data[i + 1]) > 8 ||
        Math.abs(x.data[i + 2] - y.data[i + 2]) > 8
      )
        diff++;
    }
    const share = (diff / (x.info.width * x.info.height)) * 100;
    console.log(`${file}: ${share.toFixed(3)}% of pixels differ`);
  }
  process.exit(0);
}

const outDir = process.argv[2];
const BASE = process.argv[3] ?? "http://localhost:3100";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const theme of ["light", "dark"]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
  const page = await context.newPage();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    // Scroll through so lazy images and in-view animations have run.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    const name = (path === "/" ? "home" : path.slice(1)) + `-${theme}.png`;
    await page.screenshot({ path: join(outDir, name), fullPage: true });
    console.log(name);
  }
  await context.close();
}
await browser.close();
