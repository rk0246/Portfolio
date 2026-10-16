/**
 * /about "Outside of work" bento grid — one object per tile.
 *
 * Array order is display order, and it is chosen so the tiles pack into whole
 * rows: on desktop (12 columns) sm = 4, md = 6, lg = 8, so each row here is
 * lg + sm, md + md or sm + lg. On tablets (2 columns) lg tiles span both
 * columns and sm/md take one. Change a size or the order and check the grid
 * still closes up.
 *
 * Optional fields:
 *   now    a mono "currently" line under the text
 *   chips  small outlined pills
 *   image  fills the tile behind the text (put the file in public/about/;
 *          width/height are its real pixel size)
 *   href   makes the whole tile a link
 *
 * Titles: a trailing period is fine either way — the page strips it.
 *
 * @typedef {{
 *   id: string,
 *   title: string,
 *   line: string,
 *   now?: string,
 *   chips?: string[],
 *   image?: { src: string, alt: string, width: number, height: number },
 *   href?: string,
 *   size: "sm" | "md" | "lg",
 * }} Interest
 */

/** @type {Interest[]} */
export const interests = [
  {
    id: "audiophile",
    title: "Audiophile",
    line: "Two-channel systems and critical listening.",
    now: "Sennheiser HDB 630",
    size: "lg",
  },
  {
    id: "cardistry",
    title: "Cardistry",
    line: "Flourishing and sleight-of-hand, for the craft of it.",
    size: "sm",
  },
  {
    id: "sports",
    title: "Sports",
    line: "Playing, mostly badly, always happily.",
    chips: ["CMU Club Baseball", "Intramural Soccer", "Golf"],
    size: "md",
  },
  {
    id: "gaming",
    title: "Gaming",
    line: "A mix of genres in rotation.",
    chips: ["Marvel Rivals", "Subnautica", "StarCraft II"],
    size: "md",
  },
  {
    id: "tech",
    title: "Tech",
    line: "Building and upgrading PCs, and keeping up with the latest hardware.",
    now: "Current build: [add specs]",
    size: "sm",
  },
  {
    id: "photography",
    title: "Photography + Filmmaking",
    line: "Shooting and editing, from personal projects to what's featured on this site.",
    href: "/photography",
    size: "lg",
  },
];
