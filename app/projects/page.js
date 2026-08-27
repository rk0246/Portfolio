import Link from "next/link";
import PageShell from "@/components/PageShell";

export const metadata = {
  title: "Projects",
  description: "A projects section that's still being put together.",
};

/* The grid, ProjectCard and data/projects.js are all still here and still
   wired up — this page just doesn't render them while the entries are
   placeholders. Swap this block back for the grid once there's real work to
   show. */

const ELSEWHERE = [
  { href: "/photography", label: "Photography" },
  { href: "/youtube", label: "YouTube" },
  { href: "/resume", label: "Resume" },
];

export default function ProjectsPage() {
  return (
    <PageShell kicker="In progress" title="Projects" lede="">
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center sm:py-20">
        <p className="font-mono text-xs tracking-[0.2em] text-red uppercase">
          Coming soon
        </p>
        <h2 className="mx-auto mt-4 max-w-md font-display text-2xl leading-tight font-bold tracking-tight">
          A few things are still in progress.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Check back, or have a look at the sections that are up to date.
        </p>

        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {ELSEWHERE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center rounded-xl border border-border px-4 py-2.5
                  font-mono text-xs tracking-wide transition-[border-color,color,transform]
                  duration-200 ease-[var(--ease-tile)] hover:-translate-y-0.5 hover:border-red
                  hover:text-red"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
