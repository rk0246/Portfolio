"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

/** Tiles render without a trailing period, whatever the data carries. */
const stem = (text) => text.replace(/\.+\s*$/, "");

const SPAN = {
  sm: "lg:col-span-4",
  md: "lg:col-span-6",
  lg: "sm:col-span-2 lg:col-span-8",
};

/* ---- per-tile decorations (all aria-hidden, none carry content) ---- */

/** Five bars that bounce while the tile is on screen or hovered. */
function Equalizer() {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <span ref={ref} aria-hidden="true" className="eq" data-on={inView}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ "--i": i }} />
      ))}
    </span>
  );
}

/** A fanned deck of card backs in the corner; fans wider on hover. */
function Deck() {
  return (
    <span aria-hidden="true" className="deck">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ "--i": i }} />
      ))}
    </span>
  );
}

/** Three small prints in the corner, like the Highlights photos; fan on hover. */
function Prints() {
  return (
    <span aria-hidden="true" className="mini-prints">
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ "--i": i }} />
      ))}
    </span>
  );
}

const corner = { cardistry: <Deck />, photography: <Prints /> };

/** Chip styles per tile: Gaming's lift on hover, Sports' arrive one by one. */
function Chips({ id, chips, light }) {
  const base = `rounded-full border px-2.5 py-0.5 type-ui text-[13px] ${
    light ? "border-white/40 text-white/90" : "border-border text-muted"
  }`;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {chips.map((chip, i) =>
        id === "sports" ? (
          <motion.li
            key={chip}
            className={`${base} interest-reveal`}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.35, delay: 0.25 + i * 0.12 }}
          >
            {chip}
          </motion.li>
        ) : (
          <li
            key={chip}
            className={`${base} ${id === "gaming" ? "chip-lift" : ""}`}
            style={id === "gaming" ? { transitionDelay: `${i * 50}ms` } : undefined}
          >
            {chip}
          </li>
        ),
      )}
    </ul>
  );
}

export default function InterestTile({ item, index }) {
  const image = item.image;
  const deco = corner[item.id];

  const body = (
    <>
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />
        </>
      )}

      {deco}

      <div
        className={`relative flex h-full flex-col ${image ? "justify-end text-white" : ""} ${
          deco ? "pr-24" : ""
        }`}
      >
        <h3 className="type-heading">
          {stem(item.title)}
        </h3>
        <p
          className={`mt-1.5 max-w-[48ch] type-body ${image ? "text-white/85" : ""}`}
        >
          {item.line}
        </p>

        {item.now && (
          <p
            className={`mt-4 flex items-center gap-2 type-data ${
              image ? "text-white/85" : ""
            }`}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-red" />
            <span className={item.id === "tech" ? "caret" : undefined}>
              {item.now}
            </span>
            {item.id === "audiophile" && <Equalizer />}
          </p>
        )}

        {item.chips?.length > 0 && (
          <Chips id={item.id} chips={item.chips} light={Boolean(image)} />
        )}

        {item.href && (
          <span
            className={`mt-auto pt-4 type-ui ${image ? "" : "text-text"}`}
          >
            See more <span aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </>
  );

  const tileClass =
    "interest-tile relative block h-full min-h-44 overflow-hidden rounded-2xl border border-border p-6";

  return (
    <motion.li
      className={`interest-reveal ${SPAN[item.size]}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: index * 0.06 }}
    >
      {item.href ? (
        <Link href={item.href} className={tileClass}>
          {body}
        </Link>
      ) : (
        <div className={tileClass}>{body}</div>
      )}
    </motion.li>
  );
}
