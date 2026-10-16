/**
 * Site-wide identity, read by the home page, /contact, and the layout metadata.
 *
 * `role` is interpolated into the default page title, so it shows up in every
 * browser tab and search result.
 *
 * There is deliberately no meta description anywhere on the site, so link
 * previews (Discord, iMessage, Slack, LinkedIn) show just the title.
 */
export const site = {
  name: "Ryan Kim",
  role: "Business & AI, CMU",
  location: "Pittsburgh, PA",
  email: "rkim0246@gmail.com",
  resumePdf: "/resume.pdf",
  /* Array order is display order: /contact renders the "Elsewhere" list in
     exactly this sequence. (/resume looks LinkedIn up by label, so it is
     unaffected by reordering.)

     `icon` is a key into components/BrandIcon.jsx. `href` is where the link
     goes, `handle` is the text shown on the right of
     each row — they are separate on purpose, so the row can read "@ryankimyt"
     while pointing at a full URL.

     The first four point at real accounts; the last is a joke (it's a
     rickroll). */
  socials: [
    {
      label: "LinkedIn",
      icon: "linkedin",
      href: "https://www.linkedin.com/in/ryan-kim-59323b26b/",
      handle: "/in/ryan-kim-59323b26b",
    },
    {
      label: "GitHub",
      icon: "github",
      href: "https://github.com/rk0246",
      handle: "@rk0246",
    },
    {
      label: "YouTube",
      icon: "youtube",
      href: "https://youtube.com/@ryankimyt",
      handle: "@ryankimyt",
    },
    {
      label: "Instagram",
      icon: "instagram",
      href: "https://www.instagram.com/ryankim.yt/",
      handle: "@ryankim.yt",
    },
    {
      label: "OnlyFans",
      icon: "onlyfans",
      href: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      handle: "@ryankim",
    },
  ],
};

/* /about copy lives in data/about.js — it's a page's worth of text and gets
   edited on its own schedule. */
