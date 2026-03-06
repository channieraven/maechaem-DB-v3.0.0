/**
 * Database connection utility for Neon Serverless Postgres.
 *
 * Connection priority (resolved lazily on the first query):
 *   1. Cloudflare Hyperdrive — when running inside a Cloudflare Worker (production).
 *      Hyperdrive pools and caches connections at the edge for lower latency.
 *   2. DATABASE_URL env var  — for local development (`next dev`) and CI builds.
 *      Set this in .env.local (see .env.local.example).
 *
 * Usage:
 *   import { sql } from "@/lib/db";
 *   const rows = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
 */

import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Minimal shape of a Cloudflare Hyperdrive binding. */
interface HyperdriveBinding {
  readonly connectionString: string;
}

/** Shape of the Cloudflare Workers env that this app uses. */
interface AppEnv {
  HYPERDRIVE?: HyperdriveBinding;
}

/**
 * Lazily-initialized Neon query helper.
 *
 * The connection string is resolved only on the first query so the build
 * succeeds even without DATABASE_URL in the environment (static pages that
 * call the DB are wrapped in try/catch). A clear error is thrown at query
 * time if no connection is available.
 */
let _sql: NeonQueryFunction<false, false> | null = null;

function getConnectionString(): string {
  // In Cloudflare Workers (production), use Hyperdrive for connection pooling.
  // getCloudflareContext() throws when called outside a Workers request context
  // (e.g. during `next build` static pre-rendering), so we catch that here and
  // fall through to DATABASE_URL instead of crashing the build.
  try {
    const { env } = getCloudflareContext<Record<string, unknown>>() as { env: AppEnv };
    if (env.HYPERDRIVE?.connectionString) {
      return env.HYPERDRIVE.connectionString;
    }
  } catch {
    // Not in a Cloudflare Workers request context — fall through to DATABASE_URL.
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Missing database connection. In production the HYPERDRIVE binding must " +
        "be configured in wrangler.jsonc. For local dev set DATABASE_URL in " +
        ".env.local (see .env.local.example)."
    );
  }
  return url;
}

export function sql(...args: Parameters<NeonQueryFunction<false, false>>) {
  if (!_sql) {
    _sql = neon(getConnectionString());
  }
  return _sql(...args);
}
