/**
 * /about "Highlights" timeline — every entry lives here, newest first.
 *
 * To add one, copy an object below and put it where it belongs in the order
 * (the page renders this array top to bottom; it does not sort).
 *
 * Photos: drop the file in public/about/ with a lowercase filename (e.g.
 * public/about/hackathon-2025.jpg), then reference it as
 * "/about/hackathon-2025.jpg". `width` and `height` must be the file's real
 * pixel size — they set the aspect ratio. `alt` is what screen readers
 * announce, so describe the photo. Up to 4 photos per entry; one sits beside
 * the text on wide screens, two to four line up underneath it.
 *
 * Videos: same folder, same naming, e.g. public/about/trip.mp4 plus a poster
 * frame public/about/trip-poster.jpg (shown until it's played). Prefer .mp4
 * (H.264 + AAC); `alt` describes the clip. `width`/`height` are the video's
 * real size. Videos and photos share the 4-per-entry limit and the same
 * print styling; they render after the photos.
 *
 * Titles: a trailing period is fine either way — the page strips it.
 *
 * @typedef {{ src: string, alt: string, width: number, height: number, caption?: string }} HighlightImage
 * @typedef {{ src: string, poster: string, alt: string, width: number, height: number, caption?: string }} HighlightVideo
 * @typedef {{
 *   when: string,
 *   title: string,
 *   body: string,
 *   tags?: string[],
 *   images?: HighlightImage[],
 *   videos?: HighlightVideo[],
 *   link?: { label: string, href: string },
 * }} Highlight
 */

/** @type {Highlight[]} */
export const highlights = [
  {
    when: "2026",
    title: "Yellowstone + Grand Teton",
    body: "A photographer's paradise!",
    images: [
      {
        src: "/about/yellowstone-2026-eagle.jpg",
        alt: "A bald eagle perched on a pine treetop, shown on the flip-out screen of a camera",
        width: 1500,
        height: 2000,
      },
      {
        src: "/about/yellowstone-2026-lake.jpg",
        alt: "A tripod on a pebble beach by a lake, with snow-capped mountains across the water and a bag of kettle corn in the foreground",
        width: 1500,
        height: 2000,
      },
      {
        src: "/about/yellowstone-2026-sunset.jpg",
        alt: "A camera on a tripod framing an old wooden barn and jagged snowy peaks under an orange sunset",
        width: 1500,
        height: 2000,
      },
      {
        src: "/about/yellowstone-2026-spring.jpg",
        alt: "A steaming hot spring with a turquoise centre and rust-orange edges, pine forest behind",
        width: 1500,
        height: 2000,
      },
    ],
  },
  {
    when: "2026",
    title: "CMU Club Baseball",
    body: "The goal is to hit a 400 feet bomb to center field on the first pitch of the game",
    images: [
      {
        src: "/about/baseball-2026-dugout.jpg",
        alt: "Two teammates in red-pinstriped Carnegie Mellon baseball jerseys smiling in a wooden dugout",
        width: 2000,
        height: 1500,
      },
    ],
    videos: [
      {
        src: "/about/baseball-2026-clip.mp4",
        poster: "/about/baseball-2026-clip-poster.jpg",
        alt: "A short clip on a campus lawn, a baseball glove in the foreground and a glass-fronted building behind at sunset",
        width: 720,
        height: 1280,
      },
    ],
  },
  {
    when: "2025",
    title: "Meeting Hank Schrader from Breaking Bad",
    body: "Hank's meat was pretty good",
    images: [
      {
        src: "/about/hank-2025-group.jpg",
        alt: "Friends holding up Breaking Brisket T-shirts around a signing table at Swing Inn Cafe with the actor who played Hank Schrader",
        width: 2000,
        height: 1500,
      },
      {
        src: "/about/hank-2025-autograph.jpg",
        alt: "A signed black-and-white headshot inscribed \"To my sussy baka\"",
        width: 1500,
        height: 2000,
      },
      {
        src: "/about/hank-2025-brisket.jpg",
        alt: "A tray of smoked brisket, ribs, coleslaw and toast with sauce bottles on a picnic table",
        width: 1500,
        height: 2000,
      },
    ],
  },
  {
    when: "2025",
    title: "Signed PSG shirt",
    body: "2025 FIFA Club World Cup",
    images: [
      {
        src: "/about/psg-2025-shirt.jpg",
        alt: "A navy Paris Saint-Germain shirt with a silver signature across the front",
        width: 1500,
        height: 2000,
      },
    ],
    videos: [
      {
        src: "/about/psg-2025-signing.mp4",
        poster: "/about/psg-2025-signing-poster.jpg",
        alt: "A PSG player in a red team hoodie signing the shirt",
        width: 720,
        height: 1280,
      },
    ],
  },
  {
    when: "2024",
    title: "First winter in Pittsburgh",
    body: "California kid meets snow for the first time",
    images: [
      {
        src: "/about/pittsburgh-winter-2024.jpg",
        alt: "Three friends in winter jackets taking a selfie in front of a misty waterfall and frosted railings at sunset",
        width: 2000,
        height: 1500,
      },
      {
        src: "/about/pittsburgh-winter-2024-lights.jpg",
        alt: "Ryan taking a photo with a Sony camera in front of a garden lit up with holiday lights at night",
        width: 1080,
        height: 1440,
      },
      {
        src: "/about/pittsburgh-winter-2024-skating.jpg",
        alt: "Six friends in winter coats on ice skates, posing on a rink in front of a big lit-up Christmas tree at night",
        width: 2000,
        height: 1124,
      },
    ],
  },
  {
    when: "High school",
    title: "High school",
    body: "A little harder than middle school",
    images: [
      {
        src: "/about/highschool-night.jpg",
        alt: "Four friends in suits smiling for a selfie outside a lit-up arena at night",
        width: 2000,
        height: 1500,
      },
      {
        src: "/about/highschool-fishing.jpg",
        alt: "Three friends in sun hats on a pier, one holding up a fish they caught",
        width: 1500,
        height: 2000,
      },
    ],
  },
  {
    when: "Childhood",
    title: "Childhood",
    body: "The good old days",
    images: [
      {
        src: "/about/childhood-photo.jpg",
        alt: "Ryan as a kid",
        width: 720,
        height: 960,
      },
    ],
    videos: [
      {
        src: "/about/childhood-video.mov",
        poster: "/about/childhood-poster.jpg",
        alt: "A short clip of Ryan as a kid",
        width: 640,
        height: 480,
      },
    ],
  },
];
