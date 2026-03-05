'use client';

import { useState } from 'react';
import type { Geometry } from 'geojson';
import type { PlotFeatureCollection } from '@/components/shared';
import AgroforestryMap from '@/components/AgroforestryMap';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface FlyToTarget {
  longitude: number;
  latitude: number;
  zoom?: number;
}

/** Compute the bounding-box centre of any Polygon or MultiPolygon geometry. */
function getGeometryCenter(geometry: Geometry): FlyToTarget | null {
  let coords: number[][] = [];

  if (geometry.type === 'Polygon') {
    coords = geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    coords = (geometry.coordinates as number[][][][]).flatMap(poly => poly[0]);
  } else {
    return null;
  }

  const lngs = coords.map(c => c[0]);
  const lats = coords.map(c => c[1]);
  return {
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    zoom: 15,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DashboardClientProps {
  plots: PlotFeatureCollection;
}

export default function DashboardClient({ plots }: DashboardClientProps) {
  const [flyToTarget, setFlyToTarget] = useState<FlyToTarget | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handlePlotClick = (index: number) => {
    const feature = plots.features[index];
    if (!feature?.geometry) return;
    const center = getGeometryCenter(feature.geometry);
    if (!center) return;
    setActiveIndex(index);
    setFlyToTarget({ ...center }); // new object every click → always triggers flyTo effect
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* Sidebar                                                           */}
      {/* ---------------------------------------------------------------- */}
      <aside className="hidden md:flex w-64 flex-col gap-4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">
          ข้อมูลแปลง ({plots.features.length} แปลง)
        </h2>
        <ul className="space-y-2">
          {plots.features.map((f, i) => {
            const p = f.properties;
            const isActive = activeIndex === i;
            return (
              <li key={p.plot_code ?? i}>
                <button
                  type="button"
                  onClick={() => handlePlotClick(i)}
                  className={`w-full text-left rounded-md p-3 text-sm transition-colors ${
                    isActive
                      ? 'bg-green-100 dark:bg-green-900/40 ring-1 ring-green-500'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      isActive
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {p.farmer_name ?? p.plot_code ?? `แปลง ${i + 1}`}
                  </p>
                  {p.plot_code != null && (
                    <p className="text-gray-500">รหัส: {p.plot_code}</p>
                  )}
                  {p.area_rai != null && (
                    <p className="text-gray-500">{p.area_rai} ไร่</p>
                  )}
                  {p.elev_mean != null && (
                    <p className="text-gray-500">{p.elev_mean} ม.</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Map — takes up remaining space                                    */}
      {/* ---------------------------------------------------------------- */}
      <main className="flex-1 p-4">
        <div className="h-full min-h-[500px] rounded-xl overflow-hidden shadow">
          <AgroforestryMap plots={plots} flyToTarget={flyToTarget} />
        </div>
      </main>
    </div>
  );
}
