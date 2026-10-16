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
};

/** The 8px accent square where an entry meets the left rail — the only
    accent on an entry besides link hovers. Centred on the 2px rail. */
function Marker() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-[5px] -left-[5px] h-2 w-2 bg-red"
    />
  );
}

/** Small outlined pills: coursework, tags. */
function Pills({ items, label }) {
  return (
    <ul aria-label={label} className="mt-3.5 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full border border-border px-2.5 py-0.5 type-ui text-[13px] text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

const entryClass = "relative max-w-[70ch] border-l-2 border-border pl-5";

/**
 * Experience and Projects & Awards are the same entry in two registers: a dated
 * meta line, the organisation as the title, the role under it, then bullets and
 * tags. One component so the two sections can't drift apart.
 */
function Entry({ meta, title, subtitle, impact, tags }) {
  return (
    <li className={entryClass}>
      <Marker />
      <p className="type-data">{meta}</p>
      <h3 className="mt-1.5 type-title">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-[17px] font-medium text-text">{subtitle}</p>
      )}

      {impact?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {impact.map((line) => (
            <li key={line} className="max-w-[70ch] type-body">
              {line}
            </li>
          ))}
        </ul>
      )}

      {tags?.length > 0 && <Pills items={tags} label="Tags" />}
    </li>
  );
}

function SectionHeading({ children }) {
  return <h2 className="type-eyebrow">{children}</h2>;
}

export default function ResumePage() {
  const linkedin = site.socials.find((s) => s.label === "LinkedIn");

  return (
    <PageShell
      kicker="Resume"
      title="Work"
      lede={[
        "Studying Business Administration and AI at Carnegie Mellon, with experience spanning product, marketing, and data.",
        "The PDF below has the same content, if you'd rather read or print it that way.",
      ]}
    >
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={site.resumePdf}
          download
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5
            type-ui transition-[border-color,color,transform] duration-200
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
              type-ui transition-[border-color,color,transform] duration-200
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
            <li key={entry.school} className={entryClass}>
              <Marker />
              <p className="type-data">
                {entry.dates} · {entry.location}
              </p>
              <h3 className="mt-1.5 type-title">{entry.school}</h3>
              {entry.degree && (
                <p className="mt-1 text-[17px] font-medium text-text">
                  {entry.degree}
                </p>
              )}

              {entry.honors?.length > 0 && (
                <p className="mt-2.5 type-meta tnum">
                  {entry.honors.join(" · ")}
                </p>
              )}

              {entry.coursework?.length > 0 && (
                <Pills items={entry.coursework} label="Relevant coursework" />
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
              <dt className="type-ui text-text">{group.group}</dt>
              <dd className="mt-1.5 type-meta">
                {group.items.join(", ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
