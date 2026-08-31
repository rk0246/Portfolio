/**
 * Unsplash photo fetching for the photography page.
 *
 * ── Why this makes more than one request ──────────────────────────────────
 * GET /users/:username/photos returns *abbreviated* photo objects. Per the API
 * docs: "When retrieving a list of objects, an abbreviated or summary version
 * of that object is returned — i.e., a subset of its attributes. To get a full
 * detailed version of that object, fetch it individually."
 *
 * `exif` and `location` are among the attributes left out. So the list gives us
 * the photos, and one GET /photos/:id per photo gives us the camera settings the
 * hover overlay shows. There is no single-call way to get both.
 *
 * To keep that affordable, the two calls cache on different clocks: the list
 * revalidates hourly (new uploads should appear), while per-photo detail
 * revalidates daily, since the EXIF of an existing photo never changes. In the
 * steady state an hourly revalidation costs PAGE_COUNT requests, not one per
 * photo.
 *
 * ── Rate limits ───────────────────────────────────────────────────────────
 * Demo apps get 50 requests/hour, production apps 1000. The first full render
 * costs (photos ÷ 30) + photos requests — about 104 for 100 photos, which a
 * demo key cannot serve. See README.
 */

import { UNSPLASH_URL, UTM, withParams } from "./attribution";

const API = "https://api.unsplash.com";
const USERNAME = "ryankim246";

/** New uploads should show up within the hour. */
const LIST_REVALIDATE = 3600;
/** A published photo's EXIF never changes; only re-check it daily. */
const PHOTO_REVALIDATE = 86400;

/** 30 is the API maximum. */
const PER_PAGE = 30;
/** Bounds the request count if the account ever grows unexpectedly. */
const MAX_PAGES = 6;
/**
 * Optional ceiling on how many photos are fetched, from UNSPLASH_MAX_PHOTOS.
 *
 * Exists for Demo-tier keys. A cold render costs 1 request per photo (for its
 * EXIF) plus 1 per 30 photos (for the list), so a 50/hour Demo app cannot serve
 * a large account at all. Capping at 30 costs 31 requests and fits. Leave the
 * variable unset once the app is approved for Production.
 */
const MAX_PHOTOS = Number(process.env.UNSPLASH_MAX_PHOTOS) || Infinity;
/** Detail requests in flight at once — enough to be quick, not a burst. */
const CONCURRENCY = 6;

/**
 * Delivery sizes.
 *
 * images.unsplash.com is an Imgix endpoint, so the size we serve is ours to
 * choose — and it has to be chosen. `urls.full` is *not* a downscaled preview:
 * it is the original pixel dimensions (4501x3001 on a typical photo here) with
 * only a JPEG quality applied, around 3 MB. `urls.raw` is the same original
 * with no parameters at all. Handing either to a lightbox that renders at most
 * 70vh means downloading tens of times the pixels the viewport can show.
 *
 * 2048px covers a full-screen view on any display we care about, including 2x
 * retina at this element's size, and `auto=format` lets the CDN answer in AVIF
 * or WebP where the browser accepts it. Same photo, ~475 KB instead of ~3 MB.
 */
const LIGHTBOX_WIDTH = 2048;
/**
 * The file a visitor actually saves. Same 2048px, a little more quality than
 * the on-screen copy, and explicitly JPEG.
 *
 * fm=jpg rather than auto=format is the load-bearing part. The lightbox URL
 * uses auto=format and comes back as AVIF, which is right for display and wrong
 * for a file named .jpg — the extension would misdescribe the bytes, and plenty
 * of tools go by extension. Worth the 688 KB against the display copy's 475 KB.
 */
const DOWNLOAD_WIDTH = 2048;

/** Wide enough to blur up convincingly, small enough to inline. ~1.2 KB. */
const BLUR_WIDTH = 16;

/**
 * A tiny inlined JPEG for next/image's blur placeholder.
 *
 * It has to be a Data URL — pointing blurDataURL at a remote file would add the
 * very request the placeholder exists to paper over. Costs one CDN fetch per
 * photo when the page rebuilds, which is cheap and, unlike api.unsplash.com,
 * not subject to the hourly rate limit.
 */
