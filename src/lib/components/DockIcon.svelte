<script>
  /**
   * One dock destination, with macOS-style magnification: `mouseX` is the
   * cursor's x across the whole dock (Infinity when it isn't over it). The
   * icon's slot grows with its closeness to the cursor, pushing neighbours
   * aside, while the icon itself scales up from its bottom edge so it rises out
   * of the bar. The active page keeps the accent tint, plus a dot that slides
   * between icons on navigation (the crossfade pair comes from the Dock).
   */
  import { Spring } from "svelte/motion";
  import Icon from "./Icon.svelte";

  /** Resting size of an icon, px. Matches sm:h-13 / sm:w-13. */
  const BASE = 52;
  /** Size of the icon directly under the cursor, and how far the effect reaches. */
  const PEAK = 90;
  const REACH = 150;

  let { section, active, mouseX, send, receive } = $props();
  let el;

  const size = new Spring(BASE, { stiffness: 0.3, damping: 0.9 });

  $effect(() => {
    const b = el.getBoundingClientRect();
    const d = Math.abs(mouseX - (b.left + b.width / 2));
    size.target = d < REACH ? PEAK - ((PEAK - BASE) * d) / REACH : BASE;
  });
</script>

<!-- Exposed as CSS variables and applied only from md up, so the dock keeps
     its compact fixed sizes on phones. -->
<li
  bind:this={el}
  style:--slot="{size.current}px"
  class="group relative h-10 w-10 shrink-0 sm:h-13 sm:w-13 md:w-[var(--slot)]"
>
  <div
    style:--scale={size.current / BASE}
    class="absolute bottom-0 left-1/2 -ml-[20px] h-10 w-10 origin-bottom
      sm:-ml-[26px] sm:h-13 sm:w-13 md:[transform:scale(var(--scale))]"
  >
    <a
      href={section.href}
      aria-label={section.label}
      aria-current={active ? "page" : undefined}
      class="flex h-full w-full items-center justify-center rounded-xl
        transition-[color,background-color] duration-200 ease-[var(--ease-tile)]
        hover:bg-fill hover:text-red
        {active ? 'text-red' : 'text-text/70'}"
    >
      <Icon name={section.icon} size={23} />
    </a>
  </div>

  <!-- Label — pointer-only affordance, so it stays off small screens. Rides the
       magnified icon's top edge and pops up with a springy overshoot; the arrow
       is a rotated square so it follows the pill's colour. -->
  <span
    aria-hidden="true"
    style:--lift="{-(size.current - BASE)}px"
    class="pointer-events-none absolute bottom-full left-1/2 hidden md:block md:[transform:translate(-50%,var(--lift))]"
  >
    <span
      class="mb-3 block translate-y-2 scale-90 whitespace-nowrap rounded-lg bg-text
        px-2.5 py-1 type-ui text-[13px] text-bg opacity-0
        shadow-[0_6px_16px_rgba(0,0,0,0.18)] relative
        transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100
        group-focus-within:translate-y-0 group-focus-within:scale-100
        group-focus-within:opacity-100"
    >
      {section.label}
      <span
        class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-text"
      ></span>
    </span>
  </span>

  {#if active}
    <span
      in:receive={{ key: "dock-active" }}
      out:send={{ key: "dock-active" }}
      class="pointer-events-none absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red"
    ></span>
  {/if}
</li>
