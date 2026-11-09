import adapter from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
    // data/ stays at the repo root: scripts/photos.mjs writes into it.
    alias: { $data: "data" },
  },
};
