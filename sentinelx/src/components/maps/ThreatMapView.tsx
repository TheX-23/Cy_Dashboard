"use client";

import { useEffect, useRef, useState } from "react";
import type { CircleMarkerOptions, Map as LeafletMap, PolylineOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/context/ThemeContext";

export interface ThreatLocation {
  id: string;
  ip: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  time: string;
  timestamp: number;
}

export interface AttackLine {
  id: string;
  from: [number, number];
  to: [number, number];
  severity: string;
}

export interface ThreatMapViewProps {
  threats?: ThreatLocation[];
  attackLines?: AttackLine[];
}

const EMPTY_THREATS: ThreatLocation[] = [];
const EMPTY_LINES: AttackLine[] = [];

const DARK_TILE =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const LIGHT_TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#eab308";
    case "low":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}

function getSeverityRadius(severity: string) {
  switch (severity) {
    case "critical":
      return 12;
    case "high":
      return 10;
    case "medium":
      return 8;
    case "low":
      return 6;
    default:
      return 6;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Imperative Leaflet map (no react-leaflet MapContainer). MapContainer in react-leaflet 4.x
 * uses a ref callback with a stale `context === null` check (empty useCallback deps), which can
 * call `L.map()` twice on the same DOM node under Strict Mode / Turbopack — "already initialized".
 */
export default function ThreatMapView({
  threats,
  attackLines,
}: ThreatMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<import("leaflet").TileLayer | null>(null);
  const overlayRef = useRef<import("leaflet").LayerGroup | null>(null);
  const { isDarkMode } = useTheme();
  const isDarkRef = useRef(isDarkMode);
  isDarkRef.current = isDarkMode;
  const [mapReady, setMapReady] = useState(false);

  const safeThreats = Array.isArray(threats) ? threats : EMPTY_THREATS;
  const safeAttackLines = Array.isArray(attackLines) ? attackLines : EMPTY_LINES;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    void import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const L = mod.default;

      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [30, 0],
        zoom: 2,
        zoomControl: true,
      });
      mapRef.current = map;

      const overlay = L.layerGroup().addTo(map);
      overlayRef.current = overlay;

      const dark = isDarkRef.current;
      const url = dark ? DARK_TILE : LIGHT_TILE;
      const attribution = dark
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      const tile = L.tileLayer(url, {
        attribution,
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
      }).addTo(map);
      tileRef.current = tile;

      requestAnimationFrame(() => {
        map.invalidateSize();
      });

      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      tileRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileRef.current) return;

    void import("leaflet").then((mod) => {
      const L = mod.default;
      const m = mapRef.current;
      const currentTile = tileRef.current;
      if (!m || !currentTile) return;

      m.removeLayer(currentTile);
      const url = isDarkMode ? DARK_TILE : LIGHT_TILE;
      const attribution = isDarkMode
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

      tileRef.current = L.tileLayer(url, {
        attribution,
        subdomains: ["a", "b", "c"],
        maxZoom: 19,
      }).addTo(m);
    });
  }, [isDarkMode]);

  useEffect(() => {
    if (!mapReady) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    void import("leaflet").then((mod) => {
      const L = mod.default;
      const group = overlayRef.current;
      if (!group) return;

      group.clearLayers();

      for (const line of safeAttackLines) {
        const opts: PolylineOptions = {
          color: getSeverityColor(line.severity),
          weight: 2,
          opacity: 0.6,
          dashArray: "5, 10",
        };
        L.polyline([line.from, line.to], opts).addTo(group);
      }

      for (const threat of safeThreats) {
        const c = getSeverityColor(threat.severity);
        const opts: CircleMarkerOptions = {
          radius: getSeverityRadius(threat.severity),
          fillColor: c,
          color: c,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.6,
        };
        const marker = L.circleMarker([threat.lat, threat.lng], opts);
        const popBg = isDarkMode ? "#1f2937" : "#ffffff";
        const popText = isDarkMode ? "#f9fafb" : "#111827";
        const popMuted = isDarkMode ? "#9ca3af" : "#6b7280";
        const popBorder = isDarkMode ? "#374151" : "#e5e7eb";
        const popLink = isDarkMode ? "#60a5fa" : "#2563eb";
        const html = `
          <div style="min-width:200px;border-radius:0.5rem;padding:0.75rem;background:${popBg};color:${popText};box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1)">
            <div style="margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem">
              <div style="border-radius:0.25rem;padding:0.25rem 0.5rem;font-size:0.75rem;font-weight:500;background-color:${c}20;color:${c};border:1px solid ${c}40">
                ${escapeHtml(threat.severity.toUpperCase())}
              </div>
              <span style="font-size:0.75rem;color:${popMuted}">${escapeHtml(threat.time)}</span>
            </div>
            <h4 style="margin-bottom:0.5rem;font-weight:600;font-size:0.875rem">${escapeHtml(threat.type)}</h4>
            <div style="font-size:0.875rem;display:flex;flex-direction:column;gap:0.25rem">
              <div style="display:flex;align-items:center;gap:0.5rem">
                <span style="color:${popMuted}">IP:</span>
                <span style="font-family:monospace;color:${popLink}">${escapeHtml(threat.ip)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <span style="color:${popMuted}">Location:</span>
                <span>${escapeHtml(threat.city)}, ${escapeHtml(threat.country)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <span style="color:${popMuted}">Coordinates:</span>
                <span style="font-family:monospace;font-size:0.75rem">${threat.lat.toFixed(4)}, ${threat.lng.toFixed(4)}</span>
              </div>
            </div>
            <div style="margin-top:0.75rem;border-top:1px solid ${popBorder};padding-top:0.5rem">
              <div style="font-size:0.75rem;color:${popMuted}">Threat ID: ${escapeHtml(threat.id)}</div>
            </div>
          </div>`;
        marker.bindPopup(html);
        marker.addTo(group);
      }
    });
  }, [mapReady, safeThreats, safeAttackLines, isDarkMode]);

  return (
    <div
      ref={containerRef}
      className="z-0 h-full min-h-[280px] w-full rounded-lg"
      style={{
        height: "100%",
        width: "100%",
        background: isDarkMode ? "#0f172a" : "#f1f5f9",
      }}
    />
  );
}
