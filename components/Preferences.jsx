"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useSyncExternalStore } from "react";
import { MotionConfig } from "framer-motion";

/**
 * Theme + sound preferences, persisted to localStorage.
 *
 * Theme defaults to light — §2's palette *is* the light one, so dark is an
 * explicit opt-in rather than something the OS decides on the user's behalf.
 * THEME_INIT_SCRIPT (inlined in <head>) applies the stored value before first
 * paint; this provider then reads the DOM as the source of truth.
 *
 * Both prefs are external state, so they're read through useSyncExternalStore
 * rather than an effect: the server snapshot keeps SSR and hydration agreed on
 * the defaults, and React swaps in the real value right after without a
 * cascading setState-in-effect render.
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

const readTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

const readSound = () => {
  try {
    return localStorage.getItem("sound") === "on" ? "on" : "off";
  } catch {
    return "off"; // private mode — fall back to the default
  }
};

export function PreferencesProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light");
  const soundPref = useSyncExternalStore(subscribe, readSound, () => "off");
  const sound = soundPref === "on";
  const audioRef = useRef(null);

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

  const setSound = useCallback((on) => persist("sound", on ? "on" : "off"), [persist]);

  /** A short synthesized tick. No audio files, no network, ~nothing in bundle. */
  const playClick = useCallback(() => {
    if (!sound) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = (audioRef.current ||= new Ctx());
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.06);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      /* audio is decoration — never let it break navigation */
    }
  }, [sound]);

  const value = useMemo(
    () => ({ theme, setTheme, sound, setSound, playClick }),
    [theme, setTheme, sound, setSound, playClick],
  );

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
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
