<script>
  /**
   * Shared chrome for every non-home page: kicker, display heading, lede.
   * Keeps the section pages visually of a piece without each one re-deciding
   * its own spacing.
   *
   * `lede` takes a string for a single paragraph, or an array of strings to get
   * one <p> per entry.
   */
  let { kicker, title, lede, children, wide = false, tight = false } = $props();

  const ledeParagraphs = $derived((Array.isArray(lede) ? lede : [lede]).filter(Boolean));
</script>

<div
  class="mx-auto w-full px-5 pt-14 pb-28 sm:px-8 sm:pt-20 sm:pb-32 {wide
    ? 'max-w-6xl'
    : 'max-w-3xl'}"
>
  <header class="border-b border-border pb-8 sm:pb-10">
    {#if kicker}
      <p class="type-eyebrow">{kicker}</p>
    {/if}
    <h1 class="mt-3 type-display text-[clamp(2.25rem,7vw,4rem)]">{title}</h1>
    {#if ledeParagraphs.length > 0}
      <div class="mt-4 max-w-2xl space-y-4 type-lead text-muted">
        {#each ledeParagraphs as paragraph}
          <p>{paragraph}</p>
        {/each}
      </div>
    {/if}
  </header>

  <!-- `tight` pulls the body up under the header rule. -->
  <div class={tight ? "pt-6 sm:pt-8" : "pt-10 sm:pt-12"}>
    {@render children()}
  </div>
</div>
