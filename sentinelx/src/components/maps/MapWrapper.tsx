"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import ThreatMap from "./ThreatMap";
import type { ThreatLocation } from "./ThreatMap";
import apiClient from "@/lib/api-client";

interface ThreatMapApiItem {
  country: string;
  threats: number;
  severity: "critical" | "high" | "medium" | "low";
}

const COUNTRY_COORDS: Record<string, { lat: number; lng: number; city: string }> = {
  "United States": { lat: 40.7128, lng: -74.006, city: "New York" },
  USA: { lat: 40.7128, lng: -74.006, city: "New York" },
  Russia: { lat: 55.7558, lng: 37.6173, city: "Moscow" },
  China: { lat: 39.9042, lng: 116.4074, city: "Beijing" },
  Iran: { lat: 35.6892, lng: 51.389, city: "Tehran" },
  Germany: { lat: 52.52, lng: 13.405, city: "Berlin" },
  "United Kingdom": { lat: 51.5074, lng: -0.1278, city: "London" },
  UK: { lat: 51.5074, lng: -0.1278, city: "London" },
  France: { lat: 48.8566, lng: 2.3522, city: "Paris" },
  India: { lat: 28.6139, lng: 77.209, city: "New Delhi" },
  Japan: { lat: 35.6762, lng: 139.6503, city: "Tokyo" },
  "South Korea": { lat: 37.5665, lng: 126.978, city: "Seoul" },
  Brazil: { lat: -23.5505, lng: -46.6333, city: "Sao Paulo" },
  Canada: { lat: 43.6532, lng: -79.3832, city: "Toronto" },
  Australia: { lat: -33.8688, lng: 151.2093, city: "Sydney" },
  Israel: { lat: 31.7683, lng: 35.2137, city: "Tel Aviv" },
  Unknown: { lat: 0, lng: 0, city: "Unknown" },
};

export default function MapWrapper() {
  const { isDarkMode } = useTheme();
  const [threats, setThreats] = useState<ThreatLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const mapApiToThreats = (items: ThreatMapApiItem[]): ThreatLocation[] => {
      const now = Date.now();
      return items.slice(0, 30).map((item, index) => {
        const lookup = COUNTRY_COORDS[item.country] ?? COUNTRY_COORDS.Unknown;
        return {
          id: `dashboard-${item.country}-${index}`,
          ip: "n/a",
          lat: lookup.lat,
          lng: lookup.lng,
          city: lookup.city,
          country: item.country,
          type: `${item.threats} active threat${item.threats > 1 ? "s" : ""}`,
          severity: item.severity,
          time: "live",
          timestamp: now - index * 1000,
        };
      });
    };

    const loadThreatMap = async () => {
      try {
        const data = await apiClient.getThreatMap() as ThreatMapApiItem[];
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setThreats(mapApiToThreats(data));
        } else {
          setThreats([]);
        }
      } catch (error) {
        console.error("Dashboard threat map API failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadThreatMap();
    const interval = setInterval(() => {
      void loadThreatMap();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayThreats = useMemo(() => threats, [threats]);

  return (
    <div
      className={`h-full min-h-[280px] w-full min-w-0 overflow-hidden rounded-xl border transition-theme ${
        isDarkMode ? "border-border bg-card" : "border-border bg-card"
      }`}
    >
      {loading ? (
        <div className="flex h-full min-h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
          Loading threat map...
        </div>
      ) : (
        <ThreatMap threats={displayThreats} />
      )}
    </div>
  );
}
