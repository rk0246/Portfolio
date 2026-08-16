"use client";

import { useSyncExternalStore } from "react";

/**
 * The corner readouts around the canvas: clock, viewport size, visitor
 * timezone. All external state, so all read through useSyncExternalStore —
 * the server snapshots render as placeholders and React swaps in the real
 * values right after hydration without a setState-in-effect cascade.
 */

/* ---- clock: one shared interval no matter how many subscribers ---- */
let tick = 0;
let timer = null;
const clockListeners = new Set();

function subscribeClock(onChange) {
  clockListeners.add(onChange);
  timer ??= setInterval(() => {
    tick = Math.floor(Date.now() / 1000);
    clockListeners.forEach((l) => l());
  }, 1000);

  tick = Math.floor(Date.now() / 1000);
  return () => {
    clockListeners.delete(onChange);
    if (clockListeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/* ---- viewport size ---- */
function subscribeResize(onChange) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

const readViewport = () => `${window.innerWidth}x${window.innerHeight}`;

export default function Hud() {
  const seconds = useSyncExternalStore(subscribeClock, () => tick, () => 0);
  const viewport = useSyncExternalStore(subscribeResize, readViewport, () => "—");

  const time = seconds
    ? new Date(seconds * 1000).toLocaleTimeString("en-US", { hour12: true })
    : "--:--:--";

  // Real, client-derived, and needs no third-party lookup. For an actual city
  // you'd read Vercel's x-vercel-ip-city header on the server — which would
  // also make this route dynamic instead of static.
  const zone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 hidden select-none font-mono
        text-[11px] tracking-wide text-muted md:block"
    >
      <span className="absolute top-5 left-6">{time}</span>
      <span className="absolute bottom-5 left-6">{viewport}</span>
      <span className="absolute right-6 bottom-5">{zone}</span>
    </div>
  );
}
