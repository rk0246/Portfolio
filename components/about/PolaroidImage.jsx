import Image from "next/image";

/**
 * A photo styled as a printed snapshot: paper border (thicker at the bottom,
 * where the caption goes), a strip of tape, a slight tilt that straightens on
 * hover. The print colours are fixed paper tones, not theme tokens — a print
 * is white in any room; dark mode only warms it a little (see .polaroid in
 * globals.css).
 *
 * `tilt` is passed in, derived from the photo's position on the page, so it is
 * identical on the server and the client.
 */
export default function PolaroidImage({ image, tilt, sizes }) {
  return (
    <figure className="polaroid" style={{ "--tilt": `${tilt}deg` }}>
      <span aria-hidden="true" className="polaroid-tape" />
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        loading="lazy"
        className="block h-auto w-full"
      />
      {image.caption && (
        <figcaption className="polaroid-caption">{image.caption}</figcaption>
      )}
    </figure>
  );
}
