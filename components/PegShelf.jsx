import Image from "next/image";
import Link from "next/link";

/**
 * The gear shelf hanging on the pegboard, right side, directly below the
 * camera. Links to /youtube and shares the keyboard's drift, hover swing and
 * lift (the .peg-keyboard* rules in globals.css).
 *
 * Both hooks land on pegs, and the shelf hangs straight under the camera:
 *   - the image is 193.7px wide (778x843 source, scale 0.24894), so the two
 *     hook rings (192.5 and 546, both at y 50.5 in the source) are 88px — two
 *     pegs — apart; the first ring is 47.92 right / 12.57 down from the corner
 *   - the camera's ring peg is round(...) - 42 (see PegCamera); the shelf's
 *     first ring is two pegs left of that and ten pegs (440px) below it, so the
 *     second ring hangs directly under the camera's ring
 * Pegs sit at 44n - 42 on both axes.
 *
 * xl and up only, like the keyboard. It needs about 700px of height; on shorter
 * windows its bottom edge will run past the viewport.
 */
const CAM_X = "round(nearest, calc(92% - 210px + 42px + 105.64px), 44px)";
const CAM_Y = "round(nearest, calc(16px + 42px + 15.81px), 44px)";
const LEFT = `calc(${CAM_X} - 177.92px)`;
const TOP = `calc(${CAM_Y} + 385.43px)`;

export default function PegShelf() {
  return (
    <div
      className="peg-keyboard pointer-events-none absolute hidden xl:block"
      style={{ left: LEFT, top: TOP }}
    >
      <Link
        href="/youtube"
        aria-label="YouTube"
        className="peg-keyboard-link pointer-events-auto block"
      >
        <Image
          src="/pegboard/shelf-cutout.png"
          alt=""
          width={778}
          height={843}
          priority
          className="peg-keyboard-img"
          style={{ width: "193.7px", height: "auto" }}
        />
      </Link>
    </div>
  );
}
