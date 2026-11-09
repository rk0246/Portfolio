import { getPhotos } from "$lib/server/unsplash";

export const prerender = false;
/** Rebuild the page at most once an hour; see lib/server/unsplash.js for why
 *  the two underlying fetches cache on different clocks. */
export const config = { isr: { expiration: 3600 } };

export const load = () => getPhotos();