async function blurDataUrl(url) {
  try {
    // cs=tinysrgb is doing the real work here. Unsplash's full-size URLs carry
    // an sRGB ICC profile, and at this size that profile is 2.6 KB of a 3.5 KB
    // file — the pixels are a rounding error next to it. Stripping it takes the
    // placeholder to ~1.2 KB, which is what makes inlining one per photo
    // reasonable. The lightbox image below keeps its profile, where colour
    // accuracy is the entire point and 2.6 KB is noise.
    const res = await fetch(
      withParams(url, { w: BLUR_WIDTH, q: 35, fm: "jpg", fit: "max", cs: "tinysrgb" }),
      {
        cache: "force-cache",
        next: { revalidate: PHOTO_REVALIDATE },
      },
    );
    if (!res.ok) return undefined;
    const bytes = Buffer.from(await res.arrayBuffer());
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  } catch {
    return undefined; // a missing placeholder is not worth failing the page over
  }
}

class UnsplashError extends Error {}

async function request(path, { params = {}, revalidate }) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new UnsplashError("UNSPLASH_ACCESS_KEY is not set");

  const url = new URL(path, API);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url, {
    headers: {
      // Public-action auth. The key stays server-side: this module is only ever
      // imported by a Server Component, and the var is not NEXT_PUBLIC_.
      Authorization: `Client-ID ${key}`,
      "Accept-Version": "v1",
    },
    // A positive revalidate opts the request into Next's persistent cache, which
    // is otherwise off by default for requests carrying an Authorization header.
    cache: "force-cache",
    next: { revalidate },
  });

  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new UnsplashError(
      `${path} → ${res.status} ${res.statusText}` +
        (remaining !== null ? ` (rate limit remaining: ${remaining})` : ""),
    );
  }

  return res.json();
}

/* ── Formatting ────────────────────────────────────────────────────────────
   Unsplash normalises EXIF inconsistently between photos: exposure_time comes
   back as "1/125" for some and "0.011111111111111112" for others, and aperture
   as a bare decimal ("4.970854") rather than an f-number. Both shapes have to
   survive the trip to the overlay looking like something a photographer wrote. */

function formatShutter(value) {
  if (value == null) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (raw.includes("/")) return raw; // already "1/125"
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined;
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
  return `1/${Math.round(1 / seconds)}`;
}

function formatAperture(value) {
  if (value == null) return undefined;
  const raw = String(value).trim().replace(/^f\/?/i, "");
  const f = Number(raw);
  if (!Number.isFinite(f) || f <= 0) return undefined;
  return `f/${Number(f.toFixed(1))}`;
}

function formatIso(value) {
  if (value == null || value === "") return undefined;
  const iso = Number(value);
  return Number.isFinite(iso) && iso > 0 ? String(Math.round(iso)) : undefined;
}

function formatFocal(value) {
  if (value == null || value === "") return undefined;
  const mm = Number(String(value).replace(/mm$/i, "").trim());
  return Number.isFinite(mm) && mm > 0 ? `${Math.round(mm)}mm` : undefined;
}

