/**
 * Unsplash's download-tracking endpoint, proxied.
 *
 * The API guidelines require a GET to a photo's download_location whenever a
 * visitor downloads it. That request has to carry the access key, and the key is
 * server-side only — .env.example is explicit that it is deliberately not
 * NEXT_PUBLIC_, and lib/unsplash.js is only ever imported by Server Components.
 * So the browser cannot make the call itself; it asks this route to.
 *
 * POST rather than GET because hitting it registers an event. Nothing about it
 * is safe to retry from a prefetch or a crawler.
 *
 * The photo id is the only thing taken from the request, and it is checked
 * against the API's id shape before being interpolated. Accepting a whole
 * download_location URL from the client would mean attaching our key to a URL
 * somebody else chose, which is an SSRF waiting to happen.
 *
 * The trade-off of rebuilding the URL from the id is that the `ixid` tracking
 * token on the original download_location is dropped. The endpoint is valid
 * without it and the download still registers against the photo; only
 * Unsplash's attribution of *which* listing sent the visitor is coarser.
 */

/** Unsplash ids are short nanoid-style strings. */
const PHOTO_ID = /^[A-Za-z0-9_-]{5,32}$/;

export async function POST(_request, { params }) {
  // params is a promise in this version of Next — awaiting it is not optional.
  const { id } = await params;

  if (!PHOTO_ID.test(id)) {
    return new Response(null, { status: 400 });
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.error("[unsplash] download ping skipped: UNSPLASH_ACCESS_KEY unset");
    return new Response(null, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.unsplash.com/photos/${id}/download`, {
      headers: {
        Authorization: `Client-ID ${key}`,
        "Accept-Version": "v1",
      },
      // A download event is a side effect; caching it would under-report.
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[unsplash] download ping ${id} → ${res.status}`);
      return new Response(null, { status: 502 });
    }

    // Unsplash replies with a url to fetch. The client already has one it can
    // use, so there is nothing to pass back — only that the ping landed.
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(`[unsplash] download ping ${id} failed: ${err.message}`);
    return new Response(null, { status: 502 });
  }
}
