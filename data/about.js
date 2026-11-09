/**
 * /about — every word on the page lives here.
 *
 * `app/about/page.js` only lays these values out; it hardcodes no copy. Edit
 * the bio or rename a label — the page follows without
 * any change to the component.
 *
 * On periods: headings render without a trailing period;
 * write them with or without one — the page strips it.
 */
export const about = {
  eyebrow: "ABOUT",
  heading: "Ryan Kim",
  /* One string per paragraph. */
  bio: [
    "I'm a business student at Carnegie Mellon from Los Angeles, studying AI and Information Systems, drawn to the space where product, data, and storytelling meet. Whether I'm leading a product team, running a marketing campaign, or growing my YouTube channel, I care about building things people actually use and enjoy!",
    "Outside of work, I play golf, soccer, and baseball, and I'm into photography and cardistry. Feel free to look at my highlights below!",
  ],
  /* Path is relative to /public. Swap the file or change this string to
     change the headshot; `portraitAlt` is what screen readers announce.
     The dimensions must match the file's real pixel size — the page renders
     at a fixed width and derives the height from this ratio, so a wrong pair
     here shows up as a stretched photo. */
  portrait: "/images/portrait.webp",
  portraitAlt: "Ryan Kim",
  portraitWidth: 520,
  portraitHeight: 693,
  /* Entries for the Highlights timeline live in data/highlights.js. */
  highlightsLabel: "HIGHLIGHTS",
  /* The tiles under it live in data/interests.js. */
  outsideOfWorkLabel: "OUTSIDE OF WORK",
};
