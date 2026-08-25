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
/** Detail requests in flight at once — enough to be quick, not a burst. */
const CONCURRENCY = 6;

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
function normalize(summary, detail) {
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
    alt: summary.alt_description || summary.description || "Photograph",
    ...(summary.description ? { caption: summary.description } : {}),
    ...(place ? { location: place.slug, locationName: place.name } : {}),
    width,
    height: Math.round(width * ratio),
    href: summary.links?.html,
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
    if (batch.length < PER_PAGE) break;
  }
  return summaries;
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

    const details = await mapWithLimit(summaries, CONCURRENCY, (summary) =>
      request(`/photos/${summary.id}`, { revalidate: PHOTO_REVALIDATE }).catch(() => null),
    );

    return { photos: summaries.map((s, i) => normalize(s, details[i])), error: null };
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
