'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Source, Layer, Popup, MapMouseEvent } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { PlotFeatureCollection } from "@/components/shared";

/**
 * Mapbox tileset overlay — a custom raster layer uploaded via Mapbox Studio
 * (e.g. a land-use / DEM GeoTIFF) rendered on top of the satellite base map.
 * Values come from environment variables so the token and tileset ID can be
 * changed without touching source code.  The public token (pk.*) is safe to
 * expose in the browser.
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const MAPBOX_TILESET_ID = process.env.NEXT_PUBLIC_MAPBOX_TILESET_ID ?? "";

// 🛰️ Satellite base map using Esri World Imagery raster tiles
const SATELLITE_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxzoom: 19,
    },
    ...(MAPBOX_TOKEN && MAPBOX_TILESET_ID
      ? {
          'mapbox-overlay': {
            type: 'raster' as const,
            tiles: [
              `https://api.mapbox.com/v4/${MAPBOX_TILESET_ID}/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`,
            ],
            tileSize: 256,
            attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a>",
            maxzoom: 22,
          },
        }
      : {}),
  },
  layers: [
    {
      id: 'satellite-tiles',
      type: 'raster',
      source: 'satellite',
      minzoom: 0,
      maxzoom: 19,
    },
    ...(MAPBOX_TOKEN && MAPBOX_TILESET_ID
      ? [
          {
            id: 'mapbox-overlay-tiles',
            type: 'raster' as const,
            source: 'mapbox-overlay',
            minzoom: 0,
            maxzoom: 22,
            paint: { 'raster-opacity': 0.7 },
          },
        ]
      : []),
  ],
};

// 🎨 ตั้งค่าสไตล์ของ Layer แปลงเกษตร (defined outside component to avoid re-creation on every render)
const polygonLayerStyle = {
  id: 'plots-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': '#22c55e',
    'fill-opacity': 0.5,
  },
};

const polygonOutlineStyle = {
  id: 'plots-outline',
  type: 'line' as const,
  paint: {
    'line-color': '#166534',
    'line-width': 2,
  },
};

interface PopupInfo {
  longitude: number;
  latitude: number;
  farmer_name: string;
  plot_code: string;
  area_rai: number;
  area_sqm: number;
  tambon: string;
  elev_mean: number | null;
}

interface AgroforestryMapProps {
  plots?: PlotFeatureCollection | null;
  flyToTarget?: { longitude: number; latitude: number; zoom?: number } | null;
}

export default function AgroforestryMap({ plots, flyToTarget }: AgroforestryMapProps) {
  // State สำหรับเก็บข้อมูล GeoJSON ที่โหลดมา
  const [plotsData, setPlotsData] = useState<PlotFeatureCollection | null>(plots ?? null);
  const [loading, setLoading] = useState(!plots);
  const [error, setError] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const mapRef = useRef<MapRef>(null);

  // ตั้งค่ามุมกล้องไปที่อำเภอแม่แจ่ม
  const [viewState, setViewState] = useState({
    longitude: 98.39,
    latitude: 18.53,
    zoom: 11,
    pitch: 0,
  });

  // ดึงข้อมูลตอนที่ Component โหลดครั้งแรก
  useEffect(() => {
    if (plots) {
      setPlotsData(plots);
      setLoading(false);
      return;
    }

    const fetchPlots = async () => {
      try {
        const response = await fetch('/api/plots');
        const data = await response.json();
        setPlotsData(data);
      } catch (err) {
        console.error('Error loading map data:', err);
        setError('ไม่สามารถโหลดข้อมูลแผนที่ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, [plots]);

  // บินกล้องไปยังแปลงที่เลือกจาก Sidebar
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTarget.longitude, flyToTarget.latitude],
      zoom: flyToTarget.zoom ?? 15,
      duration: 1500,
    });
  }, [flyToTarget]);

  // แสดง Popup เมื่อคลิกที่แปลง
  const onMapClick = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature || !feature.properties) {
      setPopupInfo(null);
      return;
    }
    setPopupInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      farmer_name: feature.properties.farmer_name ?? '-',
      plot_code: feature.properties.plot_code ?? '-',
      area_rai: feature.properties.area_rai ?? 0,
      area_sqm: feature.properties.area_sqm ?? 0,
      tambon: feature.properties.tambon ?? '-',
      elev_mean: feature.properties.elev_mean ?? null,
    });
  }, []);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <span className="text-gray-600">กำลังโหลดข้อมูลแผนที่...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <span className="text-red-600">{error}</span>
        </div>
      )}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={SATELLITE_MAP_STYLE}
        interactive={true}
        interactiveLayerIds={[polygonLayerStyle.id]}
        onClick={onMapClick}
        cursor="pointer"
      >
        {plotsData && (
          <Source id="plots-source" type="geojson" data={plotsData}>
            <Layer {...polygonLayerStyle} />
            <Layer {...polygonOutlineStyle} />
          </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
          >
            <div className="p-2 text-sm">
              <p className="font-semibold text-gray-800">เจ้าของแปลง: {popupInfo.farmer_name}</p>
              <p className="text-gray-600">รหัสแปลง: {popupInfo.plot_code}</p>
              <p className="text-gray-600">ขนาดพื้นที่: {popupInfo.area_rai} ไร่</p>
              {popupInfo.elev_mean != null && (
                <p className="text-gray-600">ความสูงเฉลี่ย: {popupInfo.elev_mean} เมตรเหนือระดับน้ำทะเล</p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
