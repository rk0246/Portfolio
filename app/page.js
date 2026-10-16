import Link from "next/link";
import IsoStage from "@/components/IsoStage";
import Hud from "@/components/Hud";
import KoiPond, { PondControls } from "@/components/home/KoiPond";
import { site } from "@/data/site";

export default function HomePage() {
  // "Ryan Kim" -> "Ryan" / "Kim". Anything after the first space stacks below.
  const [firstName, ...rest] = site.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <>
      {/* Decorative canvas behind everything; starts after hydration. */}
      <KoiPond />

      <IsoStage>
        {/* The only thing on the plane. Navigation lives entirely in the dock. */}
        <div className="iso-name">
          <h1
            aria-label={site.name}
            className="type-display text-center text-[clamp(2.6rem,9vw,7.8rem)] uppercase
              leading-[1.1538] tracking-[0.06em]"
          >
            {/* Blocks rather than a wrapped line, so the shorter name centres
                under the longer one. */}
            <Link href="/about" aria-label={`${site.name}, about`}>
              <span aria-hidden="true" className="block">
                <span className="name-line">{firstName}</span>
              </span>
              {lastName && (
                <span aria-hidden="true" className="block">
                  <span className="name-line">{lastName}</span>
                </span>
              )}
            </Link>
          </h1>
        </div>
      </IsoStage>

      <Hud />
      <PondControls />
    </>
  );
}
