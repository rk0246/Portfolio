import { PLANE, GRID, CELL } from "@/data/nav";
import PointerParallax from "./PointerParallax";

const cols = Math.round(GRID.w / CELL);
const rows = Math.round(GRID.h / CELL);

/** Share of squares that react to the cursor. */
const LIVE_RATE = 0.2;

/**
 * Deterministic per-index hash (splitmix32), so the same squares are live on the
 * server and on the client — Math.random() would mismatch on hydration, and
 * Math.sin() is not guaranteed bit-identical across JS engines. Integer ops via
 * Math.imul are.
 *
 * The mixing matters: a cheaper hash left visible clumps, which read as patches
 * of live grid rather than an even scatter.
 */
function isLive(i) {
  let h = (i + 0x9e3779b9) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  h = (h ^ (h >>> 15)) >>> 0;
  return (h % 1000) / 1000 < LIVE_RATE;
}

const cells = Array.from({ length: cols * rows }, (_, i) => ({
  i,
  live: isLive(i),
}));

/**
 * The canvas behind the home page.
 *
 * The tilted-floor look is a 2D affine transform on the plane (see globals.css)
 * — no CSS 3D is used anywhere here. The grid reacts to the pointer through
 * plain CSS :hover, so this stays a server component and the cells ship with no
 * JavaScript; they exist as real elements only because per-cell hover needs
 * something to hover.
 *
 * Below md none of this applies — the plane is a plain padded stack and the
 * grid is hidden entirely (there is no hover on touch).
 */
export default function IsoStage({ children }) {
  return (
    <div className="iso-stage">
      <div
        className="iso-plane"
        style={{ "--plane-w": `${PLANE.w}px`, "--plane-h": `${PLANE.h}px` }}
      >
        {/* One masked patch of grid, centred on the name. The radial mask in
            globals.css is what fades it out at the edges. */}
        <div
          className="iso-grid hidden md:block"
          aria-hidden="true"
          style={{ "--grid-w": `${GRID.w}px`, "--grid-h": `${GRID.h}px` }}
        >
          {/* Crosshairs at every second intersection. Inline <svg> rather than a
              background image so the marks inherit currentColor and follow the
              theme. Never takes the pointer — the cells above do. */}
          <svg className="iso-marks pointer-events-none text-text">
            <defs>
              <pattern
                id="iso-plus"
                width={CELL * 2}
                height={CELL * 2}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M${CELL} ${CELL - 6}v12M${CELL - 6} ${CELL}h12`}
                  stroke="currentColor"
                  strokeOpacity="0.22"
                  strokeWidth="1.5"
                  fill="none"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#iso-plus)" />
          </svg>

          <div
            className="iso-cells"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
              gridAutoRows: `${CELL}px`,
            }}
          >
            {cells.map((cell) => (
              <span
                key={cell.i}
                className={`iso-cell${cell.live ? " is-live" : ""}`}
              />
            ))}
          </div>
        </div>

        {children}
      </div>

      {/* Renders nothing — just drifts the plane against the cursor. */}
      <PointerParallax />
    </div>
  );
}
