<script>
  import PageShell from "$lib/components/PageShell.svelte";
  import BrandIcon from "$lib/components/BrandIcon.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { site } from "$data/site";
</script>

<svelte:head><title>{`Contact — ${site.name}`}</title></svelte:head>

<PageShell
  title="Say hi"
  lede="Feel free to reach out by email, or connect with me on LinkedIn!"
>
  <a
    href="mailto:{site.email}"
    class="group inline-flex items-baseline gap-3 type-ui
      text-[clamp(1.5rem,5vw,2.75rem)] tracking-tight
      transition-colors duration-200 hover:text-red"
  >
    {site.email}
    <span
      class="translate-y-0 transition-transform duration-250 ease-[var(--ease-tile)] group-hover:-translate-y-1"
    >
      <Icon name="arrowUpRight" size={22} />
    </span>
  </a>

  <p class="mt-4 flex items-center gap-1.5 type-meta">
    <Icon name="pin" size={14} />
    {site.location}
  </p>

  <section class="mt-14 border-t border-border pt-10">
    <h2 class="type-eyebrow">Elsewhere</h2>
    <ul class="mt-6 divide-y divide-border border-y border-border">
      {#each site.socials as social (social.label)}
        <li>
          <a
            href={social.href}
            target="_blank"
            rel="noreferrer noopener"
            class="group flex items-baseline justify-between gap-4 py-4
              transition-colors hover:text-red"
          >
            <span class="flex items-center gap-3 type-heading">
              <BrandIcon name={social.icon} size={20} />
              {social.label}
            </span>
            <span class="flex items-center gap-2 type-meta transition-colors group-hover:text-red">
              {social.handle}
              <Icon name="arrowUpRight" size={13} />
            </span>
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
</PageShell>
