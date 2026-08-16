import PageShell from "@/components/PageShell";
import Icon from "@/components/Icon";
import { site } from "@/data/site";

export const metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
};

export default function ContactPage() {
  return (
    <PageShell
      kicker="Contact"
      title="Say hi"
      lede="Email is the surest way to reach me. I read everything, and I answer most of it."
    >
      <a
        href={`mailto:${site.email}`}
        className="group inline-flex items-baseline gap-3 font-display
          text-[clamp(1.5rem,5vw,2.75rem)] font-bold tracking-tight
          transition-colors duration-200 hover:text-red"
      >
        {site.email}
        <span className="translate-y-0 transition-transform duration-250 ease-[var(--ease-tile)] group-hover:-translate-y-1">
          <Icon name="arrowUpRight" size={22} />
        </span>
      </a>

      <p className="mt-4 flex items-center gap-1.5 font-mono text-xs text-muted">
        <Icon name="pin" size={14} />
        {site.location}
      </p>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Elsewhere</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {site.socials.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-baseline justify-between gap-4 py-4
                  transition-colors hover:text-red"
              >
                <span className="font-display text-lg font-bold tracking-tight">
                  {social.label}
                </span>
                <span className="flex items-center gap-2 font-mono text-xs text-muted transition-colors group-hover:text-red">
                  {social.handle}
                  <Icon name="arrowUpRight" size={13} />
                </span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
