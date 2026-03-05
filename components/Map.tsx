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

/** Geographic centre of Mae Chaem, Thailand (lng, lat — MapLibre order) */
const MAE_CHAEM_CENTER: [number, number] = [98.39, 18.53];
const DEFAULT_ZOOM = 11;

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
      // ESRI World Imagery satellite tiles via MapLibre raster tile style syntax.
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "satellite-tiles",
            type: "raster",
            source: "satellite",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: MAE_CHAEM_CENTER,
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
          farmer_name?: string;
          plot_code?: string | number;
          group_number?: string | number;
          area_rai?: number;
          area_sqm?: number;
          tambon?: string;
          elev_mean?: number;
        };
        const title = props.farmer_name ?? `แปลง ${props.plot_code ?? "?"}`;
        const lines = [
          props.plot_code != null ? `<p>รหัสแปลง: ${props.plot_code}</p>` : "",
          props.group_number != null ? `<p>กลุ่มที่: ${props.group_number}</p>` : "",
          props.area_rai != null ? `<p>พื้นที่: ${props.area_rai} ไร่</p>` : "",
          props.area_sqm != null
            ? `<p>พื้นที่: ${Number(props.area_sqm).toLocaleString()} ตร.ม.</p>`
            : "",
          props.tambon != null ? `<p>ตำบล: ${props.tambon}</p>` : "",
          props.elev_mean != null ? `<p>ความสูงเฉลี่ย: ${props.elev_mean} ม.</p>` : "",
        ].join("");

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="font-size:0.875rem">
               <p style="font-weight:600;margin:0 0 4px">${title}</p>
               ${lines}
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
