import Image from "next/image";

/**
 * One photo in the masonry.
 *
 * Deliberately unframed — no border, no shadow. The gap between photos is the
 * only thing organising the grid, and a frame around each image would compete
 * with it. Nothing here assumes a shared aspect ratio either: width/height come
 * straight from data/photos.js so the image keeps its true proportions and the
 * column heights stagger on their own.
 *
 * Exposure settings ride in an overlay that fades in over the bottom of the
 * image on hover. Each field drops out individually when a photo's data lacks
 * it, and the overlay is skipped entirely when none of the three are present.
 */
export default function PhotoFrame({ photo, priority = false }) {
  const exif = photo.exif ?? {};

  // Built by filtering rather than interpolating, so a missing field costs a
  // separator instead of printing "undefined".
  const settings = [exif.shutter, exif.aperture, exif.iso && `ISO ${exif.iso}`].filter(Boolean);
  const gear = [exif.camera, exif.lens, exif.focal].filter(Boolean);

  return (
    <figure className="group mb-4 break-inside-avoid">
      <div className="relative overflow-hidden rounded-xl bg-fill">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="h-auto w-full"
        />

        {settings.length > 0 && (
          /* Left in the accessibility tree (opacity, not hidden) so the numbers
             are still reachable without a pointer, and pinned open where hover
             does not exist at all. */
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-x-3
              bg-gradient-to-t from-black/70 via-black/35 to-transparent px-3 pb-2.5 pt-10
              font-mono text-[11px] text-white opacity-0 transition-opacity duration-250
              ease-[var(--ease-tile)] group-hover:opacity-100
              [@media(hover:none)]:opacity-100"
          >
            {settings.map((setting) => (
              <span key={setting}>{setting}</span>
            ))}
          </div>
        )}
      </div>

      {(photo.caption || gear.length > 0) && (
        <figcaption className="px-0.5 pt-2.5">
          {photo.caption && <p className="text-sm">{photo.caption}</p>}
          {gear.length > 0 && (
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              {gear.join(" · ")}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
