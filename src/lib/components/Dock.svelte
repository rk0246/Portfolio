<script>
  /**
   * The one piece of navigation present on every page. Reads its destinations
   * from data/nav.js so it can never disagree with anything else.
   */
  import { onMount } from "svelte";
  import { crossfade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import { dockSections, isActive } from "$data/nav";
  import DockIcon from "./DockIcon.svelte";
  import Icon from "./Icon.svelte";

  const [send, receive] = crossfade({ duration: 250, easing: cubicOut });

  // Cursor x across the dock, for the magnification. Infinity = not hovering.
  let mouseX = $state(Infinity);

  /* Theme defaults to light — the palette *is* the light one, so dark is an
     explicit opt-in. The inline script in app.html applies the stored value
     before first paint; the DOM is the source of truth after that. */
  let theme = $state("light");
  const readTheme = () =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";

  onMount(() => {
    theme = readTheme();
    // Another tab changed it.
    const onStorage = (e) => {
      if (e.key !== "theme") return;
      document.documentElement.dataset.theme = e.newValue === "dark" ? "dark" : "light";
      theme = readTheme();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  });

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* still applies for this session */
    }
  }

  function onmousemove(e) {
    // Pointer-only, and md+ only: below that the dock scrolls sideways.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && window.innerWidth >= 768) mouseX = e.clientX;
  }
</script>

<nav aria-label="Primary" class="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6">
  <!-- Eight targets have to fit a 375px phone: no gaps and tight padding below
       sm, with overflow-x as the escape hatch on narrower screens rather than a
       clipped or wrapped dock. From md up it never overflows, and overflow must
       be visible there or the hover labels get clipped. -->
  <ul
    {onmousemove}
    onmouseleave={() => (mouseX = Infinity)}
    class="flex max-w-[calc(100vw-1.5rem)] items-center gap-0 overflow-x-auto md:overflow-visible
      glass rounded-2xl px-1 py-1.5 sm:gap-1 sm:rounded-[1.25rem] sm:px-2"
  >
    {#each dockSections as section (section.href)}
      <DockIcon
        {section}
        active={isActive(page.url.pathname, section.href)}
        {mouseX}
        {send}
        {receive}
      />
    {/each}

    <li aria-hidden="true" class="mx-0.5 h-6 w-px shrink-0 bg-border sm:mx-1"></li>

    <li>
      <button
        type="button"
        onclick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        aria-pressed={theme === "dark"}
        title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        class="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text/70
          transition-[color,transform,background-color] duration-200 ease-[var(--ease-tile)]
          hover:-translate-y-1 hover:bg-fill hover:text-red sm:h-13 sm:w-13"
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={21} />
      </button>
    </li>
  </ul>
</nav>