/** exif.name is usually "Canon, EOS 5D Mark IV"; make/model are the fallback. */
function formatCamera(exif) {
  const name = exif?.name?.trim();
  if (name) return name.replace(/,\s*/g, " ");
  const parts = [exif?.make?.trim(), exif?.model?.trim()].filter(Boolean);
  if (parts.length === 2 && parts[1].toLowerCase().startsWith(parts[0].toLowerCase())) {
    return parts[1];
  }
  return parts.join(" ") || undefined;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Prefer the most specific place the photographer tagged. */
function formatLocation(location) {
  const name = location?.city || location?.name || location?.country;
  if (!name) return null;
  const label = location?.city && location?.country ? `${location.city}, ${location.country}` : name;
  return { slug: slugify(label), name: label };
}

/**
 * Fold an API photo into the shape PhotoFrame already renders, so the component
 * stays unaware of where its data came from.
 */
function normalize(summary, detail, blur) {
  const exif = detail?.exif;
  const place = formatLocation(detail?.location);

  // urls.regular is 1080px wide. Report that as the intrinsic width rather than
  // the original's, so next/image never asks the optimizer to upscale it — the
  // aspect ratio, which is what the masonry needs, is unchanged.
  const ratio = summary.height / summary.width;
  const width = Math.min(summary.width, 1080);

  return {
    id: summary.id,
    src: summary.urls.regular,
    // The lightbox needs more pixels than the 1080px grid source, but nothing
    // like the original. Still hotlinked from the CDN, as the API requires.
    full: withParams(summary.urls.full ?? summary.urls.raw, {
      w: LIGHTBOX_WIDTH,
      q: 80,
      fit: "max",
      auto: "format",
    }),
    download: withParams(summary.urls.full ?? summary.urls.raw, {
      w: DOWNLOAD_WIDTH,
      q: 85,
      fit: "max",
      fm: "jpg",
    }),
    // What that URL actually delivers: fit=max never upscales, so a photo
    // narrower than the cap keeps its own width.
    fullWidth: Math.min(summary.width, LIGHTBOX_WIDTH),
    fullHeight: Math.round(Math.min(summary.width, LIGHTBOX_WIDTH) * ratio),
    ...(blur ? { blurDataURL: blur } : {}),
    alt: summary.alt_description || summary.description || "Photograph",
    ...(summary.description ? { caption: summary.description } : {}),
    ...(place ? { location: place.slug, locationName: place.name } : {}),
    width,
    height: Math.round(width * ratio),
    href: summary.links?.html,
    // Required on every display of the photo, so it travels with the photo
    // rather than being looked up at render time.
    credit: {
      name: summary.user?.name || summary.user?.username || "Unknown",
      profileUrl: summary.user?.links?.html
        ? withParams(summary.user.links.html, UTM)
        : UNSPLASH_URL,
    },
    exif: {
      camera: formatCamera(exif),
      focal: formatFocal(exif?.focal_length),
      aperture: formatAperture(exif?.aperture),
      shutter: formatShutter(exif?.exposure_time),
      iso: formatIso(exif?.iso),
    },
  };
}

/** Run `fn` over `items`, at most `limit` at a time. */
async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

async function listUserPhotos() {
  const summaries = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await request(`/users/${USERNAME}/photos`, {
      params: { page, per_page: PER_PAGE, order_by: "latest" },
      revalidate: LIST_REVALIDATE,
    });
    if (!Array.isArray(batch) || batch.length === 0) break;
    summaries.push(...batch);
    if (summaries.length >= MAX_PHOTOS || batch.length < PER_PAGE) break;
  }
  return summaries.slice(0, MAX_PHOTOS === Infinity ? undefined : MAX_PHOTOS);
}

/**
 * Every photo on the account, newest first, in PhotoFrame's shape.
 *
 * Never throws: a failure returns an empty list with an `error` string for the
 * page to show, because a portfolio that 500s is worse than one that says it
 * could not reach Unsplash. Individual detail failures are absorbed too — that
 * photo simply renders without its overlay.
 */
export async function getPhotos() {
  try {
    const summaries = await listUserPhotos();

    // Both passes are per-photo and independent, so they overlap rather than
    // run back to back. Only the detail calls touch the rate-limited API.
    const [details, blurs] = await Promise.all([
      mapWithLimit(summaries, CONCURRENCY, (summary) =>
        request(`/photos/${summary.id}`, { revalidate: PHOTO_REVALIDATE }).catch(() => null),
      ),
      mapWithLimit(summaries, CONCURRENCY, (summary) =>
        blurDataUrl(summary.urls.full ?? summary.urls.raw),
      ),
    ]);

    return {
      photos: summaries.map((s, i) => normalize(s, details[i], blurs[i])),
      error: null,
    };
  } catch (err) {
    console.error(`[unsplash] ${err.message}`);
    const missingKey = err instanceof UnsplashError && err.message.includes("UNSPLASH_ACCESS_KEY");
    return {
      photos: [],
      error: missingKey
        ? "UNSPLASH_ACCESS_KEY is not set — add it to .env.local."
        : "Could not reach Unsplash.",
    };
  }
}
