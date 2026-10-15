import HighlightItem from "./HighlightItem";

/**
 * The /about Highlights timeline. A server component; only the entry reveal
 * (HighlightsMotion.jsx) runs on the client.
 *
 * Layout: below md, one column with the hairline at the far left and
 * everything indented past it. From md up, a 140px "when" column, then the
 * line (at 160px, in the middle of the 40px gap), then the content.
 */
export default function Highlights({ label, items }) {
  // Running photo count before each entry, so every photo gets its own tilt.
  const photoStarts = items.reduce(
    (acc, item, i) => [...acc, acc[i] + (item.images?.length ?? 0) + (item.videos?.length ?? 0)],
    [0],
  );

  return (
    <section
      aria-labelledby="highlights-heading"
      className="mt-6 border-t border-border pt-6 sm:mt-7 sm:pt-8"
    >
      <h2
        id="highlights-heading"
        className="font-mono text-xs tracking-[0.2em] text-muted uppercase"
      >
        {label}
      </h2>

      <div className="relative mt-8">
        {/* The hairline: one static rule down the whole list. (It used to draw
            in with scroll, but a half-drawn line read as broken.) */}
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-0 left-[4px] w-px bg-border md:left-[160px]"
        />
        <ol className="space-y-12 sm:space-y-14">
          {items.map((item, i) => (
            <HighlightItem
              key={i}
              item={item}
              index={i}
              photoStart={photoStarts[i]}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
