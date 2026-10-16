import { UNSPLASH_URL } from "@/lib/attribution";

/**
 * "Photo by <name> on Unsplash" — required on every display of an API photo.
 *
 * Deliberately quiet: small muted Inter under the gear line, with the links
 * darkening to the text colour on hover. The guidelines ask for the
 * credit to be present and legible, not prominent.
 *
 * It reads *under* the photo rather than inside PhotoFrame's hover overlay
 * because it contains links, and an anchor nested in a button is invalid HTML —
 * the overlay lives inside the button that opens the lightbox.
 */
export default function PhotoCredit({ credit, className = "" }) {
  if (!credit?.name) return null;

  return (
    <p
      className={`type-meta text-xs ${className}`}
    >
      Photo by <CreditLink href={credit.profileUrl}>{credit.name}</CreditLink> on{" "}
      <CreditLink href={UNSPLASH_URL}>Unsplash</CreditLink>
    </p>
  );
}

function CreditLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="underline decoration-border underline-offset-[3px] transition-colors
        hover:text-text"
    >
      {children}
    </a>
  );
}
