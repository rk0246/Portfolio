"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * A short fade-and-rise on every route change, keyed on the pathname.
 *
 * Enter-only on purpose: exit animations in the App Router mean holding the
 * old tree while the new one streams in, which fights prefetching and stalls
 * the very navigation it's decorating. MotionConfig in the layout drops this
 * to nothing under prefers-reduced-motion.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
