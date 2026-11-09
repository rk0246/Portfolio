<script>
  /**
   * The home page stage: the name on a plane, drifting a little against the
   * cursor. The koi pond (home/KoiPond.svelte) is a fixed canvas behind it;
   * this sits above it (relative z-[1]) at every width.
   *
   * The drift writes --pan-x/--pan-y straight onto the stage from a rAF loop
   * rather than through state. The loop only runs while the canvas is still
   * catching up, and never starts at all under prefers-reduced-motion or below
   * the md breakpoint. Below md the plane just centres the name on the screen.
   */
  import { onMount } from "svelte";
  import { PLANE } from "$data/nav";

  let { children } = $props();
  let stage;

  /** How far the canvas drifts from centre, in screen px, at the very edge. */
  const MAX_X = 12;
  const MAX_Y = 8;
  /** Per-frame approach rate — lower is a longer, lazier glide. */
  const EASE = 0.075;

  onMount(() => {
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
      stage.style.setProperty("--pan-x", `${curX.toFixed(2)}px`);
      stage.style.setProperty("--pan-y", `${curY.toFixed(2)}px`);

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
      stage.style.removeProperty("--pan-x");
      stage.style.removeProperty("--pan-y");
    };
  });
</script>

<div bind:this={stage} class="iso-stage relative z-[1]">
  <div class="iso-plane" style:--plane-w="{PLANE.w}px" style:--plane-h="{PLANE.h}px">
    {@render children()}
  </div>
</div>
