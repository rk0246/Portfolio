/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Photography comes from the Unsplash API, which requires that the image
    // URLs it returns are hotlinked rather than copied. urls.regular always
    // lives on this host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],

    // The remaining stand-in artwork in public/images (projects, portrait) is
    // SVG, and next/image refuses to optimize SVG unless this is on. These are
    // first-party files we authored, and the two settings below are the
    // documented hardening: served as a download rather than inline, under a
    // CSP that forbids scripts.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
