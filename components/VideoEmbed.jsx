"use client";

import { useState } from "react";
import Icon from "./Icon";

/**
 * Click-to-load YouTube facade.
 *
 * Nothing from youtube.com is requested until the user actually asks for the
 * video — a real embed is roughly a megabyte of third-party JS *per player*,
 * and this page shows several at once, so eager iframes would cost multiple MB
 * to render content most visitors never press play on. Until then it is one
 * static JPEG.
 *
 * Thumbnails come from img.youtube.com via a plain <img>, deliberately not
 * next/image: that would need a remotePattern entry and would route every
 * thumbnail through our own optimiser to re-compress a file YouTube already
 * serves at the right size.
 */

/* maxresdefault only exists for videos uploaded at 1080p+ — older or SD
   uploads 404 on it. Walk down to hqdefault, which YouTube generates for
   every video; past the end of the list the bg-fill placeholder shows. */
const THUMB_SIZES = ["maxresdefault", "hqdefault"];

export default function VideoEmbed({ id, title, priority = false }) {
  const [playing, setPlaying] = useState(false);
  const [sizeStep, setSizeStep] = useState(0);

  const thumbSize = THUMB_SIZES[sizeStep];

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-fill">
      {playing ? (
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          {thumbSize && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://img.youtube.com/vi/${id}/${thumbSize}.jpg`}
              alt=""
              loading={priority ? "eager" : "lazy"}
              onError={() => setSizeStep((step) => step + 1)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <span
            className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2
              items-center justify-center rounded-full bg-red text-white shadow-lg
              transition-transform duration-250 ease-[var(--ease-tile)] group-hover:scale-110"
          >
            <Icon name="play" size={26} filled className="ml-1" />
          </span>
        </button>
      )}
    </div>
  );
}
