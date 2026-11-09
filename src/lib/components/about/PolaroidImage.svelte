<script>
  /**
   * A photo styled as a printed snapshot: paper border (thicker at the bottom,
   * where the caption goes), a strip of tape, a slight tilt that straightens on
   * hover. The print colours are fixed paper tones, not theme tokens (see
   * .polaroid in app.css).
   *
   * `tilt` is passed in, derived from the photo's position on the page, so it is
   * identical on the server and the client.
   */
  let { image, tilt } = $props();
</script>

<figure class="polaroid" style:--tilt="{tilt}deg">
  <span aria-hidden="true" class="polaroid-tape"></span>
  <img
    src={image.src}
    alt={image.alt}
    width={image.width}
    height={image.height}
    loading="lazy"
    decoding="async"
    class="block h-auto w-full"
  />
  {#if image.caption}
    <figcaption class="polaroid-caption">{image.caption}</figcaption>
  {/if}
</figure>
