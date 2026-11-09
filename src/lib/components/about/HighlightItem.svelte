<script>
  /** One entry. `photoStart` is how many photos came before it on the page, so
      every photo gets its own tilt. */
  import PolaroidImage from "./PolaroidImage.svelte";
  import PolaroidVideo from "./PolaroidVideo.svelte";
  import { reveal } from "./reveal.js";

  let { item, index, photoStart } = $props();

  /** Titles render without a trailing period, whatever the data carries. */
  const stem = (text) => text.replace(/\.+\s*$/, "");

  /** Deterministic tilt in [-3, 3] degrees from a running photo number — never
      Math.random(), which would differ between server and client render. */
  const tiltFor = (n) => Math.round((((n * 37 + 11) % 61) / 10 - 3) * 10) / 10;

  // Photos first, then clips; both are "prints" for layout and tilt.
  const media = $derived([
    ...(item.images ?? []).map((m) => ({ ...m, kind: "image" })),
    ...(item.videos ?? []).map((m) => ({ ...m, kind: "video" })),
  ]);
</script>

{#snippet print(m, i)}
  {#if m.kind === "video"}
    <PolaroidVideo video={m} tilt={tiltFor(photoStart + i)} />
  {:else}
    <PolaroidImage image={m} tilt={tiltFor(photoStart + i)} />
  {/if}
{/snippet}

{#snippet text()}
  <div class="min-w-0">
    <h3 class="type-title">{stem(item.title)}</h3>
    <p class="mt-2 max-w-[70ch] type-body">{item.body}</p>

    {#if item.tags?.length > 0}
      <ul class="mt-3 flex flex-wrap gap-2" aria-label="Tags">
        {#each item.tags as tag}
          <li class="rounded-full border border-border px-2.5 py-0.5 type-ui text-[13px] text-muted">
            {tag}
          </li>
        {/each}
      </ul>
    {/if}

    {#if item.link}
      <a href={item.link.href} class="mt-3 inline-block type-ui transition-colors hover:text-red">
        {item.link.label} <span aria-hidden="true">→</span>
      </a>
    {/if}
  </div>
{/snippet}

<li
  use:reveal={index}
  class="highlight-reveal relative pl-8 md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-x-10 md:pl-0"
>
  <!-- Marker on the line: a sharp 10px square in the accent colour. -->
  <span
    aria-hidden="true"
    class="absolute top-[3px] left-0 h-2.5 w-2.5 bg-red md:top-[5px] md:left-[155px]"
  ></span>

  <p class="type-data md:pt-1.5">{item.when}</p>

  <div class="mt-2 md:mt-0">
    {#if media.length === 1}
      <!-- One photo: beside the text on wide screens, under it below that. -->
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        {@render text()}
        <div class="max-w-sm lg:max-w-none">{@render print(media[0], 0)}</div>
      </div>
    {:else}
      {@render text()}
      {#if media.length > 1}
        <!-- Two to four: a row underneath; stacked full width on phones. -->
        <div
          class="mt-7 grid items-start gap-7 {media.length > 3
            ? 'md:max-w-4xl md:grid-cols-4'
            : 'md:max-w-3xl md:grid-cols-3'}"
        >
          {#each media as m, i}
            {@render print(m, i)}
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</li>
