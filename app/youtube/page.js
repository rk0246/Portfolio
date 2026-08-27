import PageShell from "@/components/PageShell";
import VideoEmbed from "@/components/VideoEmbed";
import Icon from "@/components/Icon";
import { youtube } from "@/data/youtube";

export const metadata = {
  title: "YouTube",
  description: "Scenes from film and TV, recreated on a $3.01 budget.",
};

/**
 * data/youtube.js lets an entry be a bare ID string or { id, title }. Normalise
 * both to one shape here so nothing downstream has to check.
 *
 * `title` is the accessible name and is always a string — an <iframe> with no
 * title and a button with no label are both unusable without sight. `caption`
 * is the visible line under the video and stays undefined when the data has no
 * real title, so a placeholder like "Video 2" never renders on screen.
 */
function asVideo(entry, position) {
  const video = typeof entry === "string" ? { id: entry } : entry;
  return {
    id: video.id,
    caption: video.title,
    title: video.title || `Video ${position}`,
  };
}

export default function YouTubePage() {
  const featured = asVideo(youtube.featured, 1);
  const videos = youtube.videos.map((entry, i) => asVideo(entry, i + 2));

  return (
    <PageShell
      wide
      kicker="YouTube"
      title="Video"
      lede="Shot-for-shot recreations of scenes from film and TV, built on a $3.01 budget. Plus the occasional original short film whenever I feel inspired!"
    >
      <section>
        <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Featured
        </h2>
        <div className="mt-5">
          <VideoEmbed id={featured.id} title={featured.title} priority />
          {featured.caption && (
            <h3 className="mt-4 font-display text-2xl leading-tight font-bold tracking-tight">
              {featured.caption}
            </h3>
          )}
        </div>
      </section>

      {videos.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            More
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, i) => (
              /* Index in the key as well as the id: the same video can
                 legitimately appear twice, and duplicate keys break React. */
              <li key={`${video.id}-${i}`}>
                <VideoEmbed id={video.id} title={video.title} />
                {video.caption && (
                  <h3 className="mt-3 text-sm">{video.caption}</h3>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-14 border-t border-border pt-10">
        <a
          href={youtube.channelUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-xl bg-red px-5 py-3 font-mono text-xs
            tracking-wide text-white transition-[transform,box-shadow] duration-200
            ease-[var(--ease-tile)] hover:-translate-y-0.5
            hover:shadow-[0_12px_24px_rgba(193,18,31,0.28)]"
        >
          <Icon name="youtube" size={16} />
          Subscribe on YouTube
          <Icon name="arrowUpRight" size={13} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </PageShell>
  );
}
