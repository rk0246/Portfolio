/**
 * Photo ingest.
 *
 *   npm run photos
 *
 * Reads originals from photos-src/<location>/, writes web-sized copies to
 * public/images/photos/<location>/, and regenerates data/photos.js from what it
 * finds — dimensions and camera settings are read out of the files themselves.
 *
 * data/photos.js is BUILD OUTPUT. Hand-edits there are overwritten on the next
 * run; captions and alt text belong in photos-src/<location>/captions.json.
 *
 * Layout of a source tree:
 *
 *   photos-src/
 *     locations.json              optional — display names and chip order
 *     tokyo/
 *       captions.json             optional — per-file caption + alt text
 *       DSC_0042.jpg
 *
 * Re-running is cheap and idempotent: a photo whose output already exists and
 * is newer than its source is skipped, so adding one photo reprocesses one.
 */
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import exifr from "exifr";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "photos-src");
const OUT = path.join(ROOT, "public", "images", "photos");
const DATA = path.join(ROOT, "data", "photos.js");

/** Longest edge, in px, of the file that gets committed. next/image serves
 *  smaller variants off this, so it only needs to cover the largest slot. */
const MAX_EDGE = 2000;
const QUALITY = 80;

const EXTS = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"]);
/** sharp needs libheif for these, which the prebuilt binary lacks. */
const NEEDS_CONVERSION = new Set([".heic", ".heif", ".arw", ".cr2", ".cr3", ".nef", ".dng", ".raf"]);

/** EXIF reports model codes, not the name anyone calls the camera. */
const CAMERA_NAMES = {
  "ILCE-7M4": "Sony A7 IV",
  "ILCE-7M3": "Sony A7 III",
  "X-T5": "Fujifilm X-T5",
  "X-T4": "Fujifilm X-T4",
};

const titleize = (slug) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** 0.008 -> "1/125"; 2 -> "2s". Sub-second speeds are the common case. */
function formatShutter(seconds) {
  if (!seconds) return undefined;
  if (seconds >= 1) return `${Number(seconds.toFixed(1))}s`;
  return `1/${Math.round(1 / seconds)}`;
}

/** 1.8 -> "f/1.8", 2.0 -> "f/2" — trailing zeros read as noise on a photo. */
function formatAperture(fNumber) {
  if (!fNumber) return undefined;
  return `f/${Number(fNumber.toFixed(1))}`;
}

function formatFocal(mm) {
  if (!mm) return undefined;
  return `${Math.round(mm)}mm`;
}

function formatCamera(make, model) {
  if (!model) return undefined;
  if (CAMERA_NAMES[model]) return CAMERA_NAMES[model];
  // "SONY" + "ILCE-7M4" -> "Sony ILCE-7M4", but never "Canon Canon EOS R6".
  const brand = make ? make.trim().split(/\s+/)[0] : "";
  const pretty = brand ? brand.charAt(0) + brand.slice(1).toLowerCase() : "";
  if (pretty && !model.toLowerCase().startsWith(pretty.toLowerCase())) {
    return `${pretty} ${model}`.trim();
  }
  return model.trim();
}

async function readJsonIfPresent(file) {
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    throw new Error(`${path.relative(ROOT, file)} is not valid JSON: ${err.message}`);
  }
}

const EXIF_FIELDS = [
  "ExposureTime",
  "FNumber",
  "ISO",
  "Make",
  "Model",
  "LensModel",
  "FocalLength",
  "DateTimeOriginal",
];

/** EXIF always comes from the ORIGINAL — the published copy has none, by design. */
const readExif = (srcFile) => exifr.parse(srcFile, { pick: EXIF_FIELDS }).catch(() => null);

/** Assemble the data-file entry. Dimensions are the published file's, not the
 *  original's, and are always post-rotation. */
function buildPhoto({ slug, outName, locationName, captions, file, width, height, exif }) {
  const meta = captions[file] ?? captions[path.parse(file).name] ?? {};

  return {
    src: `/images/photos/${slug}/${outName}`,
    alt: meta.alt ?? meta.caption ?? locationName,
    ...(meta.caption ? { caption: meta.caption } : {}),
    location: slug,
    width,
    height,
    exif: {
      camera: formatCamera(exif?.Make, exif?.Model),
      lens: exif?.LensModel?.trim() || undefined,
      focal: formatFocal(exif?.FocalLength),
      aperture: formatAperture(exif?.FNumber),
      shutter: formatShutter(exif?.ExposureTime),
      iso: exif?.ISO ? String(exif.ISO) : undefined,
    },
  };
}

