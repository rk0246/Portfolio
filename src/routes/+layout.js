import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";

// Vercel Web Analytics: page views, including client-side navigations.
injectAnalytics({ mode: dev ? "development" : "production" });

// Every page is static except /photography and /youtube, which opt out.
export const prerender = true;
