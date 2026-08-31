/**
 * Unsplash attribution constants.
 *
 * Separate from lib/unsplash.js on purpose. That module reads
 * UNSPLASH_ACCESS_KEY and is only ever imported by Server Components; the
 * credit line has to render inside client components, so importing it there
 * would drag the whole fetch layer into the browser bundle. Everything here is
 * inert and safe on both sides.
 *
 * APP_NAME must match the application name registered at
 * unsplash.com/oauth/applications — it is what Unsplash sees in the referral
 * data, and the production application is reviewed against it.
 */
export const APP_NAME = "ryan_kim_portfolio";

/** The guidelines require these on every link back to Unsplash. */
export const UTM = { utm_source: APP_NAME, utm_medium: "referral" };

/** Set query parameters on a URL, preserving any already there. */
export function withParams(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

/** The "on Unsplash" half of every credit line. */
export const UNSPLASH_URL = withParams("https://unsplash.com", UTM);
