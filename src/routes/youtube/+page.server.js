import { youtube } from "$data/youtube";
import { getVideoStats } from "$lib/server/youtube";

export const prerender = false;
/** Rebuild at most once an hour, so the view and like counts stay fresh. */
export const config = { isr: { expiration: 3600 } };

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
  return { id: video.id, caption: video.title, title: video.title || `Video ${position}` };
}

export async function load() {
  const featured = asVideo(youtube.featured, 1);
  const videos = youtube.videos.map((entry, i) => asVideo(entry, i + 2));
  const stats = await getVideoStats([featured, ...videos].map((v) => v.id));
  return { featured, videos, stats };
}
