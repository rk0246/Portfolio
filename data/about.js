/**
 * /about — every word on the page lives here.
 *
 * `app/about/page.js` only lays these values out; it hardcodes no copy. Edit
 * the bio, add or remove a hobby, rename a label — the page follows without
 * any change to the component.
 *
 * On periods: the page treats the trailing period of `heading` and of each
 * hobby `title` as an accent mark and renders it in the site's accent colour.
 * Write them with or without the period — the page normalizes either way.
 */
export const about = {
  eyebrow: "ABOUT",
  heading: "Ryan Kim",
  bio: "I'm from Los Angeles, and I'm currently a junior at Carnegie Mellon University's Tepper School of Business, studying Business Administration with a concentration in AI and a minor in Information Systems. Lately, I've been drawn toward entrepreneurship and sports and entertainment management, with a particular interest in building things and understanding how to get people together in real life using digital means.",
  /* Path is relative to /public. Swap the file or change this string to
     change the headshot; `portraitAlt` is what screen readers announce.
     The dimensions must match the file's real pixel size — the page renders
     at a fixed width and derives the height from this ratio, so a wrong pair
     here shows up as a stretched photo. */
  portrait: "/images/portrait.png",
  portraitAlt: "Ryan Kim",
  portraitWidth: 1086,
  portraitHeight: 1448,
  outsideOfWorkLabel: "OUTSIDE OF WORK",
  hobbies: [
    {
      title: "Audiophile",
      description:
        "Two-channel systems and critical listening — home audio setups, headphone comparisons, and researching gear more than any budget really justifies.",
    },
    {
      title: "Sports",
      description:
        "Soccer, playing center midfield on weekends, and a lifelong following of the Los Angeles Dodgers.",
    },
    {
      title: "Gaming",
      description:
        "A mix of genres in rotation — Marvel Rivals, Subnautica, and StarCraft II.",
    },
    {
      title: "Cardistry",
      description:
        "Card flourishing and sleight-of-hand, practiced more for the craft of it than performance.",
    },
    {
      title: "Photography + Filmmaking",
      description:
        "Shooting and editing photo and video work, from personal projects to what's featured elsewhere on this site.",
    },
    {
      title: "Tech",
      description:
        "Building and upgrading PCs, and keeping up with the latest hardware and component releases.",
    },
  ],
};
