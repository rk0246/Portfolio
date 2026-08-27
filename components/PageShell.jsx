/**
 * Shared chrome for every non-home page: mono kicker, display heading, lede.
 * Keeps the six section pages visually of a piece without each one
 * re-deciding its own spacing.
 *
 * `lede` takes a string for a single paragraph, or an array of strings to get
 * one <p> per entry. Normalising the two shapes here is what lets the pages
 * that only ever needed one paragraph keep passing a bare string.
 */
export default function PageShell({
  kicker,
  title,
  lede,
  children,
  wide = false,
  tight = false,
}) {
  const ledeParagraphs = (Array.isArray(lede) ? lede : [lede]).filter(Boolean);

  return (
    <div
      className={`mx-auto w-full px-5 pt-14 pb-28 sm:px-8 sm:pt-20 sm:pb-32 ${
        wide ? "max-w-6xl" : "max-w-3xl"
      }`}
    >
      <header className="border-b border-border pb-8 sm:pb-10">
        {kicker && (
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            {kicker}
          </p>
        )}
        <h1 className="mt-3 font-display text-[clamp(2.25rem,7vw,4rem)] leading-[0.95] font-bold tracking-[-0.03em]">
          {title}
          <span className="text-red">.</span>
        </h1>
        {ledeParagraphs.length > 0 && (
          <div className="mt-4 max-w-2xl space-y-4 text-base text-muted sm:text-lg">
            {ledeParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </header>

      {/* `tight` pulls the body up under the header rule. Opt-in so the pages
          that want the roomier default keep it untouched. */}
      <div className={tight ? "pt-6 sm:pt-8" : "pt-10 sm:pt-12"}>
        {children}
      </div>
    </div>
  );
}
