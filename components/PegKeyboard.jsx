import Image from "next/image";
import Link from "next/link";

/**
 * The keyboard hanging on the pegboard, left of the name. It links to
 * /projects and, on hover, swings gently from its hooks while lifting.
 *
 * It sits on the stage (not the scaled plane) and drifts with the dots, so the
 * two hooks can hang exactly on pegs: the dots are one per 44px, and the image
 * is sized so its hook rings are 176px (four pegs) apart — 1200px wide
 * scaled by 176/733, where 733 is the ring spacing in the source image. The
 * left/top then round so each ring's centre lands on a peg centre.
 *
 * Constants, from public/pegboard/keyboard-cutout.png (1200x695):
 *   ring centres at (234, 47.5) and (967, 47.5)
 *   at 0.24011 scale: width 288.13, first ring 56.19 right / 11.41 down
 * Pegs sit at 44n - 42 on both axes (the .iso-dots layer starts 64px outside
 * the stage and its tile centres are 22px in).
 *
 * xl and up only: below that the name and the keyboard would collide.
 */
const FS = "clamp(2.6rem, 9vw, 7.8rem)"; // the name's font size
const LEFT = `calc(round(nearest, calc(50% - 1.725 * ${FS} - 380px + 98.19px), 44px) - 98.19px)`;
const TOP = "calc(round(nearest, calc(50% + 29px + 53.41px), 44px) - 53.41px)";

export default function PegKeyboard() {
  return (
    <div
      className="peg-keyboard pointer-events-none absolute hidden xl:block"
      style={{ left: LEFT, top: TOP }}
    >
      <Link
        href="/projects"
        aria-label="Projects"
        className="peg-keyboard-link pointer-events-auto block"
      >
        <Image
          src="/pegboard/keyboard-cutout.png"
          alt=""
          width={1200}
          height={695}
          priority
          className="peg-keyboard-img"
          style={{ width: "288.13px", height: "auto" }}
        />
      </Link>
    </div>
  );
}
