/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // The stand-in artwork in public/images is SVG, and next/image refuses to
    // optimize SVG unless this is on. These are first-party files we authored,
    // and the two settings below are the documented hardening: served as a
    // download rather than inline, under a CSP that forbids scripts.
    // Once real photos replace the placeholders, this block can go.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
