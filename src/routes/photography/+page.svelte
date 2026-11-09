<script>
  import PageShell from "$lib/components/PageShell.svelte";
  import PhotoGrid from "$lib/components/PhotoGrid.svelte";
  import { site } from "$data/site";

  let { data } = $props();
</script>

<svelte:head><title>{`Photography — ${site.name}`}</title></svelte:head>

<PageShell
  wide
  kicker="Photography"
  title="Photos"
  lede={[
    "Shot mainly on a Sony a7 IV + 24-105mm f/4, 35mm f/1.8, 20mm f/1.8, 70-200mm f/2.8, and a Helios 44m-4.",
    "Click any photo to view it full screen.",
  ]}
>
  {#if data.error}
    <p class="type-meta">{data.error}</p>
  {:else}
    <PhotoGrid photos={data.photos} />
  {/if}
</PageShell>
