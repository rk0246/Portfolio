# Portfolio

A tilted grid canvas for a home page — sweep across it and scattered squares light
up — plus a persistent dock and a dedicated page per section. All 2D: no CSS 3D
anywhere.
Next.js App Router · Tailwind CSS v4 · Framer Motion.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Where things live

```
app/
  layout.js        fonts, theme boot script, <Dock /> on every page
  page.js          home — the isometric canvas
  about|resume|photography|youtube|projects|contact/page.js
components/
  Dock.jsx         the one nav; reads data/nav.js
  DockIcon.jsx     one destination + active dot
  IsoStage.jsx     the canvas plane and its hoverable grid
  Hud.jsx          corner readouts: clock, viewport size, visitor timezone
  PageShell.jsx    shared kicker/title/lede for the six section pages
  ProjectCard.jsx  PhotoFrame.jsx  VideoEmbed.jsx  Icon.jsx
  Preferences.jsx  theme + sound state, MotionConfig
data/
  nav.js           ← the seven sections the dock is built from.
  site.js resume.js projects.js youtube.js
lib/
  unsplash.js      photography: fetches + normalises the Unsplash API
public/
  resume.pdf  images/{portrait,photos,projects}
```

## Replacing the placeholder content

Everything shipped is a placeholder, marked with `⚠️ PLACEHOLDER` in each data file.

