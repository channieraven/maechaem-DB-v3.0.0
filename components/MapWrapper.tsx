"use client";

/**
 * MapWrapper — client-side wrapper that dynamically imports MapComponent.
 *
 * `next/dynamic` with `ssr: false` must live in a Client Component when used
 * inside Next.js App Router Server Components. This thin wrapper satisfies
 * that constraint while keeping the heavy MapLibre GL bundle out of the
 * server bundle entirely.
 */

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type MapComponent from "./Map";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
      กำลังโหลดแผนที่…
    </div>
  ),
});

type MapProps = ComponentProps<typeof MapComponent>;

export default function MapWrapper(props: MapProps) {
  return <Map {...props} />;
}
