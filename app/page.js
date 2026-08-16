import IsoStage from "@/components/IsoStage";
import Hud from "@/components/Hud";
import { site } from "@/data/site";

export default function HomePage() {
  // "Ryan Kim" -> "Ryan" / "Kim". Anything after the first space stacks below.
  const [firstName, ...rest] = site.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <>
      <IsoStage>
        {/* The only thing on the plane. Navigation lives entirely in the dock. */}
        <div className="iso-name">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase md:hidden">
            {site.role} · {site.location}
          </p>
          <h1
            aria-label={site.name}
            className="mt-4 font-wordmark font-black text-[clamp(2.75rem,11vw,7rem)] leading-[0.9]
              tracking-[0.02em] md:mt-0 md:text-[10.5rem] md:leading-[0.92]
              md:tracking-[0.13em] md:text-center md:uppercase"
          >
            {/* Blocks rather than a wrapped line, so the shorter name centres
                under the longer one. */}
            <span aria-hidden="true" className="block">
              {firstName}
            </span>
            {lastName && (
              <span aria-hidden="true" className="block">
                {lastName}
              </span>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted md:hidden">
            {site.tagline}
          </p>
        </div>
      </IsoStage>

      <Hud />
    </>
  );
}
