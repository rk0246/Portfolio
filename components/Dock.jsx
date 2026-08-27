"use client";

import { usePathname } from "next/navigation";
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

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6"
    >
      <ul
        /* Eight targets have to fit a 375px phone: no gaps and tight padding
           below sm, with overflow-x as the escape hatch on narrower screens
           rather than a clipped or wrapped dock. */
        className="flex max-w-[calc(100vw-1.5rem)] items-center gap-0 overflow-x-auto
          rounded-2xl border border-border bg-surface/85 px-1 py-1.5
          shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:gap-1 sm:rounded-[1.25rem] sm:px-2"
      >
        {dockSections.map((section) => (
          <DockIcon
            key={section.href}
            section={section}
            active={isActive(pathname, section.href)}
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
