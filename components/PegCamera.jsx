import Image from "next/image";
import Link from "next/link";

/**
 * The camera hanging on the pegboard, upper right. Links to /photography and
 * shares the keyboard's drift, hover swing and lift (the .peg-keyboard* rules in
 * globals.css).
 *
 * One hook, so one peg to land on: the image is 210px wide (498x1005 source,
 * scale 0.4217), its ring centre is at (250.5, 37.5) in the source, i.e.
 * (105.64, 15.81) in px. The pegs sit at 44n - 42, so left/top round to put that
 * point on a peg (target: right edge at 92%, top 16px, as high as the pegs allow, to leave room for the shelf below).
 *
 * xl and up only, like the keyboard.
 */
const LEFT = "calc(round(nearest, calc(92% - 210px + 42px + 105.64px), 44px) - 147.64px)";
const TOP = "calc(round(nearest, calc(16px + 42px + 15.81px), 44px) - 57.81px)";

export default function PegCamera() {
  return (
    <div
      className="peg-keyboard pointer-events-none absolute hidden xl:block"
      style={{ left: LEFT, top: TOP }}
    >
      <Link
        href="/photography"
        aria-label="Photography"
        className="peg-keyboard-link pointer-events-auto block"
      >
        <Image
          src="/pegboard/camera-cutout.png"
          alt=""
          width={498}
          height={1005}
          priority
          className="peg-keyboard-img"
          style={{ width: "210px", height: "auto" }}
        />
      </Link>
    </div>
  );
}
