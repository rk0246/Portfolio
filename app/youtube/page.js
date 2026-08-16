import PageShell from "@/components/PageShell";
import VideoEmbed from "@/components/VideoEmbed";
import Icon from "@/components/Icon";
import { channel, featured, videos } from "@/data/youtube";

export const metadata = {
  title: "YouTube",
  description: channel.blurb,
};

export default function YouTubePage() {
  return (
    <PageShell wide kicker="YouTube" title="Video" lede={channel.blurb}>
      <a
        href={channel.url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5
          font-mono text-xs tracking-wide transition-[border-color,color,transform] duration-200
          ease-[var(--ease-tile)] hover:-translate-y-0.5 hover:border-red hover:text-red"
      >
        <Icon name="youtube" size={15} />
        {channel.handle}
        <Icon name="arrowUpRight" size={13} />
        <span className="sr-only">(opens in a new tab)</span>
      </a>

      <section className="mt-12">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Featured</h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <VideoEmbed id={featured.id} title={featured.title} priority />
          <div>
            <h3 className="font-display text-2xl leading-tight font-bold tracking-tight">
              {featured.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{featured.description}</p>
          </div>
        </div>
      </section>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Recent</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2">
          {videos.map((video, i) => (
            <li key={`${video.id}-${i}`}>
              <VideoEmbed id={video.id} title={video.title} />
              <h3 className="mt-3 text-sm font-medium">{video.title}</h3>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
