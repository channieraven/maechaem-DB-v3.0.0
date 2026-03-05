'use client';

import { useState, useEffect, useCallback } from 'react';
import Map, { Source, Layer, Popup, MapMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { PlotFeatureCollection } from "@/components/shared";

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
}

interface AgroforestryMapProps {
  plots?: PlotFeatureCollection | null;
}

export default function AgroforestryMap({ plots }: AgroforestryMapProps) {
  // State สำหรับเก็บข้อมูล GeoJSON ที่โหลดมา
  const [plotsData, setPlotsData] = useState<PlotFeatureCollection | null>(plots ?? null);
  const [loading, setLoading] = useState(!plots);
  const [error, setError] = useState<string | null>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

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
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
              <p className="font-semibold text-gray-800">{popupInfo.farmer_name}</p>
              <p className="text-gray-600">รหัสแปลง: {popupInfo.plot_code}</p>
              <p className="text-gray-600">พื้นที่: {popupInfo.area_rai} ไร่</p>
              <p className="text-gray-600">พื้นที่: {popupInfo.area_sqm.toLocaleString()} ตร.ม.</p>
              <p className="text-gray-600">ตำบล: {popupInfo.tambon}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
