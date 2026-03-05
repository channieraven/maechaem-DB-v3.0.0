/**
 * Dashboard page — protected by Clerk middleware.
 *
 * Renders a full-viewport map using MapLibre GL JS alongside a sidebar
 * for plot statistics. Plot data is fetched directly from the Neon DB
 * (no internal HTTP round-trip needed).
 */

import { auth } from "@clerk/nextjs/server";
import AgroforestryMap from "@/components/AgroforestryMap";
import { fetchPlots } from "@/lib/plots";
import type { PlotFeatureCollection } from "@/components/shared";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  // Clerk auth() returns the current session. The middleware already
  // redirects unauthenticated users, so userId is always defined here.
  const { userId } = await auth();

  // Fetch plot data directly from the database (no internal HTTP round-trip).
  let plots: PlotFeatureCollection = { type: "FeatureCollection", features: [] };
  try {
    plots = await fetchPlots();
  } catch {
    // If the query fails, render the map with an empty feature collection.
  }

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
            ข้อมูลแปลง ({plots.features.length} แปลง)
          </h2>
          <ul className="space-y-2">
            {plots.features.map((f, i) => {
              const p = f.properties as {
                id?: number;
                farmer_name?: string;
                plot_code?: string;
                group_number?: string | number;
                area_rai?: number;
                area_sqm?: number;
                tambon?: string;
                elev_mean?: number;
              };
              return (
                <li
                  key={p.plot_code ?? p.id ?? i}
                  className="rounded-md bg-gray-50 dark:bg-gray-800 p-3 text-sm"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {p.farmer_name ?? p.plot_code ?? `แปลง ${i + 1}`}
                  </p>
                  {p.plot_code != null && (
                    <p className="text-gray-500">รหัส: {p.plot_code}</p>
                  )}
                  {p.group_number != null && (
                    <p className="text-gray-500">กลุ่ม: {p.group_number}</p>
                  )}
                  {p.area_rai != null && (
                    <p className="text-gray-500">{p.area_rai} ไร่</p>
                  )}
                  {p.area_sqm != null && (
                    <p className="text-gray-500">{p.area_sqm.toLocaleString()} ตร.ม.</p>
                  )}
                  {p.tambon != null && (
                    <p className="text-gray-500">ต.{p.tambon}</p>
                  )}
                  {p.elev_mean != null && (
                    <p className="text-gray-500">{p.elev_mean} ม.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Map — takes up remaining space */}
        <main className="flex-1 p-4">
          <div className="h-full min-h-[500px] rounded-xl overflow-hidden shadow">
            <AgroforestryMap plots={plots} />
          </div>
        </main>
      </div>
    </div>
  );
}
