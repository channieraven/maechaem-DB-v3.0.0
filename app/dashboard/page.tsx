/**
 * Dashboard page — protected by Clerk middleware.
 *
 * Renders a full-viewport map using MapLibre GL JS alongside a sidebar
 * for plot statistics. Plot data is fetched directly from the Neon DB
 * (no internal HTTP round-trip needed).
 */

import { auth } from "@clerk/nextjs/server";
import DashboardClient from "@/components/DashboardClient";
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
      {/* Content (sidebar + map via Client Component)                       */}
      {/* ------------------------------------------------------------------ */}
      <DashboardClient plots={plots} />
    </div>
  );
}
