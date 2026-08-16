"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Icon from "./Icon";

/**
 * One dock destination. Hover lifts it and tints it with the accent. The active
 * page keeps that tint persistently, plus a shared-layout dot that slides
 * between icons on navigation.
 */
export default function DockIcon({ section, active, onNavigate }) {
  return (
    <li className="relative shrink-0">
      <Link
        href={section.href}
        aria-label={section.label}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
        className={`group relative flex h-9 w-9 items-center justify-center rounded-xl
          transition-[color,transform,background-color] duration-200 ease-[var(--ease-tile)]
          hover:-translate-y-1 hover:bg-fill hover:text-red
          sm:h-11 sm:w-11
          ${active ? "text-red" : "text-text/70"}`}
      >
        <Icon name={section.icon} size={20} />

        {/* Tooltip — pointer-only affordance, so it stays off small screens. */}
        <span
          className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2
            whitespace-nowrap rounded-md bg-text px-2 py-1 font-mono text-[11px]
            tracking-tight text-bg opacity-0 transition-opacity duration-150
            group-hover:opacity-100 md:block"
        >
          {section.label}
        </span>
      </Link>

      {active && (
        <motion.span
          layoutId="dock-active"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="pointer-events-none absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red"
        />
      )}
    </li>
  );
}
