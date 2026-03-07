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
  const { userId } = await auth();

  let plots: PlotFeatureCollection = { type: "FeatureCollection", features: [] };
  try {
    plots = await fetchPlots();
  } catch {
    // If the query fails, render the map with an empty feature collection.
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3 shadow-sm">
        <span className="font-semibold text-gray-800 text-base">
          Dashboard
        </span>
        <span className="text-sm text-gray-400 hidden sm:inline">
          {userId}
        </span>
      </header>

      {/* Content (sidebar + map via Client Component) */}
      <DashboardClient plots={plots} />
    </div>
  );
}
