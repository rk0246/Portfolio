"use client";

import { useMemo, useState } from "react";
import PhotoFrame from "./PhotoFrame";
import Lightbox from "./Lightbox";

const ALL = "all";

/**
 * The photo grid and its location filter.
 *
 * One masonry holding every photo, narrowed in place by the chips above it.
 * Filtering is client state rather than a route, so switching locations is
 * instant and never refetches an image the browser already has.
 *
 * Locations come from whatever each photo was tagged with on Unsplash, so a
 * chip only appears for a place that actually has photos. Untagged photos are
 * reachable under "All".
 */
export default function PhotoGrid({ photos }) {
  const [active, setActive] = useState(ALL);
  // Index into `shown`, so arrow keys walk the filtered set, not the whole one.
  const [openIndex, setOpenIndex] = useState(null);

  const locations = useMemo(() => {
    const byslug = new Map();
    for (const photo of photos) {
      if (!photo.location) continue;
      const entry = byslug.get(photo.location);
      if (entry) entry.count++;
      else byslug.set(photo.location, { slug: photo.location, name: photo.locationName, count: 1 });
    }
    return [...byslug.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [photos]);

  const shown = active === ALL ? photos : photos.filter((p) => p.location === active);
  const activeName = locations.find((l) => l.slug === active)?.name;

  if (photos.length === 0) {
    return <p className="font-mono text-sm text-muted">No photos yet.</p>;
  }

  return (
    <>
      {locations.length > 1 && (
        <div role="group" aria-label="Filter photos by location" className="mb-7 flex flex-wrap gap-2">
          <Chip
            label="All"
            count={photos.length}
            selected={active === ALL}
            onSelect={() => {
              setOpenIndex(null);
              setActive(ALL);
            }}
          />
          {locations.map((location) => (
            <Chip
              key={location.slug}
              label={location.name}
              count={location.count}
              selected={active === location.slug}
              onSelect={() => {
                setOpenIndex(null);
                setActive(location.slug);
              }}
            />
          ))}
        </div>
      )}

      {/* CSS columns rather than grid: the set mixes portrait and landscape, and
          masonry keeps every photo at its true aspect ratio without cropping.
          The gap is the only structure here — each photo carries a matching mb-4
          so vertical and horizontal spacing read as one rhythm. */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
        {shown.map((photo, i) => (
          <PhotoFrame
            key={photo.id ?? photo.src}
            photo={photo}
            priority={i < 2}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </div>

      <Lightbox photos={shown} index={openIndex} onClose={() => setOpenIndex(null)} onIndex={setOpenIndex} />

      {/* Filtering rearranges the page silently for a screen reader otherwise. */}
      <p aria-live="polite" className="sr-only">
        Showing {shown.length} {shown.length === 1 ? "photo" : "photos"}
        {activeName ? ` from ${activeName}` : " from all locations"}
      </p>
    </>
  );
}

function Chip({ label, count, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors duration-150
        ${
          selected
            ? "border-red bg-red text-white"
            : "border-border text-muted hover:border-red hover:text-red"
        }`}
    >
      {label}
      <span className={`ml-1.5 tabular-nums ${selected ? "text-white/70" : "text-muted/60"}`}>
        {count}
      </span>
    </button>
  );
}
