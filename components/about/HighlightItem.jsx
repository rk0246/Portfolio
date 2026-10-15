import Link from "next/link";
import PolaroidImage from "./PolaroidImage";
import PolaroidVideo from "./PolaroidVideo";
import { Reveal } from "./HighlightsMotion";

/** Titles render without a trailing period, whatever the data carries. */
const stem = (text) => text.replace(/\.+\s*$/, "");

/**
 * Deterministic tilt in [-3, 3] degrees from a running photo number — never
 * Math.random(), which would differ between server and client render.
 */
const tiltFor = (n) => Math.round((((n * 37 + 11) % 61) / 10 - 3) * 10) / 10;

/** One entry. `photoStart` is how many photos came before it on the page, so
    every photo gets its own tilt. */
export default function HighlightItem({ item, index, photoStart }) {
  // Photos first, then clips; both are "prints" for layout and tilt.
  const media = [
    ...(item.images ?? []).map((m) => ({ ...m, kind: "image" })),
    ...(item.videos ?? []).map((m) => ({ ...m, kind: "video" })),
  ];
  const single = media.length === 1;

  const print = (m, i, sizes) =>
    m.kind === "video" ? (
      <PolaroidVideo key={m.src} video={m} tilt={tiltFor(photoStart + i)} />
    ) : (
      <PolaroidImage
        key={m.src + i}
        image={m}
        tilt={tiltFor(photoStart + i)}
        sizes={sizes}
      />
    );

  const text = (
    <div className="min-w-0">
      <h3 className="font-display text-lg font-bold tracking-tight">
        {stem(item.title)}
      </h3>
      <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-muted">
        {item.body}
      </p>

      {item.tags?.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tags">
          {item.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {item.link && (
        <Link
          href={item.link.href}
          className="mt-3 inline-block text-sm font-medium transition-colors hover:text-red"
        >
          {item.link.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );

  return (
    <Reveal
      index={index}
      className="relative pl-8 md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-x-10 md:pl-0"
    >
      {/* Marker on the line: a sharp 10px square in the accent colour. */}
      <span
        aria-hidden="true"
        className="absolute top-[3px] left-0 h-2.5 w-2.5 bg-red md:top-[5px] md:left-[155px]"
      />

      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase md:pt-1">
        {item.when}
      </p>

      <div className="mt-2 md:mt-0">
        {single ? (
          // One photo: beside the text on wide screens, under it below that.
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
            {text}
            <div className="max-w-sm lg:max-w-none">
              {print(
                media[0],
                0,
                "(min-width: 1024px) 15rem, (min-width: 768px) 24rem, 90vw",
              )}
            </div>
          </div>
        ) : (
          <>
            {text}
            {media.length > 1 && (
              // Two to four: a row underneath; stacked full width on phones.
              <div
                className={`mt-7 grid items-start gap-7 ${
                  media.length > 3
                    ? "md:max-w-4xl md:grid-cols-4"
                    : "md:max-w-3xl md:grid-cols-3"
                }`}
              >
                {media.map((m, i) => print(m, i, "(min-width: 768px) 15rem, 90vw"))}
              </div>
            )}
          </>
        )}
      </div>
    </Reveal>
  );
}
