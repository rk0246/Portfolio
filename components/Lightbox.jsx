"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./Icon";

/**
 * Full-screen view of one photo, with its settings spelled out.
 *
 * The grid's hover overlay is deliberately terse — three numbers, no labels.
 * Here there is room to say which number is which, and to show the location,
 * which the grid only exposes as a filter chip.
 *
 * Keyboard: Escape closes, ← / → move between photos. Focus moves into the
 * dialog on open and returns to the thumbnail that opened it on close, so
 * tabbing does not dump you back at the top of the page.
 */
export default function Lightbox({ photos, index, onClose, onIndex }) {
  const open = index != null;
  const photo = open ? photos[index] : null;
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  const next = useCallback(() => onIndex((index + 1) % photos.length), [index, photos.length, onIndex]);
  const prev = useCallback(() => onIndex((index - 1 + photos.length) % photos.length), [index, photos.length, onIndex]);

  // Scroll lock and focus, keyed on open/closed ALONE. Folding the key handler
  // in here would re-run this on every arrow press — tearing down and rebuilding
  // the lock, and bouncing focus to the thumbnail behind the overlay and back.
  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement;
    dialogRef.current?.focus();

    // The page behind must not scroll under the overlay. Compensating for the
    // scrollbar's width keeps the layout from jumping as it disappears.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      returnFocusRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, next, prev]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={photo.caption || photo.alt || "Photograph"}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          // Backdrop click closes; clicks on the figure below stop propagating.
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4
            bg-bg/95 p-4 backdrop-blur-sm outline-none sm:p-8"
        >
          <div className="absolute right-3 top-3 flex items-center gap-1 sm:right-5 sm:top-5">
            <span className="mr-2 font-mono text-xs tabular-nums text-muted">
              {index + 1} / {photos.length}
            </span>
            <Control label="Close" onClick={onClose} icon="close" />
          </div>

          {photos.length > 1 && (
            <>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 sm:left-5">
                <Control label="Previous photo" onClick={prev} icon="arrowLeft" />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 sm:right-5">
                <Control label="Next photo" onClick={next} icon="arrowRight" />
              </div>
            </>
          )}

          <motion.figure
            key={photo.id ?? photo.src}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full min-h-0 max-w-5xl flex-col items-center gap-4"
          >
            {/* unoptimized on purpose. The URL already carries the width,
                quality and auto=format we want, so routing it through the Next
                optimizer would decode and re-encode an image the CDN has
                already sized — latency and cost for no fewer bytes. It also
                keeps this the *same* URL PhotoFrame preloads on hover, so the
                click lands on a warm cache entry instead of a near-miss. */}
            <Image
              src={photo.full ?? photo.src}
              alt={photo.alt}
              width={photo.fullWidth ?? photo.width}
              height={photo.fullHeight ?? photo.height}
              placeholder={photo.blurDataURL ? "blur" : "empty"}
              blurDataURL={photo.blurDataURL}
              className="max-h-[70vh] w-auto rounded-lg object-contain"
              unoptimized
              priority
            />
            <Meta photo={photo} />
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The settings, labelled — this is the whole reason the bigger view exists. */
function Meta({ photo }) {
  const exif = photo.exif ?? {};
  const stats = [
    ["Aperture", exif.aperture],
    ["Shutter", exif.shutter],
    ["ISO", exif.iso],
  ].filter(([, value]) => Boolean(value));

  const hasAnything = stats.length > 0 || photo.locationName || photo.caption || exif.camera;
  if (!hasAnything) return null;

  return (
    <figcaption className="flex w-full flex-col items-center gap-2.5 text-center">
      {photo.caption && <p className="text-sm">{photo.caption}</p>}

      {stats.length > 0 && (
        <dl className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5">
          {stats.map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
              <dd className="font-mono text-sm tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(photo.locationName || exif.camera) && (
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
          {photo.locationName && (
            <span className="inline-flex items-center gap-1">
              <Icon name="pin" size={12} />
              {photo.locationName}
            </span>
          )}
          {exif.camera && <span>{[exif.camera, exif.focal].filter(Boolean).join(" · ")}</span>}
        </p>
      )}
    </figcaption>
  );
}

function Control({ label, onClick, icon }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border
        bg-surface/80 text-text/70 backdrop-blur transition-colors
        hover:border-red hover:text-red"
    >
      <Icon name={icon} size={18} />
    </button>
  );
}
