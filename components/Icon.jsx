/**
 * Hand-rolled 24×24 stroke icons — a whole icon dependency isn't worth it for
 * a dozen glyphs. Every path inherits currentColor, so colour is a text-* class.
 */
const paths = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.4V19a2 2 0 0 0 2 2H10v-6h4v6h2.5a2 2 0 0 0 2-2V9.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h2.8l1.4-2.2h7.6L17.2 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.4" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.4 9.6v4.8L14.8 12Z" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.2 21 8l-9 4.8L3 8Z" />
      <path d="m3 12.6 9 4.8 9-4.8" />
      <path d="m3 17 9 4.8L21 17" />
    </>
  ),
  mail: (
    <>
      <rect x="2.8" y="5" width="18.4" height="14" rx="2" />
      <path d="m3.5 7 8.5 5.8L20.5 7" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20.5 14.6A8.7 8.7 0 0 1 9.4 3.5a8.7 8.7 0 1 0 11.1 11.1Z" />,
  sound: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4Z" />
      <path d="M15.6 9.4a3.6 3.6 0 0 1 0 5.2M18.2 6.8a7.3 7.3 0 0 1 0 10.4" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4Z" />
      <path d="m16.2 9.8 4.4 4.4M20.6 9.8l-4.4 4.4" />
    </>
  ),
  arrowUpRight: <path d="M7 17 17 7M9 7h8v8" />,
  arrowLeft: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  download: <path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 19.5h15" />,
  play: <path d="M8.5 5.6 19 12 8.5 18.4Z" />,
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
};

export default function Icon({ name, size = 20, className = "", filled = false }) {
  const d = paths[name];
  if (!d) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {d}
    </svg>
  );
}
