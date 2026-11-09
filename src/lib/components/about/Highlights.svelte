<script>
  /**
   * The /about Highlights timeline.
   *
   * Layout: below md, one column with the hairline at the far left and
   * everything indented past it. From md up, a 140px "when" column, then the
   * line (at 160px, in the middle of the 40px gap), then the content.
   */
  import HighlightItem from "./HighlightItem.svelte";

  let { label, items } = $props();

  // Running photo count before each entry, so every photo gets its own tilt.
  const photoStarts = $derived(
    items.reduce(
      (acc, item, i) => [...acc, acc[i] + (item.images?.length ?? 0) + (item.videos?.length ?? 0)],
      [0],
    ),
  );
</script>

<section aria-labelledby="highlights-heading" class="mt-6 border-t border-border pt-6 sm:mt-7 sm:pt-8">
  <h2 id="highlights-heading" class="type-eyebrow">{label}</h2>

  <div class="relative mt-8">
    <!-- The hairline: one static rule down the whole list. -->
    <div aria-hidden="true" class="absolute top-1 bottom-0 left-[4px] w-px bg-border md:left-[160px]"></div>
    <ol class="space-y-12 sm:space-y-14">
      {#each items as item, i}
        <HighlightItem {item} index={i} photoStart={photoStarts[i]} />
      {/each}
    </ol>
  </div>
</section>
