import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. เชื่อมต่อกับ Neon Database ด้วย URL จากไฟล์ .env.local
    const sql = neon(process.env.DATABASE_URL!);

    // 2. ดึงข้อมูลจากฐานข้อมูล
    // ใช้ ST_AsGeoJSON() ให้ PostGIS แปลงพิกัดเป็น GeoJSON โดยตรง
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

    // 3. จัดข้อมูลให้อยู่ในรูปแบบ FeatureCollection
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
          area_sqm: Number(row.area_sqm),
          tambon: row.tambon,
          elev_mean: Number(row.elev_mean),
        },
        geometry: JSON.parse(row.geometry),
      })),
    };

    // 4. ส่งข้อมูลกลับไปให้หน้าเว็บ
    return NextResponse.json(featureCollection);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลแปลงเกษตรได้' },
      { status: 500 }
    );
  }
}
