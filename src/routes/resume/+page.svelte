<script>
  import PageShell from "$lib/components/PageShell.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { education, experience, projectsAndAwards, skills } from "$data/resume";
  import { site } from "$data/site";

  const linkedin = site.socials.find((s) => s.label === "LinkedIn");
  const entryClass = "relative max-w-[70ch] border-l-2 border-border pl-5";
  const buttonClass = `inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5
    type-ui transition-[border-color,color,transform] duration-200
    ease-[var(--ease-tile)] hover:-translate-y-0.5 hover:border-red hover:text-red`;

  /* Experience and Projects & Awards are the same entry in two registers: a
     dated meta line, the organisation as the title, the role under it, then
     bullets and tags. One snippet so the two sections can't drift apart. */
  const entries = [
    {
      heading: "Experience",
      items: experience.map((job) => ({
        key: `${job.company}-${job.dates}`,
        meta: job.location ? `${job.dates} · ${job.location}` : job.dates,
        title: job.company,
        subtitle: job.role,
        impact: job.impact,
        tags: job.tags,
      })),
    },
    {
      heading: "Projects & Awards",
      items: projectsAndAwards.map((item) => ({
        key: `${item.title}-${item.dates}`,
        meta: item.dates,
        title: item.title,
        subtitle: item.note ?? item.role,
        impact: item.impact,
        tags: item.tags,
      })),
    },
  ];
</script>

<!-- The 8px accent square where an entry meets the left rail — the only accent
     on an entry besides link hovers. Centred on the 2px rail. -->
{#snippet marker()}
  <span aria-hidden="true" class="absolute top-[5px] -left-[5px] h-2 w-2 bg-red"></span>
{/snippet}

<!-- Small outlined pills: coursework, tags. -->
{#snippet pills(items, label)}
  <ul aria-label={label} class="mt-3.5 flex flex-wrap gap-1.5">
    {#each items as item}
      <li class="rounded-full border border-border px-2.5 py-0.5 type-ui text-[13px] text-muted">
        {item}
      </li>
    {/each}
  </ul>
{/snippet}

<svelte:head><title>{`Resume — ${site.name}`}</title></svelte:head>

<PageShell
  kicker="Resume"
  title="Work"
  lede={[
    "Studying Business Administration and AI at Carnegie Mellon, with experience spanning product, marketing, and data.",
    "The PDF below has the same content, if you'd rather read or print it that way.",
  ]}
>
  <div class="flex flex-wrap items-center gap-3">
    <a href={site.resumePdf} download class={buttonClass}>
      <Icon name="download" size={15} />
      Download résumé (PDF)
    </a>

    {#if linkedin}
      <a href={linkedin.href} target="_blank" rel="noreferrer noopener" class={buttonClass}>
        LinkedIn
        <Icon name="arrowUpRight" size={13} />
        <span class="sr-only">(opens in a new tab)</span>
      </a>
    {/if}
  </div>

  <section class="mt-12">
    <h2 class="type-eyebrow">Education</h2>
    <ol class="mt-6 space-y-9">
      {#each education as entry (entry.school)}
        <li class={entryClass}>
          {@render marker()}
          <p class="type-data">{entry.dates} · {entry.location}</p>
          <h3 class="mt-1.5 type-title">{entry.school}</h3>
          {#if entry.degree}
            <p class="mt-1 text-[17px] font-medium text-text">{entry.degree}</p>
          {/if}
          {#if entry.honors?.length > 0}
            <p class="mt-2.5 type-meta tnum">{entry.honors.join(" · ")}</p>
          {/if}
          {#if entry.coursework?.length > 0}
            {@render pills(entry.coursework, "Relevant coursework")}
          {/if}
        </li>
      {/each}
    </ol>
  </section>

  {#each entries as section (section.heading)}
    <section class="mt-14 border-t border-border pt-10">
      <h2 class="type-eyebrow">{section.heading}</h2>
      <ol class="mt-6 space-y-10">
        {#each section.items as entry (entry.key)}
          <li class={entryClass}>
            {@render marker()}
            <p class="type-data">{entry.meta}</p>
            <h3 class="mt-1.5 type-title">{entry.title}</h3>
            {#if entry.subtitle}
              <p class="mt-1 text-[17px] font-medium text-text">{entry.subtitle}</p>
            {/if}
            {#if entry.impact?.length > 0}
              <ul class="mt-3 space-y-1.5">
                {#each entry.impact as line}
                  <li class="max-w-[70ch] type-body">{line}</li>
                {/each}
              </ul>
            {/if}
            {#if entry.tags?.length > 0}
              {@render pills(entry.tags, "Tags")}
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  {/each}

  <section class="mt-14 border-t border-border pt-10">
    <h2 class="type-eyebrow">Skills</h2>
    <dl class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each skills as group (group.group)}
        <div>
          <dt class="type-ui text-text">{group.group}</dt>
          <dd class="mt-1.5 type-meta">{group.items.join(", ")}</dd>
        </div>
      {/each}
    </dl>
  </section>
</PageShell>
