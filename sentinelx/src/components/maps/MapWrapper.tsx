"use client";

import { useTheme } from "@/context/ThemeContext";
import ThreatMap from "./ThreatMap";

export default function MapWrapper() {
  const { isDarkMode } = useTheme();
  
  return (
    <div
      className={`h-full min-h-[280px] w-full min-w-0 overflow-hidden rounded-xl border transition-theme ${
        isDarkMode ? "border-border bg-card" : "border-border bg-card"
      }`}
    >
      <ThreatMap />
    </div>
  );
}
