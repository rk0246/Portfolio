"use client";

import { usePathname } from "next/navigation";
import { useMotionValue, useReducedMotion } from "framer-motion";
import { dockSections, isActive } from "@/data/nav";
import { usePreferences } from "./Preferences";
import DockIcon from "./DockIcon";
import Icon from "./Icon";

function ToggleButton({ label, pressed, onClick, icon }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={pressed}
        title={label}
        className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text/70
          transition-[color,transform,background-color] duration-200 ease-[var(--ease-tile)]
          hover:-translate-y-1 hover:bg-fill hover:text-red sm:h-11 sm:w-11"
      >
        <Icon name={icon} size={18} />
      </button>
    </li>
  );
}

/**
 * The one piece of navigation present on every page. Reads its destinations
 * from data/nav.js so it can never disagree with the home tile grid.
 */
export default function Dock() {
  const pathname = usePathname();
  const { theme, setTheme } = usePreferences();
  // Cursor x across the dock, for the magnification. Infinity = not hovering.
  const mouseX = useMotionValue(Infinity);
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6"
    >
      <ul
        onMouseMove={(e) => {
          // Pointer-only, and md+ only: below that the dock scrolls sideways.
          if (!reduce && window.innerWidth >= 768) mouseX.set(e.clientX);
        }}
        onMouseLeave={() => mouseX.set(Infinity)}
        /* Eight targets have to fit a 375px phone: no gaps and tight padding
           below sm, with overflow-x as the escape hatch on narrower screens
           rather than a clipped or wrapped dock. From md up it never overflows, and
           overflow must be visible there or the hover labels get clipped. */
        className="flex max-w-[calc(100vw-1.5rem)] items-center gap-0 overflow-x-auto md:overflow-visible
          glass rounded-2xl px-1 py-1.5 sm:gap-1 sm:rounded-[1.25rem] sm:px-2"
      >
        {dockSections.map((section) => (
          <DockIcon
            key={section.href}
            section={section}
            active={isActive(pathname, section.href)}
            mouseX={mouseX}
          />
        ))}

        <li aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-border sm:mx-1" />

        <ToggleButton
          label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          pressed={theme === "dark"}
          icon={theme === "dark" ? "sun" : "moon"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </ul>
    </nav>
  );
}
