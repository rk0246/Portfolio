import PageShell from "@/components/PageShell";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/data/projects";

export const metadata = {
  title: "Projects",
  description: "Things I built because they didn't exist.",
};

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <PageShell
      wide
      kicker="Projects"
      title="Built"
      lede="Side projects, tools, and the occasional thing that escaped and became useful."
    >
      <ul className="grid gap-6 md:grid-cols-2">
        {featured.map((project) => (
          <li key={project.title}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>

      {rest.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Also</h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {rest.map((project) => (
              <li key={project.title}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
