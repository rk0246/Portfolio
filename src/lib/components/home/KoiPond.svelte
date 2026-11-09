<script>
  import { onMount } from "svelte";
  import { startPond } from "./pond.js";

  let canvas;
  onMount(() => startPond(canvas));
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-0 h-full w-full"
></canvas>
