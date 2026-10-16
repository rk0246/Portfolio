import PageShell from "@/components/PageShell";
import VideoEmbed from "@/components/VideoEmbed";
import Icon from "@/components/Icon";
import { youtube } from "@/data/youtube";
import { formatCount, getVideoStats } from "@/lib/youtube";

/** Rebuild at most once an hour, so the view and like counts stay fresh. */
export const revalidate = 3600;

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

/** Views and likes, when the API returned them. Renders nothing otherwise. */
function Stats({ stats, className = "mt-3" }) {
  if (!stats || (stats.views == null && stats.likes == null)) return null;
  return (
    <p className={`flex items-center gap-4 type-data ${className}`}>
      {stats.views != null && (
        <span className="inline-flex items-center gap-1.5">
          <Icon name="eye" size={15} />
          {formatCount(stats.views)}
          <span className="sr-only">views</span>
        </span>
      )}
      {stats.likes != null && (
        <span className="inline-flex items-center gap-1.5">
          <Icon name="heart" size={14} />
          {formatCount(stats.likes)}
          <span className="sr-only">likes</span>
        </span>
      )}
    </p>
  );
}

export default async function YouTubePage() {
  const featured = asVideo(youtube.featured, 1);
  const videos = youtube.videos.map((entry, i) => asVideo(entry, i + 2));
  const stats = await getVideoStats([featured, ...videos].map((v) => v.id));

  return (
    <PageShell
      wide
      kicker="YouTube"
      title="Video"
      lede="Shot-for-shot recreations of scenes from shows and movies on a $3.01 budget. Plus the occasional original short film whenever I feel inspired!"
    >
      <section>
        <h2 className="type-eyebrow">Featured</h2>
        <article className="video-card group mt-5">
          <VideoEmbed id={featured.id} title={featured.title} priority />
          <div className="p-5 sm:p-6">
            {featured.caption && <h3 className="type-title">{featured.caption}</h3>}
            <Stats stats={stats.get(featured.id)} />
          </div>
        </article>
      </section>

      {videos.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="type-eyebrow">More</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, i) => (
              /* Index in the key as well as the id: the same video can
                 legitimately appear twice, and duplicate keys break React. */
              <li key={`${video.id}-${i}`} className="video-card group flex flex-col">
                <VideoEmbed id={video.id} title={video.title} />
                <div className="flex flex-1 flex-col p-4">
                  {/* Underline only (no transition), so there's nothing to
                      reduce for prefers-reduced-motion. */}
                  {video.caption && (
                    <h3
                      className="text-[15px] font-medium leading-[1.4] tracking-[-0.01em]
                        text-pretty text-text underline-offset-[3px] md:text-base
                        group-focus-within:underline group-hover:underline"
                    >
                      {video.caption}
                    </h3>
                  )}
                  <Stats stats={stats.get(video.id)} className="mt-auto pt-3" />
                </div>
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
          className="inline-flex items-center gap-2 rounded-xl bg-red px-5 py-3 type-ui text-white transition-[transform,box-shadow] duration-200
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
