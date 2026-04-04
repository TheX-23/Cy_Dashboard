"use client";

import dynamic from "next/dynamic";
import type { ThreatMapViewProps } from "./ThreatMapView";

const ThreatMapView = dynamic(() => import("./ThreatMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-muted transition-theme">
      <div className="text-muted-foreground">Loading map…</div>
    </div>
  ),
});

export type { ThreatLocation, AttackLine } from "./ThreatMapView";

/**
 * Threat map entry point: loads Leaflet only on the client (avoids SSR/hydration issues)
 * and keeps MapContainer in a dynamically imported subtree (more reliable with Turbopack + Strict Mode).
 */
export default function ThreatMap(props: ThreatMapViewProps) {
  return <ThreatMapView {...props} />;
}
