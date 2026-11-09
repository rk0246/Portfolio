<script>
  import PageShell from "$lib/components/PageShell.svelte";
  import Highlights from "$lib/components/about/Highlights.svelte";
  import { about } from "$data/about";
  import { highlights } from "$data/highlights";
  import { site } from "$data/site";

  /** Headings render without a trailing period, whatever the copy carries. */
  const stem = (text) => text.replace(/\.+\s*$/, "");
</script>

<svelte:head><title>{`About — ${site.name}`}</title></svelte:head>

<PageShell tight wide title={stem(about.heading)}>
  <!-- Bio and portrait. The prose column is capped near 62ch regardless of how
       wide the shell gets — a full-width paragraph is unreadable. -->
  <div class="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-14">
    <div class="max-w-[62ch] space-y-5 type-lead">
      {#each about.bio as paragraph}
        <p>{paragraph}</p>
      {/each}
    </div>

    <!-- Portrait slot. Fixed 13rem width, independent of the bio's height. The
         square crop is what keeps this row short: the source is 3:4.
         object-cover crops to the square — it never distorts. -->
    <div class="w-full max-w-52">
      <img
        src={about.portrait}
        alt={about.portraitAlt}
        width={about.portraitWidth}
        height={about.portraitHeight}
        fetchpriority="high"
        class="aspect-square w-full rounded-xl border border-border bg-fill object-cover"
      />
    </div>
  </div>

  <Highlights label={about.highlightsLabel} items={highlights} />
</PageShell>
