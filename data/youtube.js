/**
 * The channel, hand-picked. Order here is the order on the page — this is a
 * portfolio, so it leads with reach rather than recency.
 *
 * A video ID is the 11 characters after `v=` in a watch URL:
 * https://www.youtube.com/watch?v=uX6K3eavmFA  ->  "uX6K3eavmFA"
 *
 * Entries may also be a bare ID string. Prefer the { id, title } form: the
 * title becomes the caption under the video, the play button's accessible
 * name, and the embed's frame title. Nothing is fetched at build time — these
 * are plain IDs, and the page renders click-to-load thumbnails from them.
 * See components/VideoEmbed.jsx.
 */
export const youtube = {
  channelUrl: "https://youtube.com/@ryankimyt",

  featured: { id: "uX6K3eavmFA", title: "Squid Game Russian Roulette Scene on a $3.01 Budget" },

  videos: [
    { id: "KP7dhA6v8vY", title: "Bloopers for Squid Game Russian Roulette Scene on a $3.01 budget" },
    { id: "Jy2jh5AumNQ", title: "Gustavo Fring death scene but it’s a $3.01 budget" },
    { id: "rc8aFusOs40", title: "We Tried the Squid Game Bread Scene…It Went Horribly Wrong | Bread & Lottery Scene on a $3.01 Budget" },
    { id: "1Ll5LfCb8wk", title: "Tuco meets Heisenberg but with a $3.01 budget" },
    { id: "B2ysqtfdjOk", title: "American Psycho but they're water snobs shot on a $3.01 budget" },
    { id: "aJYqBzc6neQ", title: "\"Bless Me Father For I Have Sinned\" | Daredevil Confession Scene on a $3.01 budget" },
    { id: "TAAPZj9TauE", title: "Harvey Specter Meets Mike Ross… on a $3.01 Budget" },
    { id: "1UX0rWJXwX0", title: "Batman Interrogates the Joker on a $3.01 Budget" },
    { id: "tJ9tGeszApk", title: "Mamihlapinatapai | Short Film shot on a7iv" },
  ],
};
