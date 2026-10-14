import { PLANE } from "@/data/nav";
import PointerParallax from "./PointerParallax";

/**
 * The canvas behind the home page: a faded pegboard dot pattern (.iso-dots)
 * and the name on a plane. PointerParallax drifts both together against the
 * cursor.
 *
 * Below md the dots are hidden and the plane is a plain padded stack.
 */
export default function IsoStage({ children }) {
  return (
    <div className="iso-stage">
      <div className="iso-dots hidden md:block" aria-hidden="true" />

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
