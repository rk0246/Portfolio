import Image from "next/image";
import Link from "next/link";

/**
 * The bobblehead shelf hanging on the pegboard, above the keyboard. Links to
 * /about and shares the keyboard's drift, hover swing and lift (the
 * .peg-keyboard* rules in globals.css).
 *
 * Both hooks land on pegs, positioned against the keyboard's own rings so the
 * two stay in step at any width:
 *   - the image is 264.33px wide (794x885 source, scale 0.33291), so its hook
 *     rings (centres at x 199 and 595.5, y 45.3 in the source) are 132px —
 *     three pegs — apart; the first ring is 66.25 right / 15.08 down from the
 *     corner. (Only 176px and 264px keep both rings on pegs: the ring spacing is
 *     a fixed share of the image width, and pegs are 44px apart.)
 *   - its first ring is directly above the keyboard's first ring and seven pegs
 *     (308px) higher; KB_X / KB_Y below repeat PegKeyboard's snapped position
 *     (the ring peg is that value minus 42)
 * Pegs sit at 44n - 42 on both axes.
 *
 * xl and up only, like the keyboard.
 */
const FS = "clamp(2.6rem, 9vw, 7.8rem)"; // the name's font size
const KB_X = `round(nearest, calc(50% - 1.725 * ${FS} - 380px + 98.19px), 44px)`;
const KB_Y = "round(nearest, calc(50% + 29px + 53.41px), 44px)";
const LEFT = `calc(${KB_X} - 108.25px)`;
const TOP = `calc(${KB_Y} - 365.08px)`;

export default function PegBobblehead() {
  return (
    <div
      className="peg-keyboard pointer-events-none absolute hidden xl:block"
      style={{ left: LEFT, top: TOP }}
    >
      <Link
        href="/about"
        aria-label="About"
        className="peg-keyboard-link pointer-events-auto block"
      >
        <Image
          src="/pegboard/bobblehead-cutout.png"
          alt=""
          width={794}
          height={885}
          priority
          className="peg-keyboard-img"
          style={{ width: "264.33px", height: "auto" }}
        />
      </Link>
    </div>
  );
}
