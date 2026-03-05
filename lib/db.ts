/**
 * Database connection utility using Neon Serverless Postgres.
 *
 * Required environment variable:
 *   DATABASE_URL — your Neon connection string (with ?sslmode=require)
 *   Set in .env.local (never commit this file).
 */

import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Lazily-initialized Neon query helper.
 *
 * The connection string is resolved only on the first query, so the build
 * succeeds even without DATABASE_URL in the environment. A clear error is
 * thrown at query time if the variable is missing.
 *
 * Usage:
 *   import { sql } from "@/lib/db";
 *   const rows = await sql`SELECT * FROM profiles WHERE user_id = ${userId}`;
 */
let _sql: NeonQueryFunction<false, false> | null = null;

export function sql(...args: Parameters<NeonQueryFunction<false, false>>) {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "Missing environment variable: DATABASE_URL. " +
          "Add it to .env.local (see .env.local.example)."
      );
    }
    _sql = neon(url);
  }
  return _sql(...args);
}
