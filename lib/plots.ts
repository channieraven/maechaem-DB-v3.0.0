/**
 * Shared data-access helper for agroforestry plot data.
 *
 * Used by both the /api/plots API route and the dashboard server component so
 * that we never need an internal HTTP round-trip to fetch plot geometries.
 */

// sql is the lazily-initialised Neon Serverless Postgres query helper defined
// in lib/db.ts. It uses the DATABASE_URL environment variable at query time.
import { sql } from "@/lib/db";
import type { PlotFeatureCollection } from "@/components/shared";

export async function fetchPlots(): Promise<PlotFeatureCollection> {
  const rows = await sql`
    SELECT
      id,
      farmer_name,
      plot_code,
      group_number,
      area_rai,
      area_sqm,
      tambon,
      elev_mean,
      ST_AsGeoJSON(geom)::json AS geometry
    FROM plot_boundary_plan
    WHERE geom IS NOT NULL
    ORDER BY plot_code;
  `;

  return {
    type: "FeatureCollection",
    features: rows.map((row) => ({
      type: "Feature",
      properties: {
        id: row.id,
        farmer_name: row.farmer_name,
        plot_code: row.plot_code,
        group_number: row.group_number,
        area_rai: Number(row.area_rai),
        area_sqm: Number(row.area_sqm),
        tambon: row.tambon,
        elev_mean: Number(row.elev_mean),
      },
      geometry: row.geometry,
    })),
  };
}