| What | Where |
|---|---|
| **Your name** (the big type on home) | `data/site.js` → `name` |
| Bio, portrait, hobby blurbs | `data/site.js` → `about` |
| Roles, dates, impact, skills | `data/resume.js` |
| Résumé PDF | replace `public/resume.pdf` |
| Photos + EXIF + captions | the Unsplash account — see [Photography](#photography) |
| Channel, featured + recent video IDs | `data/youtube.js` |
| Projects | `data/projects.js`, thumbs in `public/images/projects/` |
| Email, socials, location | `data/site.js` |

The bottom-right HUD readout shows the visitor's own timezone, which the browser
reports for free. For an actual city ("Last visit from Tampa"), read Vercel's
`x-vercel-ip-city` header server-side — note that makes `/` dynamic rather than static.

## Photography

The photography page renders whatever is on the Unsplash account
`ryankim246` — there is no local photo data to maintain. Set a key first:

```bash
cp .env.example .env.local   # then paste your key from
                             # https://unsplash.com/oauth/applications
```

`UNSPLASH_ACCESS_KEY` is read server-side only, in `lib/unsplash.js`. Without
it the page renders a short notice instead of failing the build.

### It costs two kinds of request

`GET /users/:username/photos` returns *abbreviated* photo objects — the API docs
are explicit that list responses omit attributes, and `exif` and `location` are
two of them. Getting the camera settings for the hover overlay therefore needs a
second call per photo, `GET /photos/:id`. There is no way to get both in one
request.

The two calls cache on different clocks so this stays cheap:

| Request | Revalidate | Why |
| --- | --- | --- |
| the photo list | 1 hour | new uploads should appear the same day |
| each photo's detail | 24 hours | a published photo's EXIF never changes |

A cold render of a 100-photo account costs about **104 requests** (4 list pages +
100 details). After that, an hourly revalidation costs only the 4 list pages.

**This matters because of rate limits.** An Unsplash app in Demo mode is capped
at **50 requests/hour**, which cannot serve that first render — expect a partial
grid until it is approved for Production (1000/hour). Note also that in
development Next re-renders pages on every request, so a cold cache plus a few
refreshes can exhaust a demo key quickly.

### Locations

The filter chips are built from whatever location each photo is tagged with on
Unsplash — the site has no location data of its own. Untagged photos still
appear under "All" but get no chip, so tagging happens on unsplash.com.

### Attribution

Unsplash's API Guidelines require attributing the photographer and Unsplash, and
require that the `urls.*` the API returns are hotlinked rather than copied — the
latter is why `next.config.mjs` allows `images.unsplash.com` as a remote pattern
rather than the photos being downloaded into `public/`.

Adding a section: one entry in `data/nav.js` plus `app/<route>/page.js`. The dock
picks it up automatically.

Once real photos replace the SVG placeholders, delete the `images` block in
`next.config.mjs` — it only exists because `next/image` won't optimize SVG without it.

## Design tokens

Tailwind v4 has no `tailwind.config.js`; the theme is CSS-native. Tokens live in
the `@theme` block at the top of `app/globals.css` and become utilities
(`--color-orange` → `text-orange` / `bg-orange`, `--font-display` → `font-display`).
Dark mode re-points the same variables under `html[data-theme="dark"]`, so there is
one set of utilities and no `dark:` variants anywhere.

**One accent: red.** It carries identity and current state (active dock item, text
selection, company names) *and* every interaction (hover, focus rings, links, the grid
trail). Black, white and red only — no second accent anywhere, so `--color-red` is the
single knob for the whole palette.

Four faces: **M PLUS Rounded 1c** at 900 (`font-wordmark`) for the name on the home
page only, **Space Grotesk** (`font-display`) for headings everywhere else, **Inter**
(`font-sans`) for body, and **JetBrains Mono** (`font-mono`) for labels and the HUD.

The wordmark face is a *rounded* gothic — rounded stroke terminals, not just circular
bowls. A geometric face such as Poppins still cuts its terminals flat, which is why
it reads as less rounded than it looks at a glance.

It needs an explicit `font-black` on the element: it is loaded at weight 900 only, and
unlike a single-weight face such as Archivo Black it will not be picked up by a
default `font-weight: 400`. If you swap the face, check the computed weight — a
missing `font-black` shows up as subtly-too-light type rather than an error.

## The home canvas

At md and up the home page is a grid with the name laid across it, first and last name
stacked and centred. The canvas is tilted — rotated and squashed vertically so it
reads as a floor rather than a wall. Sweeping the cursor lights up **only a scattered
~20% of the squares**, so the trail reads as a few marks rather than a solid ribbon; lit squares
fade back slowly. The whole canvas drifts a little against the cursor. Nothing
animates on its own: move the mouse and it moves, stop and it stops.

Which squares are live is decided by a **deterministic hash of the cell index**, not
`Math.random()` — random would pick different cells on the server and the client and
mismatch on hydration. `Math.sin()` is no good either (not guaranteed bit-identical
across JS engines); the hash uses integer ops via `Math.imul`. A cheaper hash left
visible clumps of live squares, so the mixing quality is doing real work.

**Everything is 2D.** The tilt is a plain affine transform — rotate, then squash
vertically — not perspective. There is no `perspective`, no `transform-style:
preserve-3d`, no `translateZ`, no `rotateX`/`rotateY` and no backface culling anywhere
on the page.

Worth knowing before adding decoration back: earlier versions scattered objects
(cards, camera, keyboard…) around the name, first as real CSS 3D solids and then as
isometric SVG. Both were removed. CSS 3D in particular is a dead end here — it has no
depth buffer, so faces paint over each other and foreshortened side walls read as
stray bars. If objects come back, flat SVG on the plane is the route that worked.

Because affine transforms preserve midpoints, the grid and the name both land dead on
the stage centre with no offsets — none of the optical-centring constants a
perspective projection would need.

**On the stacked name looking off-centre:** it isn't. Both lines share a layout centre
(`text-align: center` on full-width blocks); on screen their midpoints differ by
`sin(19°) × line-height × scale` ≈ 40px, purely because the plane is tilted. Nudging
one line to compensate would make the block genuinely off-centre.

The grid squares are drawn only as a patch around the name and radially masked at the
edges, so it reads as an island rather than a backdrop. The grid reacts through plain
CSS `:hover`, so `IsoStage` stays a server component and its ~640 cells ship with no
JavaScript. The only script on the page is `PointerParallax`, which renders nothing and
writes `--pan-x`/`--pan-y` straight to the plane from a rAF loop — routing that through
state would re-render every cell on each mouse move.

Below md none of it applies — no hover on touch, so the grid is hidden and the page
falls back to the name alone.

Tuning knobs:

| What | Where |
|---|---|
| Tilt and foreshortening (`--iso-rz`, `--iso-squash`, `--iso-scale`) | `.iso-plane` in `app/globals.css` — neutralise to `0deg` / `1` for a straight-on grid |
| How many squares react | `LIVE_RATE` in `components/IsoStage.jsx` |
| Plane size, grid patch size, square size | `PLANE`, `GRID`, `CELL` in `data/nav.js` |
| How far the grid patch fades out | the `mask-image` radial-gradient on `.iso-grid` |
| Trail colour, speed and fade | `.iso-cell` / `.iso-cell.is-live:hover` in `app/globals.css` |
| Cursor drift distance and glide rate | `MAX_X`, `MAX_Y`, `EASE` in `components/PointerParallax.jsx` |
| Name size and letter spacing | the `md:text-[10.5rem]` / `md:tracking-[0.13em]` on the `<h1>` in `app/page.js` |

Keep `GRID.w` and `GRID.h` whole multiples of `CELL` so the patch divides evenly.

## Motion and accessibility

- The grid squares are decorative, not navigation: `aria-hidden`, not focusable, and
  every destination lives in the dock. Nothing is reachable only by hover.
- The name is `pointer-events: none`, so squares underneath it still light up.
- `prefers-reduced-motion` stops the cursor drift, which leaves the canvas fully
  static — there is no other motion on the page to suppress.
- The wordmark's split letters are `aria-hidden` and the `<h1>` carries an
  `aria-label`, so screen readers announce the name rather than spelling it out.
- The cursor drift never starts under `prefers-reduced-motion` or below md, and
  re-centres when the pointer leaves the window.
- `prefers-reduced-motion` keeps the plane's static attitude but drops every
  transition and pointer-driven movement; colour still changes on hover.
  `MotionConfig reducedMotion="user"` covers the Framer Motion pieces.
- Focus-visible rings in orange sitewide, skip link, `aria-current="page"` on the
  active dock item, labelled icon buttons.
- YouTube embeds are click-to-load facades — nothing from youtube.com is requested
  until a play button is pressed.

## Deploy

Push to GitHub, import the repo on Vercel, accept the defaults. Nothing here needs
environment variables or a server runtime — all seven routes prerender as static.
