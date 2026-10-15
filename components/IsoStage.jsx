import { PLANE } from "@/data/nav";
import PointerParallax from "./PointerParallax";
import PegGlow from "./PegGlow";
import PegKeyboard from "./PegKeyboard";
import PegCamera from "./PegCamera";
import PegShelf from "./PegShelf";
import PegBobblehead from "./PegBobblehead";

/**
 * The canvas behind the home page: the pegboard (.iso-dots) and the name on a
 * plane. PointerParallax drifts both together against the cursor.
 *
 * Below md the board is hidden and the plane is a plain padded stack.
 */
export default function IsoStage({ children }) {
  return (
    <div className="iso-stage">
      <div className="iso-dots hidden md:block" aria-hidden="true">
        <div className="iso-glow" />
      </div>

      <PegKeyboard />
      <PegCamera />
      <PegShelf />
      <PegBobblehead />

      <div
        className="iso-plane"
        style={{ "--plane-w": `${PLANE.w}px`, "--plane-h": `${PLANE.h}px` }}
      >
        {children}
      </div>

      <PegGlow />

      {/* Renders nothing — just drifts the plane against the cursor. */}
      <PointerParallax />
    </div>
  );
}
