<script>
  /**
   * Full-screen view of one photo, with its settings spelled out.
   *
   * The grid's hover overlay is deliberately terse — three numbers, no labels.
   * Here there is room to say which number is which, and to show the location,
   * which the grid only exposes as a filter chip.
   *
   * Keyboard: Escape closes, ← / → move between photos. Focus moves into the
   * dialog on open and returns to the thumbnail that opened it on close.
   */
  import { fade, scale } from "svelte/transition";
  import { createMutation } from "@tanstack/svelte-query";
  import Icon from "./Icon.svelte";
  import PhotoCredit from "./PhotoCredit.svelte";

  let { photos, index, onClose, onIndex } = $props();

  const open = $derived(index != null);
  const photo = $derived(open ? photos[index] : null);

  const next = () => onIndex((index + 1) % photos.length);
  const prev = () => onIndex((index - 1 + photos.length) % photos.length);

  /**
   * Save the photo, in the order the guidelines require: register the download
   * with Unsplash first, then hand over the file.
   *
   * The file comes down as a blob and goes out through a throwaway anchor
   * pointing at an object URL. A plain <a download href={unsplashUrl}> does not
   * work here — the download attribute is ignored on cross-origin hrefs.
   */
  const download = createMutation(() => ({
    mutationFn: async (p) => {
      const src = p.download ?? p.full ?? p.src;
      try {
        // Tracking is required, but it is not the visitor's problem: a failed
        // or rate-limited ping must never be the reason a download does not happen.
        await fetch(`/api/unsplash/download/${p.id}`, { method: "POST" }).catch(() => {});

        // images.unsplash.com sends access-control-allow-origin: *.
        const res = await fetch(src);
        if (!res.ok) throw new Error(`image ${res.status}`);
        const href = URL.createObjectURL(await res.blob());
        const a = document.createElement("a");
        a.href = href;
        a.download = `ryan-kim-photography-${p.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Released on a later tick. Revoking in the same one has historically
        // cancelled the download in Safari before it starts.
        setTimeout(() => URL.revokeObjectURL(href), 10_000);
      } catch {
        // Hand them the image directly rather than failing silently.
        window.open(src, "_blank", "noopener");
      }
    },
  }));

  /** Scroll lock and focus, while open. */
  function dialog(node) {
    const returnFocus = document.activeElement;
    node.focus();

    // The page behind must not scroll under the overlay. Compensating for the
    // scrollbar's width keeps the layout from jumping as it disappears.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return {
      destroy() {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPad;
        returnFocus?.focus?.();
      },
    };
  }

  function onkeydown(e) {
    if (!open) return;
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  }

  const stats = $derived(
    [
      ["Aperture", photo?.exif?.aperture],
      ["Shutter", photo?.exif?.shutter],
      ["ISO", photo?.exif?.iso],
    ].filter(([, value]) => Boolean(value)),
  );
</script>

<svelte:window {onkeydown} />

{#snippet control(label, onclick, icon, busy = false)}
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-busy={busy || undefined}
    disabled={busy}
    onclick={(e) => {
      e.stopPropagation();
      onclick();
    }}
    class="flex h-10 w-10 items-center justify-center rounded-xl border border-border
      bg-surface/80 text-text/70 backdrop-blur transition-colors
      hover:border-red hover:text-red disabled:cursor-progress
      disabled:hover:border-border disabled:hover:text-text/70"
  >
    <Icon name={icon} size={18} class={busy ? "animate-pulse" : ""} />
  </button>
{/snippet}

{#if photo}
  <!-- Backdrop click closes; clicks on the figure below stop propagating. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    use:dialog
    role="dialog"
    aria-modal="true"
    aria-label={photo.caption || photo.alt || "Photograph"}
    tabindex="-1"
    transition:fade={{ duration: 180 }}
    onclick={onClose}
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4
      bg-bg/95 p-4 backdrop-blur-sm outline-none sm:p-8"
  >
    <div class="absolute right-3 top-3 flex items-center gap-1 sm:right-5 sm:top-5">
      <span class="mr-2 type-data">{index + 1} / {photos.length}</span>
      {@render control(
        download.isPending ? "Preparing download…" : "Download photo",
        () => download.mutate(photo),
        "download",
        download.isPending,
      )}
      {@render control("Close", onClose, "close")}
    </div>

    {#if photos.length > 1}
      <div class="absolute left-3 top-1/2 -translate-y-1/2 sm:left-5">
        {@render control("Previous photo", prev, "arrowLeft")}
      </div>
      <div class="absolute right-3 top-1/2 -translate-y-1/2 sm:right-5">
        {@render control("Next photo", next, "arrowRight")}
      </div>
    {/if}

    {#key photo.id ?? photo.src}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
      <figure
        in:scale={{ start: 0.98, duration: 200 }}
        onclick={(e) => e.stopPropagation()}
        class="flex max-h-full min-h-0 max-w-5xl flex-col items-center gap-4"
      >
        <!-- The URL already carries the width, quality and auto=format we want,
             and is the *same* URL PhotoFrame preloads on hover, so the click
             lands on a warm cache entry. -->
        <img
          src={photo.full ?? photo.src}
          alt={photo.alt}
          width={photo.fullWidth ?? photo.width}
          height={photo.fullHeight ?? photo.height}
          fetchpriority="high"
          style:background-image={photo.blurDataURL ? `url(${photo.blurDataURL})` : undefined}
          class="max-h-[70vh] w-auto rounded-lg bg-cover object-contain"
        />

        <!-- The settings, labelled — this is the whole reason the bigger view
             exists. The credit renders whether or not there are settings. -->
        <figcaption class="flex w-full flex-col items-center gap-2.5 text-center">
          {#if photo.caption}<p class="type-meta text-text">{photo.caption}</p>{/if}

          {#if stats.length > 0}
            <dl class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
              {#each stats as [label, value] (label)}
                <div class="flex items-baseline gap-1.5">
                  <dt class="type-data">{label}</dt>
                  <dd class="type-data text-text">{value}</dd>
                </div>
              {/each}
            </dl>
          {/if}

          {#if photo.locationName || photo.exif?.camera}
            <p class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 type-data">
              {#if photo.locationName}
                <span class="inline-flex items-center gap-1">
                  <Icon name="pin" size={12} />
                  {photo.locationName}
                </span>
              {/if}
              {#if photo.exif?.camera}
                <span>{[photo.exif.camera, photo.exif.focal].filter(Boolean).join(" · ")}</span>
              {/if}
            </p>
          {/if}

          <PhotoCredit credit={photo.credit} />
        </figcaption>
      </figure>
    {/key}
  </div>
{/if}
