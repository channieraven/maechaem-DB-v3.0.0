import { NextResponse } from 'next/server';
import { fetchPlots } from '@/lib/plots';

export async function GET() {
  try {
    const featureCollection = await fetchPlots();
    return NextResponse.json(featureCollection);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลแปลงเกษตรได้' },
      { status: 500 }
    );
  }
}
