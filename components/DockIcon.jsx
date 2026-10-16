"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";
import Icon from "./Icon";

/** Resting size of an icon, px. Matches sm:h-11 / sm:w-11. */
const BASE = 44;
/** Size of the icon directly under the cursor, and how far the effect reaches. */
const PEAK = 76;
const REACH = 130;

/**
 * One dock destination, with macOS-style magnification: `mouseX` is the
 * cursor's x across the whole dock (Infinity when it isn't over it). The
 * icon's slot grows with its closeness to the cursor, pushing neighbours aside,
 * while the icon itself scales up from its bottom edge so it rises out of the
 * bar. The active page keeps the accent tint, plus a shared-layout dot that
 * slides between icons on navigation.
 */
export default function DockIcon({ section, active, mouseX }) {
  const ref = useRef(null);

  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? x - (b.left + b.width / 2) : Infinity;
  });
  const size = useSpring(useTransform(distance, [-REACH, 0, REACH], [BASE, PEAK, BASE]), {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });
  // Exposed as CSS variables and applied only from md up, so the dock keeps its
  // compact fixed sizes on phones.
  const slot = useTransform(size, (v) => `${v}px`);
  const scale = useTransform(size, (v) => v / BASE);
  const lift = useTransform(size, (v) => `${-(v - BASE)}px`);

  return (
    <motion.li
      ref={ref}
      style={{ "--slot": slot }}
      className="group relative h-9 w-9 shrink-0 sm:h-11 sm:w-11 md:w-[var(--slot)]"
    >
      <motion.div
        style={{ "--scale": scale }}
        className="absolute bottom-0 left-1/2 -ml-[18px] h-9 w-9 origin-bottom
          sm:-ml-[22px] sm:h-11 sm:w-11 md:[transform:scale(var(--scale))]"
      >
        <Link
          href={section.href}
          aria-label={section.label}
          aria-current={active ? "page" : undefined}
          className={`flex h-full w-full items-center justify-center rounded-xl
            transition-[color,background-color] duration-200 ease-[var(--ease-tile)]
            hover:bg-fill hover:text-red
            ${active ? "text-red" : "text-text/70"}`}
        >
          <Icon name={section.icon} size={20} />
        </Link>
      </motion.div>

      {/* Label — pointer-only affordance, so it stays off small screens. Rides
          the magnified icon's top edge and pops up with a springy overshoot;
          the arrow is a rotated square so it follows the pill's colour. */}
      <motion.span
        aria-hidden="true"
        style={{ "--lift": lift }}
        className="pointer-events-none absolute bottom-full left-1/2 hidden md:block md:[transform:translate(-50%,var(--lift))]"
      >
        <span
          className="mb-3 block translate-y-2 scale-90 whitespace-nowrap rounded-lg bg-text
            px-2.5 py-1 type-ui text-[13px] text-bg opacity-0
            shadow-[0_6px_16px_rgba(0,0,0,0.18)] relative
            transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100
            group-focus-within:translate-y-0 group-focus-within:scale-100
            group-focus-within:opacity-100"
        >
          {section.label}
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-text" />
        </span>
      </motion.span>

      {active && (
        <motion.span
          layoutId="dock-active"
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
          className="pointer-events-none absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-red"
        />
      )}
    </motion.li>
  );
}
