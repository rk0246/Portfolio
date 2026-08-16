"use client";

import { useState } from "react";
import Icon from "./Icon";

/**
 * Click-to-load YouTube facade.
 *
 * Nothing from youtube.com is requested until the user actually asks for the
 * video — a real embed is ~1MB of third-party JS per player, which would sink
 * this page's Lighthouse score for content most visitors never press play on.
 * Thumbnails come straight from i.ytimg.com via a plain <img> (no next/image
 * remote-pattern config needed), and a 404 falls back to the gray placeholder.
 */
export default function VideoEmbed({ id, title, priority = false }) {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-fill">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
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
          {!thumbFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt=""
              loading={priority ? "eager" : "lazy"}
              onError={() => setThumbFailed(true)}
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
