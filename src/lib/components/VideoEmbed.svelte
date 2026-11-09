<script>
  /**
   * Click-to-load YouTube facade.
   *
   * Nothing from youtube.com is requested until the user actually asks for the
   * video — a real embed is roughly a megabyte of third-party JS *per player*,
   * and this page shows several at once. Until then it is one static JPEG.
   */
  let { id, title, priority = false } = $props();

  /* maxresdefault only exists for videos uploaded at 1080p+ — older or SD
     uploads 404 on it. Walk down to hqdefault, which YouTube generates for
     every video; past the end of the list the bg-fill placeholder shows. */
  const THUMB_SIZES = ["maxresdefault", "hqdefault"];

  let playing = $state(false);
  let sizeStep = $state(0);
  const thumbSize = $derived(THUMB_SIZES[sizeStep]);
</script>

<div class="relative aspect-video overflow-hidden rounded-xl border border-border bg-fill">
  {#if playing}
    <iframe
      src="https://www.youtube.com/embed/{id}?autoplay=1"
      {title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      class="absolute inset-0 h-full w-full"
    ></iframe>
  {:else}
    <button
      type="button"
      onclick={() => (playing = true)}
      aria-label="Play: {title}"
      class="group absolute inset-0 h-full w-full cursor-pointer"
    >
      {#if thumbSize}
        <img
          src="https://img.youtube.com/vi/{id}/{thumbSize}.jpg"
          alt=""
          loading={priority ? "eager" : "lazy"}
          onerror={() => sizeStep++}
          class="absolute inset-0 h-full w-full object-cover"
        />
      {/if}

      <!-- Overlay covering the whole thumbnail, centring the circle with grid —
           no percentage offsets or translates to drift. -->
      <span class="absolute inset-0 grid place-items-center">
        <span
          class="grid aspect-square w-14 shrink-0 place-items-center rounded-full bg-red
            text-white shadow-lg transition-transform duration-250 ease-[var(--ease-tile)]
            group-hover:scale-110 md:w-16"
        >
          <!-- 40% of the circle. The path sits right of the viewBox centre on
               purpose (the usual optical nudge for a right-pointing triangle). -->
          <svg viewBox="0 0 24 24" aria-hidden="true" class="block w-2/5" fill="currentColor">
            <path d="M8.5 5.5 L8.5 18.5 L19 12 Z" />
          </svg>
        </span>
      </span>
    </button>
  {/if}
</div>
