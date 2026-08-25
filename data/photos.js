/**
 * ⚠️ PLACEHOLDER CONTENT — the /images/photos/*.svg files are generated stand-ins,
 * split into two fake locations so the filter chips have something to do.
 *
 * This file is REPLACED WHOLESALE by `npm run photos`, which reads real photos
 * from photos-src/<location>/ and fills in dimensions and camera settings from
 * the files themselves. See scripts/photos.mjs. Once you run it, everything
 * below (and every .svg in public/images/photos) can go.
 */
export const locations = [
  {
    slug: "the-city",
    name: "The City",
    photos: [
      {
        src: "/images/photos/01.svg",
        alt: "Placeholder — city street at dusk",
        caption: "Blue hour, downtown",
        location: "the-city",
        width: 1600,
        height: 1067,
        exif: { camera: "Sony A7 IV", lens: "35mm f/1.4 GM", focal: "35mm", aperture: "f/1.8", shutter: "1/125", iso: "800" },
      },
      {
        src: "/images/photos/02.svg",
        alt: "Placeholder — portrait against a plain wall",
        caption: "Available light",
        location: "the-city",
        width: 1067,
        height: 1600,
        exif: { camera: "Sony A7 IV", lens: "85mm f/1.8", focal: "85mm", aperture: "f/2.0", shutter: "1/250", iso: "200" },
      },
      {
        src: "/images/photos/05.svg",
        alt: "Placeholder — neon sign in the rain",
        caption: "Rained the whole trip",
        location: "the-city",
        width: 1067,
        height: 1600,
        exif: { camera: "Fujifilm X-T5", lens: "35mm f/2", focal: "35mm", aperture: "f/2", shutter: "1/60", iso: "3200" },
      },
    ],
  },
  {
    slug: "the-coast",
    name: "The Coast",
    photos: [
      {
        src: "/images/photos/03.svg",
        alt: "Placeholder — coastline at golden hour",
        caption: "Pacific, late September",
        location: "the-coast",
        width: 1600,
        height: 1067,
        exif: { camera: "Sony A7 IV", lens: "24-70mm f/2.8", focal: "24mm", aperture: "f/8", shutter: "1/500", iso: "100" },
      },
      {
        src: "/images/photos/04.svg",
        alt: "Placeholder — car detail, low angle",
        caption: "Wheel-off weekend",
        location: "the-coast",
        width: 1600,
        height: 1067,
        exif: { camera: "Fujifilm X-T5", lens: "23mm f/1.4", focal: "23mm", aperture: "f/1.4", shutter: "1/1000", iso: "160" },
      },
      {
        src: "/images/photos/06.svg",
        alt: "Placeholder — mountain ridgeline in fog",
        caption: "Above the cloud layer",
        location: "the-coast",
        width: 1600,
        height: 1067,
        exif: { camera: "Sony A7 IV", lens: "70-200mm f/4", focal: "135mm", aperture: "f/5.6", shutter: "1/800", iso: "400" },
      },
    ],
  },
];

/** Every photo, flattened — the grid renders this and filters on `location`. */
export const photos = locations.flatMap((location) => location.photos);
