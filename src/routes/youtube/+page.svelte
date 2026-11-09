<script>
  import PageShell from "$lib/components/PageShell.svelte";
  import VideoEmbed from "$lib/components/VideoEmbed.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { youtube } from "$data/youtube";
  import { site } from "$data/site";
  import { formatCount } from "$lib/format";

  let { data } = $props();
  const { featured, videos, stats } = $derived(data);
</script>

<!-- Views and likes, when the API returned them. Renders nothing otherwise. -->
{#snippet statLine(s, className = "mt-3")}
  {#if s && (s.views != null || s.likes != null)}
    <p class="flex items-center gap-4 type-data {className}">
      {#if s.views != null}
        <span class="inline-flex items-center gap-1.5">
          <Icon name="eye" size={15} />
          {formatCount(s.views)}
          <span class="sr-only">views</span>
        </span>
      {/if}
      {#if s.likes != null}
        <span class="inline-flex items-center gap-1.5">
          <Icon name="heart" size={14} />
          {formatCount(s.likes)}
          <span class="sr-only">likes</span>
        </span>
      {/if}
    </p>
  {/if}
{/snippet}

<svelte:head><title>{`YouTube — ${site.name}`}</title></svelte:head>

<PageShell
  wide
  kicker="YouTube"
  title="Video"
  lede="Shot-for-shot recreations of scenes from shows and movies on a $3.01 budget. Plus the occasional original short film whenever I feel inspired!"
>
  <section>
    <h2 class="type-eyebrow">Featured</h2>
    <article class="video-card group mt-5">
      <VideoEmbed id={featured.id} title={featured.title} priority />
      <div class="p-5 sm:p-6">
        {#if featured.caption}<h3 class="type-title">{featured.caption}</h3>{/if}
        {@render statLine(stats.get(featured.id))}
      </div>
    </article>
  </section>

  {#if videos.length > 0}
    <section class="mt-14 border-t border-border pt-10">
      <h2 class="type-eyebrow">More</h2>
      <ul class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Index in the key as well as the id: the same video can legitimately
             appear twice. -->
        {#each videos as video, i (`${video.id}-${i}`)}
          <li class="video-card group flex flex-col">
            <VideoEmbed id={video.id} title={video.title} />
            <div class="flex flex-1 flex-col p-4">
              <!-- Underline only (no transition), so there's nothing to reduce
                   for prefers-reduced-motion. -->
              {#if video.caption}
                <h3
                  class="text-[15px] font-medium leading-[1.4] tracking-[-0.01em]
                    text-pretty text-text underline-offset-[3px] md:text-base
                    group-focus-within:underline group-hover:underline"
                >
                  {video.caption}
                </h3>
              {/if}
              {@render statLine(stats.get(video.id), "mt-auto pt-3")}
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="mt-14 border-t border-border pt-10">
    <a
      href={youtube.channelUrl}
      target="_blank"
      rel="noreferrer noopener"
      class="inline-flex items-center gap-2 rounded-xl bg-red px-5 py-3 type-ui text-white transition-[transform,box-shadow] duration-200
        ease-[var(--ease-tile)] hover:-translate-y-0.5
        hover:shadow-[0_12px_24px_rgba(193,18,31,0.28)]"
    >
      <Icon name="youtube" size={16} />
      Subscribe on YouTube
      <Icon name="arrowUpRight" size={13} />
      <span class="sr-only">(opens in a new tab)</span>
    </a>
  </div>
</PageShell>
