import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // ดึงข้อมูลจากฐานข้อมูล โดยใช้ ST_AsGeoJSON() แปลงพิกัดเป็น GeoJSON
    const rows = await sql`
      SELECT
        id,
        farmer_name,
        plot_code,
        group_number,
        area_rai,
        area_sqm,
        tambon,
        elev_mean,
        ST_AsGeoJSON(geom)::json AS geometry
      FROM plot_boundary_plan
      WHERE geom IS NOT NULL;
    `;

    // ประกอบข้อมูลให้อยู่ในรูปแบบ GeoJSON FeatureCollection
    const featureCollection = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        properties: {
          id: row.id,
          farmer_name: row.farmer_name,
          plot_code: row.plot_code,
          group_number: row.group_number,
          area_rai: Number(row.area_rai),
          tambon: row.tambon,
          elev_mean: Number(row.elev_mean),
        },
        geometry: row.geometry,
      })),
    };

    return NextResponse.json(featureCollection);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลแปลงเกษตรได้' },
      { status: 500 }
    );
  }
}
