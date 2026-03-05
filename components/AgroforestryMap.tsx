'use client';

import { useState, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// 🎨 ตั้งค่าสไตล์ของ Layer แปลงเกษตร (defined outside component to avoid re-creation on every render)
const polygonLayerStyle = {
  id: 'plots-layer',
  type: 'fill' as const,
  paint: {
    'fill-color': '#22c55e', // สีเขียว Tailwind
    'fill-opacity': 0.4,
    'fill-outline-color': '#166534',
  },
};

export default function AgroforestryMap() {
  // ตั้งค่ามุมกล้องเริ่มต้น (พิกัดแม่แจ่ม เชียงใหม่)
  const [viewState, setViewState] = useState({
    longitude: 98.3615,
    latitude: 18.5262,
    zoom: 13,
    pitch: 45, // เอียงกล้อง 45 องศา (เตรียมโชว์ 3D ถ้ามีข้อมูล DEM)
  });

  // 📝 ตัวอย่างข้อมูล GeoJSON ของแปลงวนเกษตร (Polygon)
  // ของจริงตรงนี้เราจะ Fetch มาจาก API ที่ต่อกับ Neon Database (PostGIS)
  const plotsGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { plot_code: 'MC-01', owner: 'ลุงสมชาย' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [98.360, 18.525],
              [98.365, 18.525],
              [98.365, 18.530],
              [98.360, 18.530],
              [98.360, 18.525],
            ],
          ],
        },
      },
    ],
  }), []);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        // ใช้ Base Map ฟรีจาก CartoDB (สไตล์สว่างๆ คลีนๆ ไม่ต้องใช้ API Key)
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactive={true}
      >
        {/* 🗺️ โครงสร้างแบบ MapLibre: ต้องมี Source (ข้อมูล) แล้วเอา Layer (หน้าตา) มาครอบ */}
        <Source id="plots-source" type="geojson" data={plotsGeoJSON}>
          <Layer {...polygonLayerStyle} />
        </Source>
      </Map>
    </div>
  );
}
