<script>
  /**
   * Top-right of the home page (above the dock on phones): how to feed the koi,
   * and the ripples switch. Both are hidden under reduced motion, where feeding
   * and water are off.
   *
   * Once the visitor first feeds the koi, the hint fades over to a fun fact,
   * and stays that way on later visits.
   */
  import { onMount, tick } from "svelte";
  import {
    KOI_EVENT,
    markFactSeen,
    readFact,
    readRipples,
    setRipples,
    subscribeFact,
    subscribeRipples,
  } from "./pond.js";

  // Server and first client render agree on the defaults; real values on mount.
  let on = $state(false);
  let fact = $state(false);
  let fading = $state(false);
  let pill;

  onMount(() => {
    on = readRipples();
    fact = readFact();
    const offRipples = subscribeRipples(() => (on = readRipples()));
    const offFact = subscribeFact(() => (fact = readFact()));
    const timers = [];

    // First feed: wait 1.2 s, fade the hint out (300 ms), swap in the fact,
    // grow the pill from its old width to its new one, fade back in. Reduced
    // motion swaps instantly.
    const onKoi = () => {
      window.removeEventListener(KOI_EVENT, onKoi);
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timers.push(
        setTimeout(() => {
          if (instant) return markFactSeen();
          fading = true;
          timers.push(
            setTimeout(async () => {
              const from = pill.offsetWidth;
              markFactSeen();
              fading = false;
              await tick();
              const to = pill.offsetWidth;
              pill.style.width = `${from}px`;
              void pill.offsetWidth; // commit the start width before transitioning
              pill.style.width = `${to}px`;
              timers.push(setTimeout(() => (pill.style.width = ""), 320));
            }, 300),
          );
        }, 1200),
      );
    };
    if (!fact) window.addEventListener(KOI_EVENT, onKoi);

    return () => {
      offRipples();
      offFact();
      window.removeEventListener(KOI_EVENT, onKoi);
      timers.forEach(clearTimeout);
    };
  });
</script>

<div
  class="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 type-data
    motion-reduce:hidden md:top-5 md:right-6 md:bottom-auto md:flex-row md:items-center"
>
  <span
    bind:this={pill}
    aria-hidden="true"
    class="glass-pill overflow-hidden px-3 py-1.5 whitespace-nowrap select-none
      transition-[width] duration-300 ease-[var(--ease-tile)]"
  >
    <span
      class="block transition-opacity duration-300 motion-reduce:transition-none {fading
        ? 'opacity-0'
        : 'opacity-100'}"
    >
      {#if fact}
        Fun fact: these are based on my koi at home
      {:else}
        <span class="[@media(hover:none)]:hidden">Right-click to feed</span>
        <span class="[@media(hover:hover)]:hidden">Tap with two fingers to feed</span>
      {/if}
    </span>
  </span>
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onclick={() => setRipples(!on)}
    class="glass-pill flex cursor-pointer items-center gap-2 py-1.5 pr-1.5 pl-3
      transition-colors hover:text-text
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
  >
    Ripples
    <!-- Track and thumb: red and slid right when on. -->
    <span
      aria-hidden="true"
      class="relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200 {on
        ? 'bg-red'
        : 'bg-text/20'}"
    >
      <span
        class="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm
          transition-transform duration-200 ease-[var(--ease-tile)] {on ? 'translate-x-3' : ''}"
      ></span>
    </span>
  </button>
</div>
