<script>
  /**
   * The photo grid and its location filter.
   *
   * One masonry holding every photo, narrowed in place by the chips above it.
   * Filtering is client state rather than a route, so switching locations is
   * instant and never refetches an image the browser already has.
   *
   * Locations come from whatever each photo was tagged with on Unsplash, so a
   * chip only appears for a place that actually has photos. Untagged photos
   * are reachable under "All".
   */
  import PhotoFrame from "./PhotoFrame.svelte";
  import Lightbox from "./Lightbox.svelte";
  import { displayLocation } from "$lib/locations";
  import { pushState, replaceState } from "$app/navigation";
  import { page } from "$app/state";

  const ALL = "all";

  let { photos } = $props();

  let active = $state(ALL);
  // Index into `shown`, so arrow keys walk the filtered set, not the whole one.
  // The open photo lives in history state (shallow routing), so the browser's
  // Back button closes the lightbox instead of leaving the page. Keyed by id,
  // not index, so a stale entry can't open the wrong photo under another filter.
  const openIndex = $derived.by(() => {
    const i = shown.findIndex((p) => (p.id ?? p.src) === page.state.photo);
    return i < 0 ? null : i;
  });
  const keyOf = (i) => shown[i].id ?? shown[i].src;

  const locations = $derived.by(() => {
    const byslug = new Map();
    for (const photo of photos) {
      if (!photo.location) continue;
      const entry = byslug.get(photo.location);
      if (entry) entry.count++;
      else byslug.set(photo.location, { slug: photo.location, name: photo.locationName, count: 1 });
    }
    return [...byslug.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  const shown = $derived(active === ALL ? photos : photos.filter((p) => p.location === active));
  const activeName = $derived(locations.find((l) => l.slug === active)?.name);

  function select(slug) {
    active = slug;
  }

  // No right-click "Save image", drag-to-desktop, or iOS long-press save on the
  // photos (grid and lightbox both render inside this div), so the lightbox's
  // Download button is the way to get a file. Only images: right-click on the
  // chips or caption text still works.
  // shortcut: a deterrent, not protection — devtools and screenshots still work.
  const blockOnImage = (e) => {
    if (e.target.closest("img")) e.preventDefault();
  };
</script>

<!-- type-ui label, type-data count. The border is always 1px (red when
     active), so selecting a chip never changes its size. -->
{#snippet chip(label, fullLabel, count, selected, onclick)}
  {@const description = `${fullLabel}, ${count} ${count === 1 ? "photo" : "photos"}`}
  <button
    type="button"
    {onclick}
    aria-pressed={selected}
    aria-label={description}
    title={description}
    class="rounded-full border px-4 py-2 type-ui text-[13px]
      whitespace-nowrap transition-colors duration-150 focus-visible:outline-2
      focus-visible:outline-offset-2 focus-visible:outline-red
      {selected ? 'border-red bg-red text-white' : 'border-border text-text hover:border-text'}"
  >
    {label}
    <span
      class="ml-2 type-data text-xs {selected
        ? 'text-[color-mix(in_srgb,var(--color-red)_30%,white)]'
        : ''}">{count}</span
    >
  </button>
{/snippet}

{#if photos.length === 0}
  <p class="type-meta">No photos yet.</p>
{:else}
  <div
    role="presentation"
    oncontextmenu={blockOnImage}
    ondragstart={blockOnImage}
    class="[&_img]:select-none [&_img]:[-webkit-touch-callout:none]"
  >
    {#if locations.length > 1}
      <div role="group" aria-label="Filter photos by location" class="mb-7 flex flex-wrap gap-2">
        {@render chip("All", "All", photos.length, active === ALL, () => select(ALL))}
        {#each locations as location (location.slug)}
          {@render chip(
            displayLocation(location.name),
            location.name,
            location.count,
            active === location.slug,
            () => select(location.slug),
          )}
        {/each}
      </div>
    {/if}

    <!-- CSS columns rather than grid: the set mixes portrait and landscape, and
         masonry keeps every photo at its true aspect ratio without cropping. -->
    <div class="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {#each shown as photo, i (photo.id ?? photo.src)}
        <PhotoFrame {photo} priority={i < 2} onOpen={() => pushState("", { photo: keyOf(i) })} />
      {/each}
    </div>

    <Lightbox
      photos={shown}
      index={openIndex}
      onClose={() => history.back()}
      onIndex={(i) => replaceState("", { photo: keyOf(i) })}
    />

    <!-- Filtering rearranges the page silently for a screen reader otherwise. -->
    <p aria-live="polite" class="sr-only">
      Showing {shown.length}
      {shown.length === 1 ? "photo" : "photos"}{activeName
        ? ` from ${activeName}`
        : " from all locations"}
    </p>
  </div>
{/if}
