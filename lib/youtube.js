/**
 * View and like counts for the YouTube page, from the YouTube Data API v3.
 *
 * Needs YOUTUBE_API_KEY (server-side only, never NEXT_PUBLIC_). Without it, or
 * if the request fails, this returns an empty map and the cards simply show no
 * stats — the page never breaks over numbers.
 *
 * One request covers up to 50 videos (`videos?part=statistics&id=a,b,c`) and
 * costs 1 unit of the 10,000/day free quota. Cached for an hour.
 */
const API = "https://www.googleapis.com/youtube/v3/videos";
const REVALIDATE = 3600;

/** @returns {Promise<Map<string, { views?: number, likes?: number }>>} */
export async function getVideoStats(ids) {
  const key = process.env.YOUTUBE_API_KEY;
  const stats = new Map();
  if (!key || ids.length === 0) return stats;

  for (let i = 0; i < ids.length; i += 50) {
    const url = `${API}?part=statistics&id=${ids.slice(i, i + 50).join(",")}&key=${key}`;
    try {
      const res = await fetch(url, { next: { revalidate: REVALIDATE } });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data.items ?? []) {
        const s = item.statistics ?? {};
        stats.set(item.id, {
          // Likes can be hidden by the channel; then the field is absent.
          views: s.viewCount != null ? Number(s.viewCount) : undefined,
          likes: s.likeCount != null ? Number(s.likeCount) : undefined,
        });
      }
    } catch {
      // Network or quota trouble: show the cards without numbers.
    }
  }
  return stats;
}

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1234 -> "1.2K", 3400000 -> "3.4M". */
export const formatCount = (n) => compact.format(n);
