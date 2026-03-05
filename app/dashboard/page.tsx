/**
 * Dashboard page — protected by Clerk middleware.
 *
 * Renders a full-viewport map using MapLibre GL JS alongside a sidebar
 * for plot statistics. In production, replace the `SAMPLE_PLOTS` constant
 * with a real fetch from your Next.js API route that queries the Neon DB.
 */

import { auth } from "@clerk/nextjs/server";
import type { FeatureCollection } from "geojson";
import MapWrapper from "@/components/MapWrapper";

// ---------------------------------------------------------------------------
// Sample data — replace with a real DB query in production.
// ---------------------------------------------------------------------------
const SAMPLE_PLOTS: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "แปลง A-01", plot_id: "A-01", area_rai: 5.2 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [98.42, 18.49],
            [98.43, 18.49],
            [98.43, 18.50],
            [98.42, 18.50],
            [98.42, 18.49],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "แปลง B-03", plot_id: "B-03", area_rai: 3.8 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [98.44, 18.51],
            [98.455, 18.51],
            [98.455, 18.52],
            [98.44, 18.52],
            [98.44, 18.51],
          ],
        ],
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  // Clerk auth() returns the current session. The middleware already
  // redirects unauthenticated users, so userId is always defined here.
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* ------------------------------------------------------------------ */}
      {/* Top bar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 shadow-sm">
        <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
          Dashboard
        </span>
        <span className="text-sm text-gray-500 hidden sm:inline">
          User: {userId}
        </span>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">
            ข้อมูลแปลง
          </h2>
          <ul className="space-y-2">
            {SAMPLE_PLOTS.features.map((f) => {
              const p = f.properties as {
                name?: string;
                plot_id?: string;
                area_rai?: number;
              };
              return (
                <li
                  key={p.plot_id}
                  className="rounded-md bg-gray-50 dark:bg-gray-800 p-3 text-sm"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {p.name ?? p.plot_id}
                  </p>
                  {p.area_rai != null && (
                    <p className="text-gray-500">{p.area_rai} ไร่</p>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Map — takes up remaining space */}
        <main className="flex-1 p-4">
          <div className="h-full min-h-[500px] rounded-xl overflow-hidden shadow">
            <MapWrapper plots={SAMPLE_PLOTS} />
          </div>
        </main>
      </div>
    </div>
  );
}
