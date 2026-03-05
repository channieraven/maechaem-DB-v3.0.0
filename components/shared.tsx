import type { FeatureCollection, Geometry } from "geojson";

export interface PlotProperties {
  farmer_name: string;
  plot_code: string;
  area_rai: number;
  area_sqm: number;
  tambon: string;
  elev_mean: number;
}

export type PlotFeatureCollection = FeatureCollection<Geometry, PlotProperties>;