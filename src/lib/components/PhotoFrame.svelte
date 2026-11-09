<script module>
  import { withParams } from "$lib/attribution";

  /** URLs already requested, so a pointer sweeping the grid asks for each photo
      once rather than on every re-entry. */
  const preloaded = new Set();

  /**
   * Start fetching the lightbox source while the pointer is still on the
   * thumbnail, so the click opens onto an image that is already arriving.
   * Fire-and-forget: the lightbox requests the same URL again regardless.
   */
  function preload(url) {
    if (!url || preloaded.has(url)) return;
    preloaded.add(url);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
  }

  /** The grid source is urls.regular (1080px); imgix resizes on the `w` param. */
  const WIDTHS = [400, 640, 1080];
  const srcset = (photo) =>
    WIDTHS.filter((w) => w <= photo.width)
      .map((w) => `${withParams(photo.src, { w })} ${w}w`)
      .join(", ");
</script>

<script>
  /**
   * One photo in the masonry.
   *
   * Deliberately unframed — no border, no shadow. The gap between photos is the
   * only thing organising the grid. width/height keep each image at its true
   * proportions so the column heights stagger on their own.
   *
   * Exposure settings ride in an overlay that fades in over the bottom of the
   * image on hover. Each field drops out individually when a photo's data lacks
   * it, and the overlay is skipped entirely when none of the three are present.
   */
  import PhotoCredit from "./PhotoCredit.svelte";

  let { photo, priority = false, onOpen } = $props();

  const exif = $derived(photo.exif ?? {});
  // Built by filtering rather than interpolating, so a missing field costs a
  // separator instead of printing "undefined".
  const settings = $derived(
    [exif.shutter, exif.aperture, exif.iso && `ISO ${exif.iso}`].filter(Boolean),
  );
  const gear = $derived([exif.camera, exif.lens, exif.focal].filter(Boolean));
</script>

<figure class="group mb-4 break-inside-avoid">
  <!-- A button rather than the figure itself: the caption below stays plain
       text, and the photo gets the site's one focus treatment for free.
       Pointer rather than mouse, so a touch also gets the head start between
       finger-down and the click. Focus covers the keyboard path. -->
  <button
    type="button"
    onclick={() => onOpen?.()}
    onpointerenter={() => preload(photo.full)}
    onfocus={() => preload(photo.full)}
    aria-label="View {photo.caption || photo.alt || 'photo'} larger"
    class="relative block w-full cursor-zoom-in overflow-hidden rounded-xl bg-fill"
  >
    <img
      src={photo.src}
      srcset={srcset(photo)}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={priority ? "eager" : "lazy"}
      fetchpriority={priority ? "high" : undefined}
      decoding="async"
      style:background-image={photo.blurDataURL ? `url(${photo.blurDataURL})` : undefined}
      class="h-auto w-full bg-cover"
    />

    {#if settings.length > 0}
      <!-- Left in the accessibility tree (opacity, not hidden) so the numbers
           are still reachable without a pointer, and pinned open where hover
           does not exist at all. -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-x-3
          bg-gradient-to-t from-black/70 via-black/35 to-transparent px-3 pb-2.5 pt-10
          type-data text-white opacity-0 transition-opacity duration-250
          ease-[var(--ease-tile)] group-hover:opacity-100 group-focus-visible:opacity-100
          [@media(hover:none)]:opacity-100"
      >
        {#each settings as setting}
          <span>{setting}</span>
        {/each}
      </div>
    {/if}
  </button>

  <!-- Always rendered: the Unsplash credit is not optional. -->
  <figcaption class="px-0.5 pt-2.5">
    {#if photo.caption}<p class="type-meta text-text">{photo.caption}</p>{/if}
    {#if gear.length > 0}
      <p class="mt-1 type-data leading-[1.8]">{gear.join(" · ")}</p>
    {/if}
    <PhotoCredit credit={photo.credit} class="mt-1" />
  </figcaption>
</figure>
