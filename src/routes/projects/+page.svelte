<script>
  import PageShell from "$lib/components/PageShell.svelte";
  import { site } from "$data/site";

  /* data/projects.js is still here — this page just doesn't render it while the
     entries are placeholders. */
  const ELSEWHERE = [
    { href: "/photography", label: "Photography" },
    { href: "/youtube", label: "YouTube" },
    { href: "/resume", label: "Resume" },
  ];
</script>

<svelte:head><title>{`Projects — ${site.name}`}</title></svelte:head>

<PageShell title="Projects" lede="">
  <div class="rounded-2xl border border-dashed border-border px-6 py-14 text-center sm:py-20">
    <p class="type-eyebrow">Coming soon</p>
    <h2 class="mx-auto mt-4 max-w-md type-title">A few things are still in progress.</h2>
    <p class="mx-auto mt-3 max-w-md type-body">
      Check back, or have a look at the sections that are up to date.
    </p>

    <ul class="mt-8 flex flex-wrap justify-center gap-3">
      {#each ELSEWHERE as item (item.href)}
        <li>
          <a
            href={item.href}
            class="inline-flex items-center rounded-xl border border-border px-4 py-2.5
              type-ui transition-[border-color,color,transform]
              duration-200 ease-[var(--ease-tile)] hover:-translate-y-0.5 hover:border-red
              hover:text-red"
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</PageShell>
