import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    /**
     * `lucide-react` re-exports ~1,500 icons from its entry file. Next rewrites
     * these barrel imports to direct ones at build time, which keeps dev boot,
     * cold starts and HMR fast without hand-written deep import paths (those
     * lose TypeScript types).
     */
    optimizePackageImports: ["lucide-react"],
    /**
     * Uploads are posted through server actions. The default body cap is 1 MB,
     * so anything larger died with a 500 before the action ran — the branding
     * uploader advertises 2 MB and the media library 5 MB. Raised to cover
     * both, with headroom for multipart framing.
     */
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
