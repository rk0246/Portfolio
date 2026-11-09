<script>
  import IsoStage from "$lib/components/IsoStage.svelte";
  import Hud from "$lib/components/Hud.svelte";
  import KoiPond from "$lib/components/home/KoiPond.svelte";
  import PondControls from "$lib/components/home/PondControls.svelte";
  import { site } from "$data/site";

  // "Ryan Kim" -> "Ryan" / "Kim". Anything after the first space stacks below.
  const [firstName, ...rest] = site.name.split(" ");
  const lastName = rest.join(" ");
</script>

<!-- Decorative canvas behind everything; starts after hydration. -->
<KoiPond />

<IsoStage>
  <!-- The only thing on the plane. Navigation lives entirely in the dock. -->
  <div class="iso-name">
    <h1
      aria-label={site.name}
      class="type-display text-center text-[clamp(2.6rem,9vw,7.8rem)] uppercase
        leading-[1.1538] tracking-[0.06em]"
    >
      <!-- Blocks rather than a wrapped line, so the shorter name centres under
           the longer one. -->
      <a href="/about" aria-label="{site.name}, about">
        <span aria-hidden="true" class="block">
          <span class="name-line">{firstName}</span>
        </span>
        {#if lastName}
          <span aria-hidden="true" class="block">
            <span class="name-line">{lastName}</span>
          </span>
        {/if}
      </a>
    </h1>
  </div>
</IsoStage>

<Hud />
<PondControls />
