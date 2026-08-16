import Image from "next/image";

/**
 * One photo plus its caption and EXIF line.
 *
 * Sits in a CSS-columns masonry, so it must not assume a shared aspect ratio —
 * width/height come from data/photos.js and the image scales to the column.
 */
export default function PhotoFrame({ photo, priority = false }) {
  const exif = photo.exif;

  return (
    <figure className="group mb-4 break-inside-avoid sm:mb-5">
      <div
        className="overflow-hidden rounded-xl border border-border bg-fill
          transition-[border-color,box-shadow,transform] duration-250 ease-[var(--ease-tile)]
          group-hover:-translate-y-1 group-hover:border-red
          group-hover:shadow-[0_16px_32px_rgba(229,52,43,0.18)]"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-auto w-full"
        />
      </div>

      <figcaption className="px-0.5 pt-2.5">
        {photo.caption && <p className="text-sm">{photo.caption}</p>}
        {exif && (
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
            {[exif.camera, exif.lens].filter(Boolean).join(" · ")}
            <br />
            {[exif.focal, exif.aperture, exif.shutter, exif.iso && `ISO ${exif.iso}`]
              .filter(Boolean)
              .join("  ")}
          </p>
        )}
      </figcaption>
    </figure>
  );
}
