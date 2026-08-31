/**
 * Site-wide identity, read by the home page, /contact, and the layout metadata.
 *
 * `role` is interpolated into the default page title, so it shows up in every
 * browser tab and search result, not just the home page eyebrow.
 *
 * ⚠️ `tagline` is the one field still carrying scaffolding copy, and it is this
 * site's meta description — the sentence search engines print under the title.
 */
export const site = {
  name: "Ryan Kim",
  role: "Business & AI, CMU",
  tagline:
    "I build software, shoot photos, and take apart anything with a circuit board in it.",
  location: "Pittsburgh, PA",
  email: "rkim0246@gmail.com",
  resumePdf: "/resume.pdf",
  /* Array order is display order: /contact renders the "Elsewhere" list in
     exactly this sequence. (/resume looks LinkedIn up by label, so it is
     unaffected by reordering.)

     `href` is where the link goes, `handle` is the text shown on the right of
     each row — they are separate on purpose, so the row can read "@ryankimyt"
     while pointing at a full URL.

     All four point at real accounts. */
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ryan-kim-59323b26b/",
      handle: "/in/ryan-kim-59323b26b",
    },
    {
      label: "GitHub",
      href: "https://github.com/rk0246",
      handle: "@rk0246",
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@ryankimyt",
      handle: "@ryankimyt",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/ryankim.yt/",
      handle: "@ryankim.yt",
    },
  ],
};

/* /about copy lives in data/about.js — it's a page's worth of text and gets
   edited on its own schedule. */
