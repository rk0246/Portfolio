import Image from "next/image";
import PageShell from "@/components/PageShell";
import Highlights from "@/components/about/Highlights";
import { about } from "@/data/about";
import { highlights } from "@/data/highlights";

export const metadata = {
  title: "About",
};

/** Headings render without a trailing period, whatever the copy carries. */
const stem = (text) => text.replace(/\.+\s*$/, "");

export default function AboutPage() {
  return (
    <PageShell tight wide kicker={about.eyebrow} title={stem(about.heading)}>
      {/* Bio and portrait. The prose column is capped near 62ch regardless of
          how wide the shell gets — a full-width paragraph is unreadable. */}
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-14">
        <p className="max-w-[62ch] type-lead">
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
        </div>
      </div>

      <Highlights label={about.highlightsLabel} items={highlights} />

    </PageShell>
  );
}
