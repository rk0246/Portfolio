import Image from "next/image";
import Icon from "./Icon";

/**
 * A project entry. Featured ones get a wider thumbnail; the rest sit in a
 * two-up grid. Links are real anchors, not the whole card, so a project can
 * carry more than one destination.
 */
export default function ProjectCard({ project }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface
        transition-[border-color,box-shadow,transform] duration-250 ease-[var(--ease-tile)]
        hover:-translate-y-1 hover:border-red hover:shadow-[0_16px_32px_rgba(229,52,43,0.18)]"
    >
      <div className="relative aspect-[16/10] bg-fill">
        <Image
          src={project.thumb}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-bold tracking-tight">{project.title}</h3>
          <span className="font-mono text-xs text-muted">{project.year}</span>
        </div>

        <p className="flex-1 text-sm leading-relaxed text-muted">{project.description}</p>

        <ul className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        {project.links?.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-4 border-t border-border pt-3">
            {project.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-mono text-xs text-text
                    transition-colors hover:text-red"
                >
                  {link.label}
                  <Icon name="arrowUpRight" size={13} />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
