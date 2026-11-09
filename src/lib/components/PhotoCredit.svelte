<script>
  /**
   * "Photo by <name> on Unsplash" — required on every display of an API photo.
   *
   * Deliberately quiet: small muted text under the gear line, with the links
   * darkening to the text colour on hover. It reads *under* the photo rather
   * than inside PhotoFrame's hover overlay because it contains links, and an
   * anchor nested in a button is invalid HTML.
   */
  import { UNSPLASH_URL } from "$lib/attribution";

  let { credit, class: className = "" } = $props();
</script>

{#snippet link(href, text)}
  <a
    {href}
    target="_blank"
    rel="noreferrer noopener"
    class="underline decoration-border underline-offset-[3px] transition-colors hover:text-text"
    >{text}</a
  >
{/snippet}

{#if credit?.name}
  <p class="type-meta text-xs {className}">
    Photo by {@render link(credit.profileUrl, credit.name)} on {@render link(UNSPLASH_URL, "Unsplash")}
  </p>
{/if}
