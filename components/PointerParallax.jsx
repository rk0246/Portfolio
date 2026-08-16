"use client";

import { useEffect } from "react";

/** How far the canvas drifts from centre, in screen px, at the very edge. */
const MAX_X = 24;
const MAX_Y = 16;
/** Per-frame approach rate — lower is a longer, lazier glide. */
const EASE = 0.075;

/**
 * Drifts the isometric canvas a little against the cursor, so the scene reads
 * as something you're looking around rather than a flat backdrop.
 *
 * Renders nothing and holds no state: it writes --pan-x/--pan-y straight onto
 * the plane element from a rAF loop. Going through React here would re-render
 * ~1,100 grid cells on every mouse move. That's also why it queries for
 * .iso-plane instead of taking a ref — IsoStage is a server component and
 * keeping it that way is what lets the cells ship without any JS.
 *
 * The loop only runs while the canvas is still catching up, and never starts
 * at all under prefers-reduced-motion or below the md breakpoint.
 */
export default function PointerParallax() {
  useEffect(() => {
    const plane = document.querySelector(".iso-plane");
    if (!plane) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let raf = null;

    const tick = () => {
      curX += (targetX - curX) * EASE;
      curY += (targetY - curY) * EASE;
      plane.style.setProperty("--pan-x", `${curX.toFixed(2)}px`);
      plane.style.setProperty("--pan-y", `${curY.toFixed(2)}px`);

      // Settle and stop rather than spinning a loop forever.
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };

    const start = () => {
      raf ??= requestAnimationFrame(tick);
    };

    const recentre = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    const onMove = (e) => {
      if (!desktop.matches || reduce.matches) return recentre();
      // -1..1 from the centre of the viewport, then pushed the opposite way so
      // the camera appears to follow the cursor rather than the scene chasing it.
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = -nx * MAX_X;
      targetY = -ny * MAX_Y;
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", recentre);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", recentre);
      if (raf) cancelAnimationFrame(raf);
      plane.style.removeProperty("--pan-x");
      plane.style.removeProperty("--pan-y");
    };
  }, []);

  return null;
}
