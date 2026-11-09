<script>
  import "@fontsource-variable/inter/opsz.css";
  import "@fontsource/gasoek-one/latin-400.css";
  import "../app.css";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { page } from "$app/state";
  import Dock from "$lib/components/Dock.svelte";
  import { site } from "$data/site";

  let { children } = $props();

  // Client-side requests (the photo download) go through TanStack Query.
  const queryClient = new QueryClient();
</script>

<svelte:head>
  <title>{`${site.name} — ${site.role}`}</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]
      focus:rounded-lg focus:border focus:border-border focus:bg-surface
      focus:px-4 focus:py-2 focus:text-sm"
  >
    Skip to content
  </a>

  <!-- Dock clearance lives in PageShell / the home page rather than here — the
       home canvas is exactly one viewport tall and must not inherit padding
       that would give it a scrollbar. -->
  <main id="main">
    <!-- A short fade-and-rise on every route change. Enter-only, so the old
         page never lingers. The reduced-motion rule in app.css shortens it to
         nothing. -->
    {#key page.url.pathname}
      <div in:fly={{ y: 8, duration: 250, easing: cubicOut }}>
        {@render children()}
      </div>
    {/key}
  </main>

  <Dock />
</QueryClientProvider>
