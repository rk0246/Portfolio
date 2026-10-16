import InterestTile from "./InterestTile";

/**
 * /about "Outside of work" as a bento grid. A server component; each tile
 * (InterestTile.jsx) is a small client component for its entrance and its
 * decoration.
 *
 * 1 column on phones, 2 from 640px, 12 from 1024px — see data/interests.js
 * for how sizes map to spans.
 */
export default function InterestsGrid({ label, items }) {
  return (
    <section
      aria-labelledby="interests-heading"
      className="mt-6 border-t border-border pt-6 sm:mt-7 sm:pt-8"
    >
      <h2
        id="interests-heading"
        className="type-eyebrow"
      >
        {label}
      </h2>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {items.map((item, i) => (
          <InterestTile key={item.id} item={item} index={i} />
        ))}
      </ul>
    </section>
  );
}
