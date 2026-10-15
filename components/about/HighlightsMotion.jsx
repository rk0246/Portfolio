"use client";

import { motion } from "framer-motion";

/*
 * The only client-side pieces of the Highlights timeline. Everything else
 * renders on the server.
 *
 * Reduced motion is handled in CSS (.highlight-reveal in globals.css forces
 * the end state with !important), not with
 * useReducedMotion: that hook reads null on the server, so branching on it
 * would render different markup on each side and trip hydration.
 */

/** One timeline entry: fades in and rises 16px the first time it scrolls into
    view, a little later for each step down the list. */
export function Reveal({ index, className, children }) {
  return (
    <motion.li
      className={`highlight-reveal ${className ?? ""}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: Math.min(index, 4) * 0.06 }}
    >
      {children}
    </motion.li>
  );
}
