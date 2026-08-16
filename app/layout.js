import {
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
  M_PLUS_Rounded_1c,
} from "next/font/google";
import "./globals.css";
import Dock from "@/components/Dock";
import PageTransition from "@/components/PageTransition";
import {
  PreferencesProvider,
  THEME_INIT_SCRIPT,
} from "@/components/Preferences";
import { site } from "@/data/site";

/* The wordmark only — a rounded gothic at its heaviest weight. Rounded stroke
   terminals are the point here; a geometric face like Poppins has circular
   bowls but still cuts its terminals flat. Headings stay on Space Grotesk. */
const mPlusRounded = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: "900",
  variable: "--font-rounded",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${mPlusRounded.variable}`}
    >
      <head>
        {/* Applies the stored theme before first paint so dark users never
            get a white flash. Must stay inline and blocking. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-bg text-text">
        <PreferencesProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]
              focus:rounded-lg focus:border focus:border-border focus:bg-surface
              focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
          >
            Skip to content
          </a>

          {/* Dock clearance lives in PageShell / the home page rather than
              here — the home canvas is exactly one viewport tall and must not
              inherit padding that would give it a scrollbar. */}
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>

          <Dock />
        </PreferencesProvider>
      </body>
    </html>
  );
}
