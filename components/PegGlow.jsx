"use client";

import { useEffect } from "react";

/**
 * Lights up the pegs near the cursor.
 *
 * The pegs are a CSS background, so there is nothing per-peg to hover; instead
 * .iso-glow (a child of the .iso-dots layer) repeats the same pegs in the
 * accent colour, masked to a soft circle at the cursor. This component only
 * feeds it the cursor position, in the glow layer's own coordinates — measured
 * from its bounding box, which already includes the layer's drift, so the glow
 * stays on the right pegs while the board moves.
 *
 * Renders nothing. Writes straight to the element from a rAF-throttled
 * handler, so React never re-renders on mouse move.
 */
export default function PegGlow() {
  useEffect(() => {
    const glow = document.querySelector(".iso-glow");
    if (!glow) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    let raf = null;
    let x = 0;
    let y = 0;

    const paint = () => {
      raf = null;
      const r = glow.getBoundingClientRect();
      glow.style.setProperty("--mx", `${x - r.left}px`);
      glow.style.setProperty("--my", `${y - r.top}px`);
      glow.style.setProperty("--glow", "1");
    };

    const onMove = (e) => {
      if (!desktop.matches) return;
      x = e.clientX;
      y = e.clientY;
      raf ??= requestAnimationFrame(paint);
    };
    const off = () => glow.style.setProperty("--glow", "0");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", off);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", off);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
