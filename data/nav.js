/**
 * The single source of navigation truth for the whole site.
 *
 * The dock (every page) and the tile grid (home only) both read from this list
 * — neither keeps its own copy, so they cannot drift apart. Adding a section
 * here plus a page.js under app/ is all a new section needs.
 *
 * Per entry:
 *   href      route
 *   label     dock tooltip + tile heading
 *   icon      key into components/Icon.jsx
 *   inDock    show in the bottom dock
 *   tile      show as a tile on the home page
 *   blurb     one-line tile subtitle
 *   iso       placement on the isometric plane at md+ (see PLANE below):
 *               x,y  top-left in plane coordinates, px
 *               w,h  size in plane coordinates, px
 *               rz   in-plane spin so no two tiles sit square to each other
 *   image     optional path under /public; falls back to generated art
 *
 * Below md the iso values are ignored entirely and tiles stack flat — §3 of
 * the brief, and a rotated drag-canvas is the wrong thing on a phone anyway.
 */

/** The isometric plane on the home page.
 *
 *  PLANE is the coordinate space the name is centred in. GRID is the patch of
 *  hoverable squares drawn around it — deliberately smaller than the plane, and
 *  radially masked at its edges, so the grid reads as an island rather than a
 *  backdrop. Keep GRID.w/GRID.h whole multiples of CELL so it divides evenly. */
export const PLANE = { w: 2600, h: 1800 };
export const GRID = { w: 1280, h: 800 };
export const CELL = 40;

export const sections = [
  {
    href: "/",
    label: "Home",
    icon: "home",
    inDock: true,
    tile: false,
  },
  {
    href: "/about",
    label: "About",
    icon: "user",
    inDock: true,
    tile: true,
    blurb: "Who I am, and what I get obsessive about",
    iso: { x: 680, y: 415, w: 400, h: 290, rz: -4 },
    image: null,
  },
  {
    href: "/resume",
    label: "Resume",
    icon: "file",
    inDock: true,
    tile: true,
    blurb: "Where I've worked and what shipped",
    iso: { x: 1570, y: 400, w: 420, h: 280, rz: 3 },
    image: null,
  },
  {
    href: "/photography",
    label: "Photography",
    icon: "camera",
    inDock: true,
    tile: true,
    blurb: "Light, glass, and the occasional keeper",
    iso: { x: 1540, y: 980, w: 340, h: 340, rz: -2 },
    image: null,
  },
  {
    href: "/youtube",
    label: "YouTube",
    icon: "youtube",
    inDock: true,
    tile: true,
    blurb: "Builds, reviews, and long-form rambling",
    iso: { x: 795, y: 1030, w: 420, h: 300, rz: 5 },
    image: null,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: "layers",
    inDock: true,
    tile: true,
    blurb: "Things I built because they didn't exist",
    iso: { x: 1110, y: 300, w: 440, h: 290, rz: -3 },
    image: null,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: "mail",
    inDock: true,
    tile: false,
  },
];

export const dockSections = sections.filter((s) => s.inDock);
export const tileSections = sections.filter((s) => s.tile);

/** Active-state matching: "/" only matches exactly, everything else by prefix. */
export function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
