<script>
  /**
   * A video styled like PolaroidImage: the same paper frame, tape, tilt and
   * caption, with the clip itself inside. It shows its poster frame until played
   * and loads only metadata up front. Starts muted; the native controls unmute
   * it, and bring keyboard and screen-reader support with them.
   *
   * `aria-label` carries the description, since <video> has no alt.
   */
  let { video, tilt } = $props();
</script>

<figure class="polaroid" style:--tilt="{tilt}deg">
  <span aria-hidden="true" class="polaroid-tape"></span>
  <video
    src={video.src}
    poster={video.poster}
    width={video.width}
    height={video.height}
    controls
    muted
    playsinline
    preload="metadata"
    aria-label={video.alt}
    class="block h-auto w-full bg-black"
  ></video>
  {#if video.caption}
    <figcaption class="polaroid-caption">{video.caption}</figcaption>
  {/if}
</figure>
