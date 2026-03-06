import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// initOpenNextCloudflareForDev() sets up Cloudflare bindings emulation
// (Hyperdrive, R2, KV, etc.) so that `next dev` works like production.
//
// It must NOT run during `next build` — Cloudflare bindings are only
// available at Workers runtime, and the Hyperdrive proxy validation
// causes the build to fail when no local connection string is configured.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((m) =>
    m.initOpenNextCloudflareForDev()
  );
}
