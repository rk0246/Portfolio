import PageShell from "@/components/PageShell";
import Icon from "@/components/Icon";
import {
  education,
  experience,
  projectsAndAwards,
  skills,
} from "@/data/resume";
import { site } from "@/data/site";

export const metadata = {
  title: "Resume",
  description: `Education, experience, projects, and skills for ${site.name}.`,
};

/**
 * Experience and Projects & Awards are the same card in two registers: a dated
 * meta line, the organisation in display type, the role in the accent, then
 * bullets and tags. One component so the two sections can't drift apart.
 */
function Entry({ meta, title, subtitle, impact, tags }) {
  return (
    <li className="border-l-2 border-border pl-5 transition-colors hover:border-red">
      <p className="font-mono text-xs text-muted">{meta}</p>
      <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight">
        {title}
      </h3>
      {subtitle && <p className="mt-0.5 text-sm text-red">{subtitle}</p>}

      {impact?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {impact.map((line) => (
            <li key={line} className="text-sm leading-relaxed text-muted">
              {line}
            </li>
          ))}
        </ul>
      )}

      {tags?.length > 0 && (
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
      {children}
    </h2>
  );
}

export default function ResumePage() {
  const linkedin = site.socials.find((s) => s.label === "LinkedIn");

  return (
    <PageShell
      kicker="Resume"
      title="Work"
      lede="Business and AI at Carnegie Mellon, with product, marketing, and data work in between. The PDF holds the same content if you'd rather print it."
    >
      <div className="flex flex-wrap items-center gap-3">
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

        {linkedin && (
          <a
            href={linkedin.href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5
              font-mono text-xs tracking-wide transition-[border-color,color,transform] duration-200
              ease-[var(--ease-tile)] hover:-translate-y-0.5 hover:border-red hover:text-red"
          >
            LinkedIn
            <Icon name="arrowUpRight" size={13} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>

      <section className="mt-12">
        <SectionHeading>Education</SectionHeading>
        <ol className="mt-6 space-y-9">
          {education.map((entry) => (
            <li
              key={entry.school}
              className="border-l-2 border-border pl-5 transition-colors hover:border-red"
            >
              <p className="font-mono text-xs text-muted">
                {entry.dates} · {entry.location}
              </p>
              <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight">
                {entry.school}
              </h3>
              {entry.degree && (
                <p className="mt-0.5 text-sm text-red">{entry.degree}</p>
              )}

              {/* Short attribute list, so one mono line rather than a stack. */}
              {entry.honors?.length > 0 && (
                <p className="mt-2.5 font-mono text-xs text-muted">
                  {entry.honors.join("  ·  ")}
                </p>
              )}

              {entry.coursework?.length > 0 && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  <span className="text-text">Relevant coursework</span> —{" "}
                  {entry.coursework.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <SectionHeading>Experience</SectionHeading>
        <ol className="mt-6 space-y-10">
          {experience.map((job) => (
            <Entry
              key={`${job.company}-${job.dates}`}
              meta={job.location ? `${job.dates} · ${job.location}` : job.dates}
              title={job.company}
              subtitle={job.role}
              impact={job.impact}
              tags={job.tags}
            />
          ))}
        </ol>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <SectionHeading>Projects &amp; Awards</SectionHeading>
        <ol className="mt-6 space-y-10">
          {projectsAndAwards.map((item) => (
            <Entry
              key={`${item.title}-${item.dates}`}
              meta={item.dates}
              title={item.title}
              subtitle={item.note ?? item.role}
              impact={item.impact}
              tags={item.tags}
            />
          ))}
        </ol>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <SectionHeading>Skills</SectionHeading>
        <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
