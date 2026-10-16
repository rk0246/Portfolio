import { PLANE } from "@/data/nav";
import PointerParallax from "./PointerParallax";

/**
 * The home page stage: the name on a plane, drifting a little against the
 * cursor (PointerParallax). The koi pond (components/home/KoiPond.jsx) is a
 * fixed canvas behind it; this sits above it (relative z-[1]) at every width.
 *
 * Below md the plane is a plain padded stack.
 */
export default function IsoStage({ children }) {
  return (
    <div className="iso-stage relative z-[1]">
      <div
        className="iso-plane"
        style={{ "--plane-w": `${PLANE.w}px`, "--plane-h": `${PLANE.h}px` }}
      >
        {children}
      </div>

      {/* Renders nothing — just drifts the plane against the cursor. */}
      <PointerParallax />
    </div>
  );
}
