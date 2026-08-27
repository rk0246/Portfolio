"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { MotionConfig } from "framer-motion";

/**
 * Theme preference, persisted to localStorage.
 *
 * Theme defaults to light — §2's palette *is* the light one, so dark is an
 * explicit opt-in rather than something the OS decides on the user's behalf.
 * THEME_INIT_SCRIPT (inlined in <head>) applies the stored value before first
 * paint; this provider then reads the DOM as the source of truth.
 *
 * The pref is external state, so it's read through useSyncExternalStore rather
 * than an effect: the server snapshot keeps SSR and hydration agreed on the
 * default, and React swaps in the real value right after without a cascading
 * setState-in-effect render.
 */
const PreferencesContext = createContext(null);

const PREFS_EVENT = "portfolio:prefs";

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light")t="light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

/** `storage` covers other tabs; the custom event covers this one. */
function subscribe(onChange) {
  window.addEventListener(PREFS_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(PREFS_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const readTheme = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export function PreferencesProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light");

  const persist = useCallback((key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* still applies for this session */
    }
    window.dispatchEvent(new Event(PREFS_EVENT));
  }, []);

  const setTheme = useCallback(
    (next) => {
      document.documentElement.dataset.theme = next;
      persist("theme", next);
    },
    [persist],
  );

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <PreferencesContext.Provider value={value}>
      {/* reducedMotion="user" makes every motion component across the site
          honour prefers-reduced-motion without per-component checks. It lives
          here because framer-motion 13 ships no "use client" directive, so it
          cannot be imported from the server layout. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
