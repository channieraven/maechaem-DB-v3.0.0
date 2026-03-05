"use client";

/**
 * MapComponent — an interactive MapLibre GL JS map centered on Chiang Mai,
 * Thailand.
 *
 * Renders an OpenStreetMap raster base layer and manages a GeoJSON source +
 * two layers (fill + outline) for displaying agroforestry plot polygons
 * fetched from the database.
 *
 * Usage:
 *   import MapComponent from "@/components/Map";
 *   <MapComponent plots={geoJsonFeatureCollection} />
 *
 * Props:
 *   plots — an optional GeoJSON FeatureCollection of plot polygons.
 *           Pass `null` or omit to render the map without any overlays.
 *           The component re-syncs the source data whenever this prop changes.
 */

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection } from "geojson";
import type { GeoJSONSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Geographic centre of Chiang Mai, Thailand (lng, lat — MapLibre order) */
const CHIANG_MAI_CENTER: [number, number] = [98.9853, 18.7883];
const DEFAULT_ZOOM = 10;

/** Internal IDs used for the plots GeoJSON source and its render layers. */
const PLOTS_SOURCE_ID = "plots-source";
const PLOTS_FILL_LAYER_ID = "plots-fill";
const PLOTS_OUTLINE_LAYER_ID = "plots-outline";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MapComponentProps {
  /** GeoJSON FeatureCollection of agroforestry plots to display on the map. */
  plots?: FeatureCollection | null;
}

export default function MapComponent({ plots }: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // ---------------------------------------------------------------------------
  // Initialize the map once on mount; clean up on unmount.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      // OpenStreetMap raster tiles via MapLibre raster tile style syntax.
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: CHIANG_MAI_CENTER,
      zoom: DEFAULT_ZOOM,
      // Disable scroll-wheel zoom to avoid accidentally zooming while
      // scrolling the page.
      scrollZoom: false,
    });

    // Add navigation controls (zoom buttons + compass).
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Sync the `plots` prop into the MapLibre GeoJSON source.
  // Runs after every render where `plots` changes, and also after the map is
  // fully loaded (the `load` event fires asynchronously after init).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    /** Empty FeatureCollection used as a placeholder when `plots` is falsy. */
    const data: FeatureCollection = plots ?? { type: "FeatureCollection", features: [] };

    const applyData = () => {
      // If the source already exists, just update its data.
      if (map.getSource(PLOTS_SOURCE_ID)) {
        (map.getSource(PLOTS_SOURCE_ID) as GeoJSONSource).setData(data);
        return;
      }

      // Otherwise, add the source and layers for the first time.
      map.addSource(PLOTS_SOURCE_ID, { type: "geojson", data });

      // Semi-transparent green fill for each plot polygon.
      map.addLayer({
        id: PLOTS_FILL_LAYER_ID,
        type: "fill",
        source: PLOTS_SOURCE_ID,
        paint: {
          "fill-color": "#52b788",   // light green
          "fill-opacity": 0.35,
        },
      });

      // Dark green outline drawn on top of the fill.
      map.addLayer({
        id: PLOTS_OUTLINE_LAYER_ID,
        type: "line",
        source: PLOTS_SOURCE_ID,
        paint: {
          "line-color": "#2d6a4f",   // dark green
          "line-width": 2,
          "line-opacity": 0.9,
        },
      });

      // Show a popup with plot details when the user clicks a filled polygon.
      map.on("click", PLOTS_FILL_LAYER_ID, (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as {
          name?: string;
          plot_id?: string | number;
          area_rai?: number;
        };
        const title = props.name ?? `Plot ${props.plot_id ?? "?"}`;
        const areaLine =
          props.area_rai != null ? `<p>Area: ${props.area_rai} rai</p>` : "";

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:0.875rem">
               <p style="font-weight:600;margin:0 0 4px">${title}</p>
               ${areaLine}
             </div>`
          )
          .addTo(map);
      });

      // Change the cursor to a pointer when hovering over a plot.
      map.on("mouseenter", PLOTS_FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", PLOTS_FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
    };

    // The map style may not be loaded yet on the very first render.
    if (map.isStyleLoaded()) {
      applyData();
    } else {
      map.once("load", applyData);
    }
  }, [plots]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg overflow-hidden"
      aria-label="Agroforestry map"
    />
  );
}
