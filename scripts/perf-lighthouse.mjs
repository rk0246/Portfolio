/**
 * Lighthouse performance runs for the main pages, mobile and desktop.
 *
 *   node scripts/perf-lighthouse.mjs [baseUrl] [out.json]
 *
 * Run against a production server. Each page/form factor is run 3 times and
 * the median (by performance score) is kept. Reports score, LCP, CLS, TBT and
 * the JS transferred.
 */
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = process.argv[3];
const PAGES = ["/", "/about", "/photography", "/youtube"];
const RUNS = 3;

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });
const flags = { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance"] };

function extract(lhr) {
  const a = lhr.audits;
  const js = (a["network-requests"]?.details?.items ?? [])
    .filter((r) => r.resourceType === "Script")
    .reduce((sum, r) => sum + (r.transferSize ?? 0), 0);
  return {
    score: Math.round(lhr.categories.performance.score * 100),
    lcp: Math.round(a["largest-contentful-paint"].numericValue),
    cls: Math.round(a["cumulative-layout-shift"].numericValue * 1000) / 1000,
    tbt: Math.round(a["total-blocking-time"].numericValue),
    jsKB: Math.round(js / 1024),
  };
}

const results = [];
for (const path of PAGES) {
  for (const form of ["mobile", "desktop"]) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const { lhr } = await lighthouse(BASE + path, flags, form === "desktop" ? desktopConfig : undefined);
      runs.push(extract(lhr));
    }
    runs.sort((x, y) => x.score - y.score);
    const row = { page: path, form, ...runs[Math.floor(RUNS / 2)] };
    results.push(row);
    console.log(JSON.stringify(row));
  }
}

chrome.kill();
if (OUT) writeFileSync(OUT, JSON.stringify(results, null, 2));