/** Resize, strip metadata, write. Returns the published dimensions. */
async function encode(srcFile, outFile, slug) {
  const base = path.basename(srcFile);
  const ext = path.extname(base).toLowerCase();

  // sharp's prebuilt binary can't decode HEIC or raw; say so plainly instead of
  // failing with an opaque decode error.
  if (NEEDS_CONVERSION.has(ext)) {
    throw new Error(
      `${slug}/${base}: ${ext} can't be read directly.\n` +
        `      Convert first, e.g.  sips -s format jpeg "${srcFile}" --out "${srcFile.replace(ext, ".jpg")}"`,
    );
  }

  // .rotate() with no argument bakes in the EXIF orientation flag. Without it,
  // portrait frames stay sideways AND report swapped width/height — which is
  // exactly what the masonry sizes its columns from.
  // No .withMetadata(), so everything — GPS included — is stripped on the way out.
  return sharp(srcFile)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(outFile);
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(
      `No photos-src/ directory.\n\n` +
        `  mkdir -p photos-src/tokyo\n` +
        `  cp ~/Pictures/export/*.jpg photos-src/tokyo/\n` +
        `  npm run photos\n`,
    );
    process.exitCode = 1;
    return;
  }

  const locationMeta = await readJsonIfPresent(path.join(SRC, "locations.json"));
  const entries = await readdir(SRC, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  if (slugs.length === 0) {
    console.error(`photos-src/ has no location folders yet — make one per place, e.g. photos-src/tokyo/`);
    process.exitCode = 1;
    return;
  }

  const locations = [];
  const problems = [];
  let written = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const srcDir = path.join(SRC, slug);
    const outDir = path.join(OUT, slug);
    await mkdir(outDir, { recursive: true });

    const meta = locationMeta[slug] ?? {};
    const locationName = meta.name ?? titleize(slug);
    const captions = await readJsonIfPresent(path.join(srcDir, "captions.json"));

    const files = (await readdir(srcDir))
      .filter((f) => !f.startsWith("."))
      .filter((f) => f !== "captions.json")
      .sort();

    const results = [];
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!EXTS.has(ext) && !NEEDS_CONVERSION.has(ext)) continue;

      const srcFile = path.join(srcDir, file);
      // Output name comes from the source name, not a running index, so adding
      // one photo never renumbers (and re-commits) the ones around it.
      const outName = `${slugify(path.parse(file).name)}.jpg`;
      const outFile = path.join(outDir, outName);

      try {
        const fresh =
          existsSync(outFile) && (await stat(outFile)).mtimeMs >= (await stat(srcFile)).mtimeMs;

        const { width, height } = fresh
          ? await sharp(outFile).metadata()
          : await encode(srcFile, outFile, slug);

        if (fresh) skipped++;
        else written++;

        const exif = await readExif(srcFile);
        results.push({
          photo: buildPhoto({ slug, outName, locationName, captions, file, width, height, exif }),
          takenAt: exif?.DateTimeOriginal ? new Date(exif.DateTimeOriginal).getTime() : null,
        });
      } catch (err) {
        problems.push(err.message);
      }
    }

    if (results.length === 0) continue;

    // Chronological within a location; anything without a capture date sinks to
    // the end rather than jumping to 1970.
    results.sort((a, b) => (a.takenAt ?? Infinity) - (b.takenAt ?? Infinity));

    locations.push({
      slug,
      name: locationName,
      ...(meta.region ? { region: meta.region } : {}),
      order: meta.order ?? Number.MAX_SAFE_INTEGER,
      photos: results.map((r) => r.photo),
    });
  }

  // Explicit order from locations.json first, then alphabetical for the rest.
  locations.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  // Drop output folders for locations that no longer exist in the source tree.
  if (existsSync(OUT)) {
    const live = new Set(locations.map((l) => l.slug));
    for (const dir of await readdir(OUT, { withFileTypes: true })) {
      if (dir.isDirectory() && !live.has(dir.name)) {
        await rm(path.join(OUT, dir.name), { recursive: true, force: true });
        console.log(`  removed stale ${path.relative(ROOT, path.join(OUT, dir.name))}/`);
      }
    }
  }

  await writeFile(DATA, renderDataFile(locations), "utf8");

  const total = locations.reduce((n, l) => n + l.photos.length, 0);
  console.log(
    `\n${total} photo${total === 1 ? "" : "s"} across ${locations.length} location${
      locations.length === 1 ? "" : "s"
    } — ${written} processed, ${skipped} unchanged`,
  );
  for (const loc of locations) console.log(`  ${loc.name.padEnd(20)} ${loc.photos.length}`);
  console.log(`\nwrote ${path.relative(ROOT, DATA)}`);

  if (problems.length) {
    console.error(`\n${problems.length} file${problems.length === 1 ? "" : "s"} skipped:`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  }
}

function renderDataFile(locations) {
  const stripped = locations.map(({ order, ...loc }) => ({
    ...loc,
    photos: loc.photos.map((p) => ({
      ...p,
      // Drop undefined EXIF keys so the generated file stays readable.
      exif: Object.fromEntries(Object.entries(p.exif).filter(([, v]) => v !== undefined)),
    })),
  }));

  return `/**
 * GENERATED by scripts/photos.mjs — do not edit by hand.
 *
 * Run \`npm run photos\` after adding or removing anything in photos-src/.
 * Captions and alt text live in photos-src/<location>/captions.json;
 * display names and chip order live in photos-src/locations.json.
 */
export const locations = ${JSON.stringify(stripped, null, 2)};

/** Every photo, flattened — the grid renders this and filters on \`location\`. */
export const photos = locations.flatMap((location) => location.photos);
`;
}

await main();
