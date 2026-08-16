import Image from "next/image";
import PageShell from "@/components/PageShell";
import { about } from "@/data/about";

/* Search results truncate around 160 characters, so the description leads with
   the bio's opening sentence rather than the whole paragraph. */
const [bioOpener] = about.bio.split(/(?<=\.)\s+/);

export const metadata = {
  title: "About",
  description: bioOpener,
};

/** The period is this page's one accent mark, so it never comes from the copy
    itself — strip whatever the data carries and render our own. */
const stem = (text) => text.replace(/\.+\s*$/, "");

export default function AboutPage() {
  return (
    <PageShell tight wide kicker={about.eyebrow} title={stem(about.heading)}>
      {/* Bio and portrait. The prose column is capped near 62ch regardless of
          how wide the shell gets — a full-width paragraph is unreadable. */}
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-14">
        <p className="max-w-[62ch] text-base leading-relaxed sm:text-lg">
          {about.bio}
        </p>

        {/* Portrait slot. Fixed 13rem width, independent of the bio's height.
            The square crop is what keeps this row short: the source is 3:4, so
            rendering it whole would make the column far taller than the 176px
            bio and strand dead space either side of the text under
            items-center. object-cover crops to the square — it never
            distorts. 13rem also caps the slot on phones, where the grid
            collapses to one column and it would otherwise go full-bleed. */}
        <div className="w-full max-w-52">
          <Image
            src={about.portrait}
            alt={about.portraitAlt}
            width={about.portraitWidth}
            height={about.portraitHeight}
            priority
            sizes="13rem"
            className="aspect-square w-full rounded-xl border border-border bg-fill object-cover"
          />
          <p className="mt-2 font-mono text-[11px] text-muted">
            {about.location}
          </p>
        </div>
      </div>

      {/* Both rules on this page carry the same air — 6/7 above, 6/8 below —
          so the header divider and this one read as one rhythm. */}
      <section className="mt-6 border-t border-border pt-6 sm:mt-7 sm:pt-8">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {about.outsideOfWorkLabel}
        </h2>

        {/* Text only — no borders, no cards. The grid is the only structure. */}
        <dl className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {about.hobbies.map((hobby) => (
            <div key={hobby.title}>
              <dt className="font-display text-lg font-bold tracking-tight">
                {stem(hobby.title)}
                <span className="text-red">.</span>
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                {hobby.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
