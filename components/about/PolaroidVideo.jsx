/**
 * A video styled like PolaroidImage: the same paper frame, tape, tilt and
 * caption, with the clip itself inside. It shows its poster frame until played
 * and loads only metadata up front, so a page of clips stays light. Starts
 * muted; the native controls unmute it, and bring keyboard and screen-reader
 * support with them.
 *
 * `aria-label` carries the description, since <video> has no alt.
 */
export default function PolaroidVideo({ video, tilt }) {
  return (
    <figure className="polaroid" style={{ "--tilt": `${tilt}deg` }}>
      <span aria-hidden="true" className="polaroid-tape" />
      <video
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        controls
        muted
        playsInline
        preload="metadata"
        aria-label={video.alt}
        className="block h-auto w-full bg-black"
      />
      {video.caption && (
        <figcaption className="polaroid-caption">{video.caption}</figcaption>
      )}
    </figure>
  );
}
