<script>
  /**
   * The corner readouts around the canvas: clock, viewport size, visitor
   * timezone. The server renders placeholders; real values arrive on mount.
   */
  import { onMount } from "svelte";

  let time = $state("--:--:--");
  let viewport = $state("—");
  let zone = $state("");

  onMount(() => {
    const clock = () => (time = new Date().toLocaleTimeString("en-US", { hour12: true }));
    const size = () => (viewport = `${window.innerWidth}x${window.innerHeight}`);
    // Real, client-derived, and needs no third-party lookup.
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    clock();
    size();
    const timer = setInterval(clock, 1000);
    window.addEventListener("resize", size);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", size);
    };
  });
</script>

<div
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-40 hidden select-none type-data md:block"
>
  <span class="absolute top-5 left-6 glass-pill px-3 py-1.5">{time}</span>
  <span class="absolute bottom-5 left-6 glass-pill px-3 py-1.5">{viewport}</span>
  <span class="absolute right-6 bottom-5 glass-pill px-3 py-1.5">{zone}</span>
</div>
