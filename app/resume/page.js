import PageShell from "@/components/PageShell";
import Icon from "@/components/Icon";
import { education, experience, skills } from "@/data/resume";
import { site } from "@/data/site";

export const metadata = {
  title: "Resume",
  description: `Experience, education, and skills for ${site.name}.`,
};

export default function ResumePage() {
  return (
    <PageShell
      kicker="Resume"
      title="Work"
      lede="What I've shipped, where, and with whom. The PDF has the same content if you'd rather print it."
    >
      <a
        href={site.resumePdf}
        download
        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5
          font-mono text-xs tracking-wide transition-[border-color,color,transform] duration-200
          ease-[var(--ease-tile)] hover:-translate-y-0.5 hover:border-red hover:text-red"
      >
        <Icon name="download" size={15} />
        Download résumé (PDF)
      </a>

      <section className="mt-12">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Experience</h2>
        <ol className="mt-6 space-y-10">
          {experience.map((job) => (
            <li
              key={`${job.company}-${job.dates}`}
              className="border-l-2 border-border pl-5 transition-colors hover:border-red"
            >
              <p className="font-mono text-xs text-muted">
                {job.dates} · {job.location}
              </p>
              <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight">{job.role}</h3>
              <p className="text-sm text-red">{job.company}</p>

              <ul className="mt-3 space-y-1.5">
                {job.impact.map((line) => (
                  <li key={line} className="text-sm leading-relaxed text-muted">
                    {line}
                  </li>
                ))}
              </ul>

              <ul className="mt-3 flex flex-wrap gap-1.5">
                {job.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Education</h2>
        <ul className="mt-6 space-y-4">
          {education.map((entry) => (
            <li key={entry.school} className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-display text-lg font-bold tracking-tight">{entry.school}</p>
                <p className="text-sm text-muted">{entry.degree}</p>
              </div>
              <p className="font-mono text-xs text-muted">{entry.dates}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Skills</h2>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
          {skills.map((group) => (
            <div key={group.group}>
              <dt className="font-mono text-xs text-red">{group.group}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {group.items.join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
